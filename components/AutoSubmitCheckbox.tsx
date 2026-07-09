"use client";

export function AutoSubmitCheckbox({
  action,
  defaultChecked,
  label,
}: {
  action: (formData: FormData) => void;
  defaultChecked: boolean;
  label: string;
}) {
  return (
    <form action={action}>
      <label className="flex items-center gap-1.5 text-foreground cursor-pointer">
        <input
          type="checkbox"
          name="value"
          defaultChecked={defaultChecked}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
        />
        {label}
      </label>
    </form>
  );
}
