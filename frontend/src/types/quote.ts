export type Size = "A6" | "A5" | "A4";
export type Paper = "130g" | "170g";
export type Color = "1+0" | "4+0" | "4+4";
export type Qty = 100 | 250 | 500 | 1000;

export interface QuoteRequest {
  size: Size;
  paper: Paper;
  color: Color;
  qty: Qty;
  lamination: boolean;
}

export interface QuoteBreakdownItem {
  label: string;
  amount: number;
}

export interface QuoteResponse {
  final_price: number;
  currency: "HUF";
  breakdown: QuoteBreakdownItem[];
}

export interface CalculatorCombination {
  size: Size;
  paper: Paper;
  qty: Qty;
  color: Color;
}

export interface CalculatorProductOptions {
  product_code: "flyer";
  label: string;
  options: {
    size: Size[];
    paper: Paper[];
    qty: Qty[];
    color: Color[];
  };
  valid_combinations: CalculatorCombination[];
}

export interface CalculatorCatalogResponse {
  products: CalculatorProductOptions[];
}
