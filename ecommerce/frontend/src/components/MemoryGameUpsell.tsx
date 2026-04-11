import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Gift, Zap, CheckCircle2 } from 'lucide-react';
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
    image: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSEXCbXaJGnvzV_lE4PuqMUiGhyNaqJr2uMwP3bnYrreNNBExLy9D-DbmRbXuFKLBmIErHyTpnjCtWsjqQrpnadwBX_p3nvEjqpTjVLxQ8jYldmqvgADGiY',
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
  const [claimedIds, setClaimedIds] = useState<string[]>([]);

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
      setClaimedIds([]);
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
        const product = UPSELL_PRODUCTS.find(p => p.id === productId);
        setLastMatchedProduct(product);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#FFD700', '#FFFFFF', '#00FF00'] });
        if (matched.length + 1 === UPSELL_PRODUCTS.length) setTimeout(() => setIsWon(true), 1500);
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
    setClaimedIds(prev => [...prev, product.id]);
    setLastMatchedProduct(null);
  };

  if (!showGame) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 text-white">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setShowGame(false)} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full h-full sm:h-auto sm:max-w-4xl max-h-screen sm:max-h-[90vh] bg-zinc-950 border-0 sm:border border-yellow-500/30 rounded-none sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row"
      >
        <button 
          onClick={() => setShowGame(false)}
          className="absolute top-4 right-4 z-[60] p-2 bg-black/50 rounded-full text-zinc-400 hover:text-white"
        >
          <X size={24} />
        </button>

        {/* Game Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col items-center overflow-y-auto">
          <div className="text-center mb-6 sm:mb-8 pt-8 sm:pt-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black italic uppercase tracking-tighter flex items-center justify-center gap-3">
              <Zap className="text-yellow-400 fill-yellow-400" size={24} />
              Desafio da Copa
              <Zap className="text-yellow-400 fill-yellow-400" size={24} />
            </h2>
            <p className="text-zinc-500 text-[10px] sm:text-xs mt-1 uppercase tracking-widest font-bold">Encontre os pares e ganhe descontos</p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4 w-full max-w-2xl">
            {cards.map((card, index) => {
              const isFlipped = flipped.includes(index) || matched.includes(card.productId);
              return (
                <motion.div 
                  key={index}
                  onClick={() => handleCardClick(index)}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  className="aspect-[3/4] cursor-pointer relative"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {!isFlipped ? (
                    <div className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center overflow-hidden">
                      <span className="text-yellow-500/30 font-black italic text-sm sm:text-base">US</span>
                    </div>
                  ) : (
                    <div 
                      className="absolute inset-0 bg-white rounded-lg flex items-center justify-center p-1 overflow-hidden"
                      style={{ transform: 'rotateY(180deg)' }}
                    >
                      <img src={card.image} className="w-full h-full object-contain" alt="P" referrerPolicy="no-referrer" />
                      {matched.includes(card.productId) && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <CheckCircle2 className="text-green-600" size={24} />
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="w-full max-w-xs mt-8 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
            <motion.div className="h-full bg-yellow-500" animate={{ width: `${(matched.length / UPSELL_PRODUCTS.length) * 100}%` }} />
          </div>
        </div>

        {/* Reward Bottom Bar / Sidebar */}
        <AnimatePresence>
          {lastMatchedProduct && (
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute inset-x-0 bottom-0 lg:relative lg:inset-auto lg:w-80 bg-zinc-900 border-t lg:border-t-0 lg:border-l border-yellow-500/30 p-6 z-50 shadow-2xl flex flex-col items-center text-center gap-4"
            >
              <div className="flex flex-row lg:flex-col items-center gap-4">
                <img src={lastMatchedProduct.image} className="w-20 h-20 lg:w-32 lg:h-32 object-contain" alt="R" />
                <div className="text-left lg:text-center flex-1">
                  <span className="bg-yellow-500 text-zinc-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase mb-1 inline-block">{lastMatchedProduct.discount} OFF</span>
                  <h3 className="text-xs lg:text-base font-bold leading-tight mb-1">{lastMatchedProduct.name}</h3>
                  <div className="flex items-baseline gap-2 lg:justify-center">
                    <span className="text-zinc-500 text-[10px] line-through">R$ {lastMatchedProduct.oldPrice.toFixed(2)}</span>
                    <span className="text-xl lg:text-2xl font-black text-yellow-400 italic">R$ {lastMatchedProduct.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="w-full flex gap-2">
                <button onClick={() => handleClaim(lastMatchedProduct)} className="flex-1 bg-yellow-500 text-zinc-950 font-black py-3 rounded-xl uppercase italic text-xs">Resgatar Oferta</button>
                <button onClick={() => setLastMatchedProduct(null)} className="lg:hidden p-3 bg-zinc-800 text-zinc-400 rounded-xl"><X size={20} /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Victory Screen */}
        {isWon && !lastMatchedProduct && (
          <div className="absolute inset-0 z-[70] flex flex-col items-center justify-start p-6 lg:p-10 text-center bg-zinc-950 overflow-y-auto pt-16">
             <Trophy className="text-yellow-500 mb-2 animate-bounce" size={48} />
             <h2 className="text-2xl sm:text-4xl font-black italic text-white mb-1 uppercase tracking-tighter">Mestre da Copa!</h2>
             <p className="text-zinc-500 mb-6 font-bold uppercase text-[10px] tracking-widest">Resgate suas ofertas exclusivas agora!</p>
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-4xl mb-24">
               {UPSELL_PRODUCTS.map((p) => {
                 const isClaimed = claimedIds.includes(p.id);
                 return (
                   <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col items-center gap-2 relative">
                     <div className="absolute top-1 left-1 bg-yellow-500 text-zinc-950 text-[7px] font-black px-1.5 py-0.5 rounded-full">{p.discount}</div>
                     <img src={p.image} className="w-16 h-16 object-contain" alt="P" referrerPolicy="no-referrer" />
                     <h3 className="text-[9px] font-bold leading-tight h-6 line-clamp-2">{p.name}</h3>
                     <div className="flex flex-col items-center">
                       <span className="text-zinc-500 text-[8px] line-through">R$ {p.oldPrice.toFixed(2)}</span>
                       <span className="text-sm font-black text-yellow-400 italic">R$ {p.price.toFixed(2)}</span>
                     </div>
                     <button onClick={() => handleClaim(p)} disabled={isClaimed} className={`w-full py-2 rounded-lg font-black uppercase text-[9px] italic ${isClaimed ? 'bg-zinc-800 text-green-500' : 'bg-yellow-500 text-zinc-950'}`}>
                       {isClaimed ? 'Adicionado' : 'Resgatar'}
                     </button>
                   </div>
                 );
               })}
             </div>
             <div className="fixed bottom-0 inset-x-0 p-4 bg-zinc-950 z-[80] flex justify-center">
               <button onClick={() => setShowGame(false)} className="bg-white text-zinc-950 w-full max-w-sm py-4 rounded-2xl font-black uppercase italic tracking-tighter">Ir para o Carrinho</button>
             </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
