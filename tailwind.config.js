/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Verde institucional — usado na navbar e no banner de cada página.
        brand: {
          950: "#001A08",
          900: "#002810",
          800: "#003D1A",
          700: "#00521F",
          600: "#0A6B33",
          500: "#12813F",
        },
        accent: { DEFAULT: "#F7941D", deep: "#C96F08", soft: "#FEF1E1" },
        page: "#EBF0EC",
        line: "#E3E9E4",
        ink: { DEFAULT: "#11241A", soft: "#5D7267", faint: "#94A69B" },
        ok: { DEFAULT: "#16A34A", bright: "#4ADE80", soft: "#E6F6EC" },
        warn: { DEFAULT: "#E5861A", bright: "#FBBF24", soft: "#FDF0E2" },
        bad: { DEFAULT: "#DC2626", bright: "#F87171", soft: "#FDECEC" },
        info: { DEFAULT: "#4F46E5", soft: "#EDECFD" },
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      maxWidth: { shell: "1280px" },
      boxShadow: {
        card: "0 1px 2px rgba(17,36,26,.05), 0 8px 24px -16px rgba(17,36,26,.28)",
        cardHover: "0 2px 4px rgba(17,36,26,.06), 0 18px 34px -18px rgba(17,36,26,.34)",
        pop: "0 12px 40px -18px rgba(17,36,26,.45)",
      },
      backgroundImage: {
        // O `#001A08` como cor sólida antes do gradiente é intencional:
        // evita que extensões/heurísticas de "dark mode automático" do
        // navegador tentem reprocessar a página e lavem o verde.
        banner: "linear-gradient(118deg,#001A08 0%,#003A17 52%,#005522 100%)",
      },
    },
  },
  plugins: [],
};
