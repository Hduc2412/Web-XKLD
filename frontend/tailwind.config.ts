import type { Config } from "tailwindcss";

/**
 * Màu thương hiệu đỏ #cb1d1e trước đây được viết cứng ở hơn hai chục chỗ trong
 * mã nguồn. Đưa vào đây để đổi một lần là đổi cả trang, và để dải màu có đủ sắc
 * độ dùng cho nền nhạt, viền và chữ thay vì chỉ một màu duy nhất.
 */
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fef2f2",
          100: "#fde3e3",
          200: "#fbcbcb",
          300: "#f7a6a6",
          400: "#ef7172",
          500: "#e14344",
          600: "#cb1d1e",
          700: "#a81718",
          800: "#8b1718",
          900: "#741a1a",
        },
        // Xanh chàm dùng cho khối thông tin và nền tối, để trang không chỉ có
        // đỏ và trắng. Đỏ chỉ dành cho nút hành động và điểm nhấn.
        ink: {
          50: "#f6f7f9",
          700: "#2a3442",
          800: "#1f2733",
          900: "#171b22",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "Segoe UI", "sans-serif"],
      },
      maxWidth: {
        container: "72rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,.04), 0 8px 24px -12px rgba(15,23,42,.18)",
        lift: "0 2px 4px rgba(15,23,42,.04), 0 18px 40px -16px rgba(203,29,30,.35)",
      },
      keyframes: {
        // Nền động: các khối màu trôi rất chậm. Biên độ nhỏ và thời gian dài để
        // chuyển động gần như không nhận ra khi đọc chữ, chỉ thấy trang "có thở".
        drift: {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "33%": { transform: "translate3d(3%,-4%,0) scale(1.06)" },
          "66%": { transform: "translate3d(-3%,3%,0) scale(0.96)" },
        },
        fall: {
          "0%": { transform: "translate3d(0,-10%,0) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translate3d(2rem,110vh,0) rotate(240deg)", opacity: "0" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translate3d(0,12px,0)" },
          "100%": { opacity: "1", transform: "translate3d(0,0,0)" },
        },
        sheen: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        drift: "drift 38s ease-in-out infinite",
        "drift-slow": "drift 56s ease-in-out infinite",
        fall: "fall linear infinite",
        rise: "rise .5s ease-out both",
        sheen: "sheen 6s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
