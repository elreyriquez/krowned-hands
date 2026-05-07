"use client";

type Props = {
  action: (formData: FormData) => void;
  id: string;
  buttonText: string;
  confirmMessage: string;
  className?: string;
};

/**
 * Wraps a server action form so the admin must confirm before submit.
 */
export function AdminConfirmActionForm({
  action,
  id,
  buttonText,
  confirmMessage,
  className = "kh-btn kh-btn-ghost !py-1.5 !px-3 !min-h-0 text-xs",
}: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={className}>
        {buttonText}
      </button>
    </form>
  );
}
