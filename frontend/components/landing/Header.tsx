import Link from "next/link";

export default function Header() {
  return (
    <nav className="fixed top-0 w-full z-50 glass-nav shadow-ambient">
      <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/oriagent-icon.svg" alt="Oriagent" className="w-9 h-9 rounded-lg transition-voxora group-hover:scale-105" />
          <span className="text-xl font-bold tracking-tight font-headline text-on-surface">
            Oriagent<span className="text-primary">.</span>
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
