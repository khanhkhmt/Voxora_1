import Link from "next/link";

export default function Header() {
  return (
    <nav className="fixed top-0 w-full z-50 glass-nav shadow-ambient">
      <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg voxora-gradient flex items-center justify-center transition-voxora group-hover:scale-105">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor" opacity="0.3"/>
              <path d="M8 13l2 2 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight font-headline text-on-surface">
            Voxora
          </span>
        </Link>

        {/* Nav Links — Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-voxora">
            Features
          </a>
          <a href="#demo" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-voxora">
            Demo
          </a>
          <a href="#use-cases" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-voxora">
            Use Cases
          </a>
          <a href="#testimonials" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-voxora">
            Reviews
          </a>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface px-4 py-2 transition-voxora"
          >
            Đăng nhập
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-on-primary px-5 py-2.5 rounded-xl voxora-gradient shadow-ambient hover:shadow-ambient-lg transition-voxora hover:scale-[1.02] active:scale-[0.98]"
          >
            Bắt đầu miễn phí
          </Link>
        </div>
      </div>
    </nav>
  );
}
