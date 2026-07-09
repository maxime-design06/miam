"use client";

import { useState, useTransition } from "react";
import { CalendarPlus, Check } from "lucide-react";
import { addToWeeklyList, removeFromWeeklyList } from "@/app/semaine/actions";

interface WeeklyToggleButtonProps {
  recipeId: string;
  slug: string;
  initialEntryId: string | null;
}

export function WeeklyToggleButton({
  recipeId,
  slug,
  initialEntryId,
}: WeeklyToggleButtonProps) {
  const [entryId, setEntryId] = useState<string | null>(initialEntryId);
  const [isPending, startTransition] = useTransition();
  const added = Boolean(entryId);

  function handleClick() {
    startTransition(async () => {
      if (entryId) {
        await removeFromWeeklyList(entryId, slug);
        setEntryId(null);
      } else {
        const newId = await addToWeeklyList(recipeId, slug);
        setEntryId(newId);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition disabled:opacity-60 ${
        added ? "bg-leaf text-white" : "text-leaf"
      }`}
    >
      {added ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <CalendarPlus className="w-3.5 h-3.5" />
      )}
      Menu de la semaine
    </button>
  );
}
