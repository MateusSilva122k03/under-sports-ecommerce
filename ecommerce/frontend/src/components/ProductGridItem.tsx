import { type MouseEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

interface ProductGridItemProps {
  id: string;
  name: string;
  image: string;
  price: number;
}

const FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect fill='%23171717' width='400' height='500'/%3E%3Ctext fill='%23444' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle'%3ESem imagem%3C/text%3E%3C/svg%3E";

export default function ProductGridItem({ id, name, image, price }: ProductGridItemProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [imageError, setImageError] = useState(false);

  const handleClick = () => navigate(`/product/${id}`);

  const handleAddToCart = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigate(`/product/${id}`);
  };

  const isBrazil = name.toLowerCase().includes('brasil');

  return (
    <div
      onClick={handleClick}
      className={`bg-zinc-900 rounded-lg overflow-hidden flex flex-col h-full cursor-pointer group ring-1 transition-all duration-200 ${isBrazil ? 'ring-yellow-400 ring-2' : 'ring-transparent hover:ring-zinc-700'}`}
    >
      {/* Image */}
      <div className="aspect-[3/4] bg-zinc-800 relative overflow-hidden">
        <img
          src={imageError ? FALLBACK : image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          onError={() => setImageError(true)}
          loading="lazy"
        />

        {/* Hover overlay for desktop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex flex-col justify-end p-3">
          <button
            onClick={handleAddToCart}
            className="w-full bg-white text-zinc-950 py-2 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-zinc-100 transition-colors"
          >
            Ver Detalhes
          </button>
        </div>
      </div>

      {/* Text and Button Container */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-sm font-medium text-zinc-200 line-clamp-2 mb-1 leading-snug group-hover:text-white transition-colors">
          {name}
        </h3>
        <div className="flex flex-col gap-0.5 mb-3">
          <p className="text-white font-bold text-base">
            R$&nbsp;{price.toFixed(2).replace('.', ',')}
          </p>
        </div>
        
        {/* Mobile/Always visible CTA button */}
        <button
          onClick={handleAddToCart}
          className="mt-auto w-full bg-zinc-100 text-zinc-950 py-2 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-white transition-colors"
        >
          Comprar
        </button>
      </div>
    </div>
  );
}
