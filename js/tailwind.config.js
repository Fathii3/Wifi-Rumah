// Konfigurasi Tema Tailwind CSS (Single Source of Truth)
window.tailwind = window.tailwind || {};
window.tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                // Neumorphism Palette
                "neu-bg": "#e0e5ec",
                "neu-surface": "#e0e5ec",
                "neu-light": "#ffffff",
                "neu-dark": "#a3b1c6",
                "neu-darker": "#8fa0b8",

                // Text
                "text-primary": "#2d3748",
                "text-muted": "#64748b",
                "text-subtle": "#8a99ad",

                // Brand & Semantic
                "primary": "#4f46e5",
                "primary-dark": "#4338ca",
                "secondary": "#6b38d4",
                "error": "#ef4444",
                "success": "#10b981",
                "warning": "#f59e0b",
                "cyan-accent": "#06b6d4",

                // Legacy compatibility mappings
                "on-primary": "#ffffff",
                "on-surface": "#2d3748",
                "on-surface-variant": "#64748b",
                "on-background": "#2d3748",
                "background": "#e0e5ec",
                "surface": "#e0e5ec",
                "surface-container-high": "#d5dbe5",
                "surface-variant": "#cdd4df",
                "primary-container": "#5b52e0",
                "on-primary-container": "#ffffff",
                "on-secondary": "#ffffff",
                "on-secondary-container": "#ffffff",
                "secondary-container": "#7b4fe0",
                "on-error": "#ffffff",
                "error-container": "#fde8e8",
                "on-error-container": "#b91c1c",
                "outline": "#94a3b8",
                "outline-variant": "#b8c4d4",
                "inverse-surface": "#334155",
                "inverse-on-surface": "#e0e5ec"
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "2xl": "1rem",
                "3xl": "1.5rem",
                "full": "9999px"
            },
            spacing: {
                "section-gap": "64px",
                "unit": "8px",
                "container-padding": "24px",
                "gutter": "16px",
                "margin-desktop": "40px",
                "container-max": "1200px",
                "margin-mobile": "16px"
            },
            fontFamily: {
                sans: ["Montserrat", "Inter", "system-ui", "sans-serif"],
                "display-lg-mobile": ["Montserrat", "Inter", "sans-serif"],
                "body-md": ["Montserrat", "Inter", "sans-serif"],
                "display-lg": ["Montserrat", "Inter", "sans-serif"],
                "body-lg": ["Montserrat", "Inter", "sans-serif"],
                "headline-md": ["Montserrat", "Inter", "sans-serif"],
                "label-sm": ["Montserrat", "Inter", "sans-serif"],
                "label-caps": ["Montserrat", "Inter", "sans-serif"],
                "headline-lg-mobile": ["Montserrat", "Inter", "sans-serif"]
            },
            fontSize: {
                "display-lg-mobile": ["24px", { lineHeight: "1.2", fontWeight: "700" }],
                "body-md": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
                "display-lg": ["32px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
                "body-lg": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
                "headline-md": ["20px", { lineHeight: "1.3", fontWeight: "600" }],
                "label-sm": ["12px", { lineHeight: "1.2", letterSpacing: "0.05em", fontWeight: "600" }],
                "label-caps": ["10px", { lineHeight: "14px", letterSpacing: "0.05em", fontWeight: "600" }],
                "headline-lg-mobile": ["20px", { lineHeight: "28px", fontWeight: "600" }]
            }
        }
    }
};
