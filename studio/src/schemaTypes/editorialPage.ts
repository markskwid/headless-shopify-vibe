import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { defineArrayMember, defineField, defineType } from "sanity";

const RESERVED_SLUGS = new Set([
  "account",
  "api",
  "cart",
  "collections",
  "login",
  "products",
  "register",
  "robots.txt",
  "search",
  "sitemap.xml",
  "studio",
]);

export const editorialPage = defineType({
  name: "editorialPage",
  title: "Editorial page",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: "title",
      title: "Page title",
      type: "string",
      validation: (rule) => rule.required().min(1).max(100),
    }),
    defineField({
      name: "slug",
      title: "URL slug",
      type: "slug",
      description:
        "Creates a root storefront URL such as /about or /shipping-and-returns.",
      options: { source: "title", maxLength: 80 },
      validation: (rule) =>
        rule.required().custom((value) => {
          const slug = value?.current;
          if (!slug) return true;
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
            return "Use lowercase letters, numbers, and single hyphens only.";
          }
          return RESERVED_SLUGS.has(slug)
            ? `/${slug} is reserved by the storefront. Choose another slug.`
            : true;
        }),
    }),
    defineField({
      name: "pageBuilder",
      title: "Page sections",
      type: "array",
      description: "Add and reorder the sections that compose this page.",
      of: [
        defineArrayMember({ type: "pageHero" }),
        defineArrayMember({ type: "richTextSection" }),
        defineArrayMember({ type: "faqSection" }),
        defineArrayMember({ type: "contactSection" }),
        defineArrayMember({ type: "calloutSection" }),
      ],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .max(20)
          .custom((sections) => {
            const pageSections = Array.isArray(sections)
              ? (sections as Array<{ _type?: string }>)
              : [];
            const heroCount = pageSections.filter(
              (section) => section._type === "pageHero",
            ).length;
            if (heroCount > 1) return "A page can contain only one Page hero.";
            if (heroCount === 1 && pageSections[0]?._type !== "pageHero") {
              return "The Page hero must be the first section.";
            }
            return true;
          }),
    }),
    defineField({
      name: "seo",
      title: "Search and social sharing",
      type: "pageSeo",
    }),
  ],
  preview: {
    select: { title: "title", slug: "slug.current", media: "pageBuilder.0.image" },
    prepare({ title, slug, media }) {
      return {
        title: title || "Untitled editorial page",
        subtitle: slug ? `/${slug}` : "Missing URL slug",
        media,
      };
    },
  },
});
