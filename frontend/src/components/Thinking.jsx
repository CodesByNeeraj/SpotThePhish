function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-brand motion-reduce:animate-none" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export default function Thinking({ tip }) {
  return (
    <div role="status" className="flex max-w-[85%] flex-col gap-1">
      <div className="flex items-center gap-2 text-sm text-ink-subtle">
        <Spinner />
        Thinking...
      </div>
      {tip && (
        <p className="text-xs leading-5 text-ink-subtle">
          <span className="font-semibold text-ink">Tip:</span> {tip}
        </p>
      )}
    </div>
  );
}
