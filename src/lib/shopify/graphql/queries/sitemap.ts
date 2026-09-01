export const SITEMAP_RESOURCES_QUERY = `#graphql
  query SitemapResources($type: SitemapType!, $page: Int!) {
    sitemap(type: $type) {
      pagesCount {
        count
      }
      resources(page: $page) {
        hasNextPage
        items {
          handle
          updatedAt
        }
      }
    }
  }
`;
