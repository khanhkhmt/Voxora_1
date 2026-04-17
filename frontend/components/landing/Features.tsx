const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
      </svg>
    ),
    title: "🎨 Voice Design",
    subtitle: "Tạo giọng nói từ mô tả",
    description:
      "Chỉ cần viết mô tả bằng chữ — ví dụ 'Giọng nữ trẻ, ấm áp, nhẹ nhàng' — và AI sẽ tạo ra giọng nói hoàn toàn mới, chưa từng tồn tại.",
    gradient: "from-primary to-primary-container",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "🎛️ Controllable Cloning",
    subtitle: "Nhái giọng + điều chỉnh cảm xúc",
    description:
      "Upload file audio mẫu rồi thêm hướng dẫn — 'nói vui vẻ hơn, nhanh hơn' — AI sẽ nhái giọng đó nhưng theo phong cách bạn muốn.",
    gradient: "from-secondary to-secondary-container",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20h.01" />
        <path d="M7 20v-4" />
        <path d="M12 20v-8" />
        <path d="M17 20V8" />
        <path d="M22 4v16" />
      </svg>
    ),
    title: "🎙️ Ultimate Cloning",
    subtitle: "Nhái giọng siêu chính xác",
    description:
      "Cung cấp file audio + transcript để AI học giọng nói ở mức cao nhất — gần như không phân biệt được với giọng thật.",
    gradient: "from-tertiary to-tertiary-container",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-16 md:py-24 bg-surface-container-low/50">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-on-surface">
            Ba chế độ tạo giọng nói
          </h2>
          <p className="mt-3 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Từ thiết kế giọng nói mới hoàn toàn đến nhân bản giọng nói chính xác — Voxora hỗ trợ tất cả.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-surface-container-lowest rounded-2xl p-8 shadow-ambient ghost-border transition-voxora hover:shadow-ambient-lg hover:-translate-y-1"
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6 transition-voxora group-hover:scale-110`}>
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold font-headline text-on-surface mb-1.5">
                {feature.title}
              </h3>
              <p className="text-sm font-medium text-primary mb-3">{feature.subtitle}</p>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {feature.description}
              </p>

              {/* Hover gradient line */}
              <div className={`absolute bottom-0 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
