// Tailwind background classes for zone name pill
export const CATEGORY_COLORS = {
  cat_premium: "bg-amber-700",
  cat_regular: "bg-gray-900",
  cat_economy: "bg-emerald-700",
  cat_vip: "bg-violet-700",
} as const;

export type CategoryId = keyof typeof CATEGORY_COLORS; 

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  cat_premium: "PREMIUM",
  cat_regular: "REGULAR",
  cat_economy: "ECONOMY",
  cat_vip: "VIP",
};
