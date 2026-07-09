"use client";

interface ConfirmDeleteButtonProps {
  label?: string;
  confirmMessage: string;
  className?: string;
}

export function ConfirmDeleteButton({
  label = "Supprimer",
  confirmMessage,
  className,
}: ConfirmDeleteButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {label}
    </button>
  );
}
