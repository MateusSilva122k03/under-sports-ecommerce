import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import ProductCard from './ProductCard';
import SectionTitle from './SectionTitle';

interface ProductCarouselProps {
  title: string;
  products: any[];
}

export default function ProductCarousel({ title, products }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -(clientWidth * 0.8) : clientWidth * 0.8,
      behavior: 'smooth',
    });
  };

  // Drag and Swipe logic
  const startDrag = (e: ReactMouseEvent | ReactTouchEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    
    // Support both Mouse and Touch
    const pageX = 'touches' in e ? e.touches[0].pageX : (e as ReactMouseEvent).pageX;
    
    setStartX(pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const endDrag = () => {
    setIsDragging(false);
  };

  const onDrag = (e: ReactMouseEvent | ReactTouchEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault(); // Prevent text selection/native behavior
    
    const pageX = 'touches' in e ? e.touches[0].pageX : (e as ReactMouseEvent).pageX;
    const x = pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll fast
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  if (products.length === 0) return null;

  return (
    <section className="py-10 lg:py-14 bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <SectionTitle title={title} className="mb-6 lg:mb-8" />

        <div className="relative group">
          {/* Left arrow */}
          <button
            onClick={() => scroll('left')}
            className="hidden lg:flex absolute left-0 top-1/3 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-zinc-800 hover:bg-zinc-700 items-center justify-center rounded-full text-zinc-400 hover:text-white shadow-lg opacity-40 group-hover:opacity-100 transition-all"
            aria-label="Rolar para esquerda"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Carousel track */}
          <div
            ref={scrollRef}
            onMouseDown={startDrag}
            onMouseLeave={endDrag}
            onMouseUp={endDrag}
            onMouseMove={onDrag}
            onTouchStart={startDrag}
            onTouchEnd={endDrag}
            onTouchMove={onDrag}
            className={`flex overflow-x-auto hide-scrollbar gap-4 lg:gap-5 pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 touch-pan-x select-none ${isDragging ? 'cursor-grabbing snap-none' : 'cursor-grab snap-x snap-mandatory'}`}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {products.map((product, index) => (
              <div
                key={product.id || index}
                className="snap-start shrink-0 w-[155px] sm:w-[175px] md:w-[195px] lg:w-[230px]"
                style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
              >
                <ProductCard
                  id={product.id}
                  name={product.name}
                  image={product.image}
                  price={product.price}
                />
              </div>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll('right')}
            className="hidden lg:flex absolute right-0 top-1/3 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-zinc-800 hover:bg-zinc-700 items-center justify-center rounded-full text-zinc-400 hover:text-white shadow-lg opacity-40 group-hover:opacity-100 transition-all"
            aria-label="Rolar para direita"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
