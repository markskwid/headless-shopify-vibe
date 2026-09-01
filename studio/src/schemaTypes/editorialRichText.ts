import { LinkIcon } from "@sanity/icons/Link";
import { TextIcon } from "@sanity/icons/Text";
import { defineArrayMember, defineField, defineType } from "sanity";

export const editorialRichText = defineType({
  name: "editorialRichText",
  title: "Rich text",
  type: "array",
  icon: TextIcon,
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bulleted", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
          { title: "Underline", value: "underline" },
        ],
        annotations: [
          {
            name: "link",
            title: "Link",
            type: "object",
            icon: LinkIcon,
            fields: [
              defineField({
                name: "href",
                title: "Destination",
                type: "string",
                description:
                  "Use a storefront path such as /collections/all, an anchor such as #contact, or a complete https:// URL.",
                validation: (rule) =>
                  rule.required().custom((value) => {
                    if (!value) return true;
                    if (
                      (value.startsWith("/") && !value.startsWith("//")) ||
                      value.startsWith("#")
                    ) {
                      return true;
                    }

                    try {
                      return new URL(value).protocol === "https:"
                        ? true
                        : "External destinations must use https://.";
                    } catch {
                      return "Use an internal path, anchor, or complete https:// URL.";
                    }
                  }),
              }),
              defineField({
                name: "openInNewTab",
                title: "Open in a new tab",
                type: "boolean",
                initialValue: false,
              }),
            ],
          },
        ],
      },
    }),
  ],
});
