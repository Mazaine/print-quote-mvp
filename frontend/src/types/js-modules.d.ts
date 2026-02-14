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
}
