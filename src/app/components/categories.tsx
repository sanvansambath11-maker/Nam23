import { UtensilsCrossed, Beef, CupSoda, Soup, Salad, Fish, Cookie, Flame } from "lucide-react";
import { useTranslation } from "./translation-context";

interface Category {
  key: string;
  icon: React.ReactNode;
  count: number;
}

const categories: Category[] = [
  { key: "allMenu", icon: <UtensilsCrossed size={18} />, count: 48 },
  { key: "khmer", icon: <Flame size={18} />, count: 14 },
  { key: "rice", icon: <Beef size={18} />, count: 10 },
  { key: "noodle", icon: <Soup size={18} />, count: 8 },
  { key: "drinks", icon: <CupSoda size={18} />, count: 6 },
  { key: "salad", icon: <Salad size={18} />, count: 5 },
  { key: "seafood", icon: <Fish size={18} />, count: 7 },
  { key: "dessert", icon: <Cookie size={18} />, count: 4 },
];

interface CategoriesProps {
  activeCategory: string;
  onCategoryChange: (key: string) => void;
}

export function Categories({ activeCategory, onCategoryChange }: CategoriesProps) {
  const { t, fontClass } = useTranslation();

  return (
    <div className={`mb-6 ${fontClass}`}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-1 h-5 rounded-full gradient-primary" />
        <h3 className="text-gray-900 dark:text-white" style={{ fontSize: "15px", fontWeight: 700 }}>{t("categories")}</h3>
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-1 premium-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => onCategoryChange(cat.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl shrink-0 transition-all duration-200 press-effect ${activeCategory === cat.key
                ? "gradient-primary text-white shadow-lg shadow-green-200 dark:shadow-green-900 gradient-glow"
                : "glass-card text-gray-600 dark:text-gray-300 hover:shadow-md hover-scale"
              }`}
          >
            <span className={activeCategory === cat.key ? "text-white" : "text-gray-400"}>{cat.icon}</span>
            <span style={{ fontSize: "13px", fontWeight: activeCategory === cat.key ? 600 : 500 }}>{t(cat.key)}</span>
            <span
              className={`px-1.5 py-0.5 rounded-lg ${activeCategory === cat.key ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-700/50 text-gray-400"
                }`}
              style={{ fontSize: "11px", fontWeight: 600 }}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
