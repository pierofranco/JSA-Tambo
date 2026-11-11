import { useReducer, useEffect } from 'react';
import { ItemCarrito, Producto } from '../types/pos';

export type CartAction =
  | { type: 'ADD_ITEM'; payload: Producto }
  | { type: 'CHANGE_QUANTITY'; payload: { id: string; delta: number; maxStock: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR_CART' };

const CART_STORAGE_KEY = 'tambopos_cart';

function cartReducer(state: ItemCarrito[], action: CartAction): ItemCarrito[] {
  switch (action.type) {
    case 'ADD_ITEM': {
      const prod = action.payload;
      const index = state.findIndex(item => item.id === prod.id);

      if (index >= 0) {
        if (state[index].cantidad + 1 > prod.stock) {
          return state;
        }
        return state.map((item, idx) =>
          idx === index ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      } else {
        return [
          ...state,
          {
            id: prod.id,
            nombre: prod.nombre,
            categoria: prod.categoria,
            precioRegular: prod.precioRegular,
            precioOferta: prod.precioOferta,
            cantidad: 1
          }
        ];
      }
    }

    case 'CHANGE_QUANTITY': {
      const { id, delta, maxStock } = action.payload;
      const item = state.find(i => i.id === id);
      if (!item) return state;

      const newQty = item.cantidad + delta;
      if (newQty <= 0) {
        return state.filter(i => i.id !== id);
      }
      if (newQty > maxStock) {
        return state;
      }

      return state.map(i => (i.id === id ? { ...i, cantidad: newQty } : i));
    }

    case 'REMOVE_ITEM':
      return state.filter(item => item.id !== action.payload.id);

    case 'CLEAR_CART':
      return [];

    default:
      return state;
  }
}

export function useCartReducer() {
  const [cart, dispatch] = useReducer(cartReducer, [], () => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  return { cart, dispatch };
}

