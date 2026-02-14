declare module "*.jsx" {
  const Component: any;
  export default Component;
}

declare module "*.js" {
  const value: any;
  export default value;
  export const fetchProducts: any;
  export const fetchProductBySlug: any;
  export const fetchCatalog: any;
  export const fetchHealth: any;
  export const requestQuote: any;
  export const submitQuoteRequest: any;
  export const uploadFile: any;
  export const fetchAnchors: any;
  export const createAnchorPrice: any;
  export const updateAnchorPrice: any;
  export const deleteAnchorPrice: any;
  export const bulkUpdateAnchorPrices: any;
  export const bulkDeleteAnchorPrices: any;
  export const fetchAdminOrders: any;
  export const fetchAdminOrder: any;
  export const updateAdminOrder: any;
  export const bulkUpdateAdminOrderStatus: any;
}
