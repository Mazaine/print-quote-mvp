declare module "*.jsx" {
  const Component: any;
  export default Component;
}

declare module "*.js" {
  const value: any;
  export default value;
  export const fetchProducts: any;
}
