import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const STORAGE_KEY = "nyomda_cart";

export interface CartItemSelections {
  size?: string;
  paper?: string;
  color?: string;
  quantity?: number;
  extras?: string[];
}

export interface CartItemUpload {
  fileId: string;
  originalName: string;
  url: string;
  size: number;
  contentType: string;
}

export interface CartItem {
  id: string;
  productSlug: string;
  productName: string;
  productImageUrl: string;
  selections: CartItemSelections;
  upload?: CartItemUpload;
  unitPriceFt: number;
  lineTotalFt: number;
  createdAt: string;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "CLEAR_CART" };

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotalFt: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM":
      return { items: [action.payload, ...state.items] };
    case "REMOVE_ITEM":
      return { items: state.items.filter((item) => item.id !== action.payload) };
    case "CLEAR_CART":
      return { items: [] };
    default:
      return state;
  }
}

function loadInitialCart(): CartState {
  if (typeof window === "undefined") {
    return { items: [] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return { items: [] };
    }

    return { items: parsed };
  } catch {
    return { items: [] };
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadInitialCart);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // Intentionally ignore storage write errors.
    }
  }, [state.items]);

  const value = useMemo<CartContextValue>(() => {
    const subtotalFt = state.items.reduce((sum, item) => sum + item.lineTotalFt, 0);

    return {
      items: state.items,
      itemCount: state.items.length,
      subtotalFt,
      addItem: (item) => dispatch({ type: "ADD_ITEM", payload: item }),
      removeItem: (id) => dispatch({ type: "REMOVE_ITEM", payload: id }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
    };
  }, [state.items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
