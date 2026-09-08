/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },

      /**
       * HARAKAT — "Ledger" dizayn tili (dars soatlari va maosh paneli).
       *
       * ⚠️ ADMIN PANELIDAGI BILAN AYNAN BIR XIL QIYMATLAR. Ikkala panelda
       * bir xil ekran bor ("dars soatim") va harakat tezligi farq qilsa,
       * bir odam ikki panelda ikki xil mahsulot ko'rgan bo'lardi.
       * Nusxa ATAYLAB: panellar alohida repo, umumiy config yo'q.
       *
       * ⚠️ FAQAT `motion-safe:` bilan ishlatiladi — `prefers-reduced-motion`
       * yoqilgan foydalanuvchida hech narsa qimirlamaydi.
       *
       * ⚠️ UZLUKSIZ HARAKAT IKKITA: `tide` (hero foni) va `pulse-ring`
       * (jonli nuqta). Uchinchisi qo'shilmaydi — uchta mustaqil takroriy
       * harakat ekranni "reklama banneri" qilib qo'yardi.
       *
       * `flow-dash` bu panelda hozircha ishlatilmaydi (oqim sxemasi faqat
       * admin panelida), lekin ro'yxatda turadi: ikki konfiguratsiya
       * bir-biridan ajralib ketmasligi kerak. Ishlatilmagan animatsiya
       * chiqadigan CSS'ga bir bayt ham qo'shmaydi.
       */
      transitionTimingFunction: {
        "out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
        "in-out-sine": "cubic-bezier(0.37, 0, 0.63, 1)",
      },
      keyframes: {
        post: {
          "0%": { opacity: "0", transform: "translateY(11px)" },
          "55%": { opacity: "1" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "rail-draw": {
          "0%": { transform: "scaleY(0)" },
          "100%": { transform: "scaleY(1)" },
        },
        "flow-dash": {
          "0%": { strokeDashoffset: "28" },
          "100%": { strokeDashoffset: "0" },
        },
        tide: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "1" },
        },
        "pulse-ring": {
          "0%": { opacity: "0.45", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(2.4)" },
        },
        "grow-x": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
      animation: {
        post: "post 620ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "rail-draw": "rail-draw 520ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "flow-dash": "flow-dash 1.5s linear infinite",
        tide: "tide 14s cubic-bezier(0.37, 0, 0.63, 1) infinite",
        breathe: "breathe 3.2s cubic-bezier(0.37, 0, 0.63, 1) infinite",
        "pulse-ring": "pulse-ring 2.6s cubic-bezier(0.37, 0, 0.63, 1) infinite",
        "grow-x": "grow-x 800ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  },
  plugins: [require("tailwindcss-animate")],
};
