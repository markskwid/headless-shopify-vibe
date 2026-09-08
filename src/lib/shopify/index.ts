import "server-only";

export { getShopifyConfig } from "./env";
export { ShopifyRequestError } from "./client";
export { ShopifyCartError } from "./services/cart";
export {
  getCartSnapshotFromCookies,
  toCartSnapshot,
} from "./services/cart-session";
export {
  getStorefrontHome,
  getStorefrontIdentity,
} from "./services/storefront";
export { getAllProducts, getCollection } from "./services/collection";
export { getSitemapResources } from "./services/sitemap";
export {
  getCustomerNewsletterProfile,
  ShopifyCustomerError,
  subscribeCustomerToEmailMarketing,
} from "./services/customer";
export {
  getCustomerAccessTokenFromCookies,
  hasCustomerSession,
} from "./services/customer-session";
export { getHostedCustomerAccountUrl } from "./services/customer-account";
export {
  getPredictiveProducts,
  getProductByHandle,
  getRelatedProducts,
  searchProducts,
} from "./services/search";
export type {
  Cart,
  CartLine,
  CartSnapshot,
} from "./schemas/cart";
export type {
  ProductDetails,
  ProductImage,
  ProductVariant,
  StorefrontProduct,
} from "./schemas/product";
export type {
  CollectionCardData,
  CollectionSortValue,
  ProductFilterInput,
  ProductFilterPriceRange,
  ProductPageInfo,
  ShopifyProductFilter,
} from "./schemas/collection";
export type {
  Customer,
  CustomerAccessToken,
  CustomerNewsletterProfile,
} from "./schemas/customer";
export type { StorefrontHome } from "./schemas/storefront";
export type {
  SitemapResource,
  SitemapResourceType,
} from "./schemas/sitemap";
