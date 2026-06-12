import { Link } from "@tanstack/react-router";
import { Search, Heart, User, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[var(--color-hairline)]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link to="/" className="flex flex-col items-start leading-tight shrink-0">
          <span className="text-2xl md:text-3xl font-black tracking-wider text-[var(--color-gold)]">
            MY CAR
          </span>
          <span className="text-[10px] md:text-xs text-[var(--color-ink-soft)] -mt-0.5">
            مركز متكامل للعناية بالسيارات
          </span>
        </Link>

        <div className="flex-1 hidden md:flex">
          <div className="relative w-full max-w-md mx-auto">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-soft)]" />
            <input
              type="search"
              placeholder="ابحث عن منتج أو خدمة..."
              className="w-full bg-white border-2 border-blue-200 focus:border-[var(--color-gold)] outline-none rounded-full py-2 pr-10 pl-4 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 mr-auto md:mr-0">
          <ThemeToggle />
          <button className="p-2 rounded-full hover:bg-[var(--color-surface)]" aria-label="المفضلة">
            <Heart className="w-5 h-5 text-[var(--color-gold)]" />
          </button>
          <Link to="/admin" className="p-2 rounded-full hover:bg-[var(--color-surface)]" aria-label="الحساب">
            <User className="w-5 h-5 text-[var(--color-gold)]" />
          </Link>
          <Link to="/cart" className="relative p-2 rounded-full hover:bg-[var(--color-surface)]" aria-label="السلة">
            <ShoppingCart className="w-5 h-5 text-[var(--color-gold)]" />
            <span className="absolute -top-1 -left-1 bg-[var(--color-gold)] text-[var(--color-ink)] text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
              {count}
            </span>
          </Link>
        </div>
      </div>

      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-soft)]" />
          <input
            type="search"
            placeholder="ابحث..."
            className="w-full bg-white border-2 border-blue-200 focus:border-[var(--color-gold)] outline-none rounded-full py-2 pr-10 pl-4 text-sm"
          />
        </div>
      </div>
    </header>
  );
}
