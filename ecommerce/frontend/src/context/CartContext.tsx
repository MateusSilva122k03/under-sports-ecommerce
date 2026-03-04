import { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
  isGift?: boolean; // Indica se é um item de brinde
  giftOfId?: string; // ID do produto principal que este brinde está associado
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem, giftItem?: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (item: CartItem, giftItem?: CartItem) => {
    setItems(prev => {
      const existing = prev.find(
        i => i.productId === item.productId && i.size === item.size && !i.isGift
      );
      
      let newItems = [...prev];
      
      if (existing) {
        newItems = newItems.map(i =>
          i.id === existing.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        newItems = [...newItems, item];
      }
      
      // Adicionar o item de brinde se existir (Promoções Compre X Leve Y)
      if (giftItem) {
        const existingGift = newItems.find(
          i => i.productId === giftItem.productId && i.size === giftItem.size && i.isGift && i.giftOfId === item.id
        );
        
        // Pague 2 Leve 4: Se quantity for >= 2, e não for o Compre 1 Leve 2 selecionado ativamente com produto diferente,
        // geramos os brindes baseado na quantidade (1 brinde pra cada 1 comprado)
        let giftQuantityToAdd = giftItem.quantity;
        if (item.quantity >= 2 && item.productId === giftItem.productId) {
           // É o mesmo produto, acionou Pague 2 Leve 4 automático
           giftQuantityToAdd = item.quantity; // 2 comprados = 2 grátis (total 4)
        }
        
        if (existingGift) {
          newItems = newItems.map(i =>
            i.id === existingGift.id
              ? { ...i, quantity: i.quantity + giftQuantityToAdd }
              : i
          );
        } else {
          newItems = [...newItems, { ...giftItem, quantity: giftQuantityToAdd }];
        }
      }
      
      return newItems;
    });
    setIsOpen(true);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id && i.giftOfId !== id)); // Remove o item e seus brindes
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prev => {
      let nextItems = prev.map(i => (i.id === id ? { ...i, quantity } : i));
      
      // Atualiza a quantidade do brinde se for "Pague 2 Leve 4" (mesmo produto)
      const mainItem = nextItems.find(i => i.id === id && !i.isGift);
      if (mainItem && mainItem.quantity >= 2) {
          nextItems = nextItems.map(i => 
             i.giftOfId === id && i.productId === mainItem.productId ? { ...i, quantity: mainItem.quantity } : i
          );
      } else if (mainItem && mainItem.quantity < 2) {
          // Se baixar de 2, removemos o brinde automático "Pague 2 Leve 4" se ele for do mesmo produto
          nextItems = nextItems.filter(i => !(i.giftOfId === id && i.productId === mainItem.productId && i.isGift));
      }
      
      return nextItems;
    });
  };

  const clearCart = () => setItems([]);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
