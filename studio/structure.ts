import { CogIcon } from "@sanity/icons/Cog";
import { HomeIcon } from "@sanity/icons/Home";
import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .id("homePage")
        .title("Homepage")
        .icon(HomeIcon)
        .child(
          S.document()
            .schemaType("homePage")
            .documentId("homePage")
            .title("Homepage"),
        ),
      S.listItem()
        .id("siteSettings")
        .title("Site settings")
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .title("Site settings"),
        ),
    ]);
