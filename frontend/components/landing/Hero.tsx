import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-fixed/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-fixed/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-fixed/20 border border-primary/10 mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary tracking-wide uppercase">
            Powered by VoxCPM2 AI
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-headline tracking-tight leading-[1.1] text-on-surface max-w-4xl mx-auto">
          Transform Text Into{" "}
          <span className="voxora-gradient-text">Lifelike Speech</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Thiết kế giọng nói độc đáo bằng AI, nhân bản giọng nói chính xác, hoặc để AI tạo ra 
          giọng điệu hoàn hảo. Hỗ trợ hơn 30 ngôn ngữ.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link
            href="/login"
            className="flex items-center gap-2 text-base font-semibold text-on-primary px-8 py-3.5 rounded-xl voxora-gradient shadow-ambient-lg hover:shadow-ambient-xl transition-voxora hover:scale-[1.03] active:scale-[0.97]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Trải nghiệm ngay
          </Link>
          <a
            href="#demo"
            className="flex items-center gap-2 text-base font-semibold text-on-surface-variant px-8 py-3.5 rounded-xl border border-outline-variant/50 hover:border-primary/30 hover:text-primary bg-surface-container-lowest shadow-ambient transition-voxora hover:scale-[1.02]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
            Nghe demo
          </a>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mt-16 text-center">
          <div>
            <p className="text-3xl md:text-4xl font-bold font-headline text-on-surface">30+</p>
            <p className="text-sm text-on-surface-variant mt-1">Ngôn ngữ</p>
          </div>
          <div className="w-px h-10 bg-outline-variant/30 hidden md:block" />
          <div>
            <p className="text-3xl md:text-4xl font-bold font-headline text-on-surface">3</p>
            <p className="text-sm text-on-surface-variant mt-1">Chế độ giọng nói</p>
          </div>
          <div className="w-px h-10 bg-outline-variant/30 hidden md:block" />
          <div>
            <p className="text-3xl md:text-4xl font-bold font-headline text-on-surface">24kHz</p>
            <p className="text-sm text-on-surface-variant mt-1">Studio quality</p>
          </div>
          <div className="w-px h-10 bg-outline-variant/30 hidden md:block" />
          <div>
            <p className="text-3xl md:text-4xl font-bold font-headline text-on-surface">∞</p>
            <p className="text-sm text-on-surface-variant mt-1">Giọng nói có thể tạo</p>
          </div>
        </div>
      </div>
    </section>
  );
}
