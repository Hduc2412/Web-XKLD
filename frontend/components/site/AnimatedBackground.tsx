/**
 * Nền động phía sau nội dung.
 *
 * Vẽ hoàn toàn bằng CSS và SVG, không tải một tấm ảnh nào. Lý do: phần lớn ứng
 * viên vào bằng điện thoại và bằng mạng di động, một ảnh nền vài trăm KB làm
 * trang trắng thêm vài giây — đúng lúc người ta dễ bỏ đi nhất. Cách này nặng
 * gần bằng không và không bao giờ vỡ khi phóng to.
 *
 * Mô típ lấy từ Nhật Bản: sóng seigaiha, cánh hoa rơi, và vòng tròn mặt trời.
 * Biên độ chuyển động cố ý nhỏ và chu kỳ dài, để mắt thấy trang "có thở" mà
 * không bị kéo sự chú ý khỏi chữ.
 */

type Variant = "hero" | "soft" | "dark";

const PETALS = [
  { left: "8%", delay: "0s", duration: "17s", size: 10, opacity: 0.5 },
  { left: "21%", delay: "4s", duration: "22s", size: 7, opacity: 0.4 },
  { left: "37%", delay: "9s", duration: "19s", size: 12, opacity: 0.35 },
  { left: "54%", delay: "2s", duration: "25s", size: 8, opacity: 0.45 },
  { left: "68%", delay: "12s", duration: "20s", size: 11, opacity: 0.3 },
  { left: "83%", delay: "6s", duration: "23s", size: 9, opacity: 0.4 },
  { left: "93%", delay: "15s", duration: "18s", size: 7, opacity: 0.35 },
];

export default function AnimatedBackground({
  variant = "hero",
  petals = true,
}: {
  variant?: Variant;
  petals?: boolean;
}) {
  const isDark = variant === "dark";

  return (
    // aria-hidden: đây thuần là trang trí, trình đọc màn hình không cần biết.
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className={
          isDark
            ? "absolute inset-0 bg-ink-900"
            : "absolute inset-0 bg-gradient-to-b from-brand-50/70 via-white to-white"
        }
      />

      {/* Ba khối màu mờ trôi chậm, tạo chiều sâu cho nền phẳng. */}
      <div
        className={`absolute -left-24 -top-32 h-[28rem] w-[28rem] rounded-full blur-3xl animate-drift ${
          isDark ? "bg-brand-700/25" : "bg-brand-200/50"
        }`}
      />
      <div
        className={`absolute -right-32 top-10 h-[32rem] w-[32rem] rounded-full blur-3xl animate-drift-slow ${
          isDark ? "bg-sky-500/10" : "bg-sky-200/40"
        }`}
        style={{ animationDelay: "-12s" }}
      />
      <div
        className={`absolute bottom-[-14rem] left-1/3 h-[26rem] w-[26rem] rounded-full blur-3xl animate-drift ${
          isDark ? "bg-amber-400/10" : "bg-amber-100/60"
        }`}
        style={{ animationDelay: "-24s" }}
      />

      {/* Vòng tròn mặt trời, mô típ trên quốc kỳ Nhật Bản. */}
      {variant !== "soft" && (
        <div
          className={`absolute right-[6%] top-[12%] h-40 w-40 rounded-full border-[3px] md:h-56 md:w-56 ${
            isDark ? "border-brand-500/25" : "border-brand-300/40"
          }`}
        />
      )}

      {/* Hoa văn sóng seigaiha chạy dọc mép dưới. Ở đầu trang phụ, dải này mỏng
          và nhạt hơn: các trang đó có phần đầu thấp nên cùng một độ đậm sẽ chiếm
          tỷ lệ lớn và tranh chỗ với chữ. */}
      <div
        className={`pattern-seigaiha absolute inset-x-0 bottom-0 ${
          variant === "soft" ? "h-14 text-brand-300/10" : "h-24"
        } ${isDark ? "text-white/10" : variant === "hero" ? "text-brand-300/20" : ""}`}
      />

      {petals && (
        <div className="absolute inset-0">
          {PETALS.map((petal) => (
            <span
              key={petal.left}
              className="absolute top-0 animate-fall"
              style={{
                left: petal.left,
                animationDelay: petal.delay,
                animationDuration: petal.duration,
                opacity: petal.opacity,
              }}
            >
              <Petal size={petal.size} dark={isDark} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Một cánh hoa anh đào, vẽ bằng hai đường cong. */
function Petal({ size, dark }: { size: number; dark: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1c3 2.6 5 5 5 7.6A5 5 0 0 1 8 15a5 5 0 0 1-5-6.4C3 6 5 3.6 8 1Z"
        fill={dark ? "#f7a6a6" : "#ef7172"}
      />
    </svg>
  );
}
