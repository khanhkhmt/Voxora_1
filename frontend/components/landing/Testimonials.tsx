const TESTIMONIALS = [
  {
    name: "Minh Trần",
    role: "Content Creator",
    avatar: "MT",
    rating: 5,
    text: "Voxora giúp tôi tạo voiceover cho video YouTube chỉ trong vài phút. Chất lượng giọng nói cực kỳ tự nhiên, không ai tin là AI tạo ra!",
  },
  {
    name: "Sarah Chen",
    role: "E-Learning Designer",
    avatar: "SC",
    rating: 5,
    text: "The voice cloning feature is incredible. I recorded 30 seconds of my voice and now I can generate hours of teaching content that sounds exactly like me.",
  },
  {
    name: "Đức Nguyễn",
    role: "Podcast Producer",
    avatar: "ĐN",
    rating: 5,
    text: "Tính năng Voice Design thực sự ấn tượng — tôi chỉ cần mô tả giọng nói mong muốn và Voxora tạo ra chính xác những gì tôi cần.",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-16 md:py-24 bg-surface-container-low/50">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-on-surface">
            Người dùng nói gì?
          </h2>
          <p className="mt-3 text-on-surface-variant text-lg">
            Hàng nghìn người sáng tạo tin dùng Voxora mỗi ngày
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item, index) => (
            <div
              key={index}
              className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient ghost-border transition-voxora hover:shadow-ambient-lg"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6 italic">
                &ldquo;{item.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary-container flex items-center justify-center text-white text-sm font-bold">
                  {item.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">{item.name}</p>
                  <p className="text-xs text-on-surface-variant">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
