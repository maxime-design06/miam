"use client";

import { useState } from "react";

export function CategoryPills({ categories }: { categories: string[] }) {
  const [active, setActive] = useState(categories[0]);

  return (
    <div className="flex gap-2 justify-center flex-wrap mb-8">
      {categories.map((category) => {
        const isActive = category === active;
        return (
          <button
            key={category}
            onClick={() => setActive(category)}
            className={`text-sm px-3.5 py-1.5 rounded-full transition ${
              isActive
                ? "bg-leaf text-cream"
                : "bg-surface text-foreground hover:opacity-80"
            }`}
          >
            {category.toLowerCase()}
          </button>
        );
      })}
    </div>
  );
}
