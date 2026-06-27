export type Paleta = {
  id: string;
  nome: string;
  hex: string;      // CTA / botões
  hexDark: string;  // hover
  hexLight: string; // fundo selecionado / sutil
  hexBorder: string;// bordas
  hexText: string;  // texto sobre fundo claro
};

export const PALETAS: Paleta[] = [
  { id: "rose",   nome: "Rosa",    hex: "#e11d48", hexDark: "#be123c", hexLight: "#fff1f2", hexBorder: "#fecdd3", hexText: "#9f1239" },
  { id: "orange", nome: "Laranja", hex: "#ea580c", hexDark: "#c2410c", hexLight: "#fff7ed", hexBorder: "#fed7aa", hexText: "#9a3412" },
  { id: "green",  nome: "Verde",   hex: "#16a34a", hexDark: "#15803d", hexLight: "#f0fdf4", hexBorder: "#bbf7d0", hexText: "#14532d" },
  { id: "blue",   nome: "Azul",    hex: "#2563eb", hexDark: "#1d4ed8", hexLight: "#eff6ff", hexBorder: "#bfdbfe", hexText: "#1e3a8a" },
  { id: "violet", nome: "Roxo",    hex: "#7c3aed", hexDark: "#6d28d9", hexLight: "#f5f3ff", hexBorder: "#ddd6fe", hexText: "#4c1d95" },
  { id: "amber",  nome: "Âmbar",   hex: "#d97706", hexDark: "#b45309", hexLight: "#fffbeb", hexBorder: "#fde68a", hexText: "#78350f" },
];

export function getPaleta(id: string): Paleta {
  return PALETAS.find((p) => p.id === id) ?? PALETAS[0];
}
