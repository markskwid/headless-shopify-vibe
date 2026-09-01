import { z } from "zod";

const contentLengthSchema = z.coerce.number().int().nonnegative();

export class WebhookRequestError extends Error {
  public readonly status: 400 | 413 | 415;

  constructor(
    message: string,
    status: 400 | 413 | 415,
  ) {
    super(message);
    this.name = "WebhookRequestError";
    this.status = status;
  }
}

export async function readBoundedJsonBody(
  request: Request,
  maximumBytes: number,
) {
  const contentType = request.headers.get("content-type")?.toLowerCase();

  if (!contentType?.startsWith("application/json")) {
    throw new WebhookRequestError("Expected an application/json body.", 415);
  }

  const declaredLength = request.headers.get("content-length");

  if (declaredLength) {
    const parsedLength = contentLengthSchema.safeParse(declaredLength);

    if (!parsedLength.success) {
      throw new WebhookRequestError("Invalid Content-Length header.", 400);
    }

    if (parsedLength.data > maximumBytes) {
      throw new WebhookRequestError("Webhook payload is too large.", 413);
    }
  }

  const body = new Uint8Array(await request.arrayBuffer());

  if (body.byteLength > maximumBytes) {
    throw new WebhookRequestError("Webhook payload is too large.", 413);
  }

  if (!body.byteLength) {
    throw new WebhookRequestError("Webhook payload is empty.", 400);
  }

  return body;
}
