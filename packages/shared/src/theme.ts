export const theme = {
  colors: {
    primary: "#E85D2A",
    primaryDark: "#C7461A",
    secondary: "#1F8A70",
    background: "#FFFFFF",
    surface: "#F7F5F2",
    text: "#1A1A1A",
    textMuted: "#6B6B6B",
    border: "#E7E3DE",
    danger: "#D64545",
    success: "#2E9E5B",
    warning: "#E8A93A",
  },
  spacing: (n: number) => n * 4,
  radius: {
    sm: 6,
    md: 12,
    lg: 20,
    pill: 999,
  },
  font: {
    regular: "System",
    bold: "System",
  },
};

export type Theme = typeof theme;
