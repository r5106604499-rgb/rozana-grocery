import { cn } from "@/lib/utils";
import type { Category } from "@/types/app";

interface CategoryChipProps {
  category: Category;
  active?: boolean;
  onSelect: (categoryId: bigint) => void;
  className?: string;
}

/** Circular category tile used in the horizontal home rail. */
export function CategoryChip({
  category,
  active = false,
  onSelect,
  className,
}: CategoryChipProps) {
  return (
    <button
      type="button"
      data-ocid="category_chip"
      aria-pressed={active}
      onClick={() => onSelect(category.id)}
      className={cn(
        "group flex w-[72px] shrink-0 flex-col items-center gap-1.5 focus-visible:outline-none",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 bg-well transition-smooth group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2",
          active ? "border-primary" : "border-transparent",
        )}
      >
        {category.imageUrl ? (
          <img
            src={category.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-display text-lg font-bold text-primary">
            {category.name.charAt(0).toUpperCase()}
          </span>
        )}
      </span>
      <span
        className={cn(
          "line-clamp-2 text-center text-[11px] font-medium leading-tight",
          active ? "text-primary" : "text-foreground",
        )}
      >
        {category.name}
      </span>
    </button>
  );
}
