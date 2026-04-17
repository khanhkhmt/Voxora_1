const USE_CASES = [
  {
    emoji: "🎙️",
    title: "Content Creation",
    description: "Tạo voiceover chuyên nghiệp cho video YouTube, podcast, và social media content.",
  },
  {
    emoji: "📚",
    title: "E-Learning",
    description: "Biến tài liệu giảng dạy thành audio sống động cho khóa học online và training.",
  },
  {
    emoji: "📖",
    title: "Audiobooks",
    description: "Chuyển đổi sách, truyện ngắn thành audiobook với giọng đọc tự nhiên đa ngôn ngữ.",
  },
  {
    emoji: "💬",
    title: "Customer Service",
    description: "Xây dựng hệ thống IVR và chatbot thoại với giọng nói thương hiệu riêng.",
  },
];

export default function UseCases() {
  return (
    <section id="use-cases" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-on-surface">
            Ứng dụng đa dạng
          </h2>
          <p className="mt-3 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Từ sáng tạo nội dung đến chăm sóc khách hàng — Voxora phù hợp với mọi nhu cầu.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {USE_CASES.map((item, index) => (
            <div
              key={index}
              className="group text-center p-6 rounded-2xl bg-surface-container-lowest shadow-ambient ghost-border transition-voxora hover:shadow-ambient-lg hover:-translate-y-1"
            >
              <div className="text-4xl mb-4 transition-voxora group-hover:scale-110">
                {item.emoji}
              </div>
              <h3 className="text-base font-bold font-headline text-on-surface mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
