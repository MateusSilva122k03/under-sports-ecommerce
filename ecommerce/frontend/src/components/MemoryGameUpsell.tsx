import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Gift, Zap, Timer, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';

const UPSELL_PRODUCTS = [
  {
    id: 'up-album-prata',
    name: 'Álbum Copa 2026 Panini - Edição de Luxo Capa Dura Prata',
    price: 135.45,
    oldPrice: 270.90,
    image: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSP3zbdWbkmyWorTWS5xSZAl9-LlZEpEVE1-L0GAidwchltGMLBJjpFDbKwTcZFbRTqGJJcji1-hTJgeREITnqo--S8G8z6',
    discount: '50% OFF'
  },
  {
    id: 'up-album-ouro',
    name: 'Álbum Copa 2026 Panini - Edição de Luxo Capa Dura Ouro',
    price: 179.94,
    oldPrice: 299.90,
    image: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT6RSnTBwVdV0OhvEYuOMDCwv4mCzXxjb4fJM3NspyPQTLwBXB5jP4tWnZ0MuoNh8B45Y-CRUEIaZ-CQHfX3T5RhLSH6FlX',
    discount: '40% OFF'
  },
  {
    id: 'up-album-luxo',
    name: 'Álbum Copa 2026 Panini - Edição de Luxo Capa Dura',
    price: 99.96,
    oldPrice: 249.90,
    image: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcR68I5EABtOsfKEUMGu7zzzy5KFSYMqX8FQ1N_cUZtKoFwnEG1lk7HiWVCdKshxPC8KYnlHhbznNqxRhLk9ABv50AUf5LN-',
    discount: '60% OFF'
  },
  {
    id: 'up-kit-torcedor',
    name: 'Kit Torcedor Brasil 12 Peças - Ideal Para Copa 2026',
    price: 89.94,
    oldPrice: 149.90,
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_669729-MLB108006690371_032026-F.webp',
    discount: '40% OFF'
  },
  {
    id: 'up-bola-adidas',
    name: 'Bola Adidas Copa do Mundo FIFA 26 Trionda Training',
    price: 124.95,
    oldPrice: 249.90,
    image: 'https://m.media-amazon.com/images/G/32/apparel/rcxgs/tile._CB483369971_.gif',
    discount: '50% OFF'
  }
];

interface Card {
  instanceId: number;
  productId: string;
  image: string;
  name: string;
}

export default function MemoryGameUpsell() {
  const { addItem, showGame, setShowGame } = useCart();
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [lastMatchedProduct, setLastMatchedProduct] = useState<any>(null);
  const [isWon, setIsWon] = useState(false);

  // Initialize game
  useEffect(() => {
    if (showGame) {
      const gameCards: Card[] = [...UPSELL_PRODUCTS, ...UPSELL_PRODUCTS]
        .sort(() => Math.random() - 0.5)
        .map((p, index) => ({
          instanceId: index,
          productId: p.id,
          image: p.image,
          name: p.name
        }));
      setCards(gameCards);
      setFlipped([]);
      setMatched([]);
      setIsWon(false);
      setLastMatchedProduct(null);
    }
  }, [showGame]);

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].productId)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first].productId === cards[second].productId) {
        const productId = cards[first].productId;
        setMatched(prev => [...prev, productId]);
        setFlipped([]);
        
        // Find product info for reward display
        const product = UPSELL_PRODUCTS.find(p => p.id === productId);
        setLastMatchedProduct(product);
        
        // Dopamine hit
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFFFFF', '#00FF00']
        });

        if (matched.length + 1 === UPSELL_PRODUCTS.length) {
          setIsWon(true);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const handleClaim = (product: any) => {
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: 'Único',
      quantity: 1,
    });
    setLastMatchedProduct(null);
    if (isWon) setShowGame(false);
  };

  if (!showGame) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowGame(false)} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-zinc-950 border border-yellow-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.15)] flex flex-col lg:flex-row"
      >
        {/* Close Button */}
        <button 
          onClick={() => setShowGame(false)}
          className="absolute top-4 right-4 z-10 p-2 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* Game Area */}
        <div className="flex-1 p-6 lg:p-10 flex flex-col items-center">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-black italic uppercase tracking-tighter text-white flex items-center justify-center gap-3">
              <Zap className="text-yellow-400 fill-yellow-400" size={28} />
              Desafio da Copa
              <Zap className="text-yellow-400 fill-yellow-400" size={28} />
            </h2>
            <p className="text-zinc-400 text-sm mt-1 uppercase tracking-widest font-bold">
              Encontre os pares e desbloqueie relíquias com até 60% OFF
            </p>
          </div>

          <div className="grid grid-cols-5 gap-2 lg:gap-4 w-full max-w-2xl">
            {cards.map((card, index) => {
              const isFlipped = flipped.includes(index) || matched.includes(card.productId);
              return (
                <motion.div 
                  key={index}
                  onClick={() => handleCardClick(index)}
                  initial={false}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="aspect-[3/4] cursor-pointer relative"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front Side (Cover) */}
                  {!isFlipped ? (
                    <div className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center overflow-hidden">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 border-2 border-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500/30 font-black italic">
                        US
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none" />
                    </div>
                  ) : (
                    /* Back Side (Image Revealed) */
                    <div 
                      className="absolute inset-0 bg-white rounded-lg flex items-center justify-center p-1 lg:p-2 overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]"
                      style={{ transform: 'rotateY(180deg)' }}
                    >
                      <img 
                        src={card.image} 
                        className="w-full h-full object-contain pointer-events-none" 
                        alt="Upsell"
                        referrerPolicy="no-referrer"
                      />
                      {matched.includes(card.productId) && (
                        <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                          <CheckCircle2 className="text-green-600 drop-shadow-md" size={32} />
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md mt-8 h-2 bg-zinc-900 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-yellow-500 shadow-[0_0_10px_#eab308]"
              initial={{ width: 0 }}
              animate={{ width: `${(matched.length / UPSELL_PRODUCTS.length) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-500 mt-2 uppercase font-bold tracking-widest">
            {matched.length} de {UPSELL_PRODUCTS.length} Relíquias Desbloqueadas
          </p>
        </div>

        {/* Reward Sidebar / Overlay */}
        <AnimatePresence>
          {lastMatchedProduct && (
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="w-full lg:w-80 bg-zinc-900/50 border-l border-yellow-500/20 p-6 lg:p-8 flex flex-col items-center justify-center text-center gap-6"
            >
              <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center animate-bounce">
                <Trophy className="text-yellow-500" size={40} />
              </div>
              
              <div>
                <span className="bg-yellow-500 text-zinc-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter mb-2 inline-block">
                  {lastMatchedProduct.discount} DESBLOQUEADO
                </span>
                <h3 className="text-xl font-bold text-white leading-tight">{lastMatchedProduct.name}</h3>
              </div>

              <div className="relative group">
                <img src={lastMatchedProduct.image} className="w-32 h-32 object-contain" alt="Reward" />
                <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded italic transform rotate-12">
                  OFERTA ÚNICA
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-sm line-through">R$ {lastMatchedProduct.oldPrice.toFixed(2).replace('.', ',')}</span>
                <span className="text-3xl font-black text-white italic tracking-tighter">R$ {lastMatchedProduct.price.toFixed(2).replace('.', ',')}</span>
              </div>

              <button
                onClick={() => handleClaim(lastMatchedProduct)}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-black py-4 rounded-2xl uppercase italic tracking-tighter flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(234,179,8,0.3)] active:scale-95 transition-all"
              >
                Resgatar Agora <Gift size={20} />
              </button>

              <button 
                onClick={() => setLastMatchedProduct(null)}
                className="text-zinc-500 text-xs font-bold uppercase hover:text-zinc-300 transition-colors"
              >
                Continuar Jogando
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Victory Message */}
        {isWon && !lastMatchedProduct && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-10 text-center bg-zinc-950/80 backdrop-blur-sm">
             <Trophy className="text-yellow-500 mb-4 animate-pulse" size={80} />
             <h2 className="text-4xl font-black italic text-white mb-2 uppercase tracking-tighter">Mestre da Copa!</h2>
             <p className="text-zinc-400 mb-8 max-w-sm font-bold uppercase text-sm tracking-widest leading-relaxed">
               Você encontrou todas as relíquias. Suas ofertas foram aplicadas e estão prontas para o checkout!
             </p>
             <button
                onClick={() => setShowGame(false)}
                className="bg-white text-zinc-950 px-10 py-4 rounded-2xl font-black uppercase italic tracking-tighter hover:bg-zinc-200 transition-all"
              >
                Finalizar Compra
              </button>
          </div>
        )}
      </motion.div>
      
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
