export default function SessionBar({ categories, category, onCategoryChange, onGenerate, loading }) {
  return (
    <div className="flex flex-wrap items-end gap-3 border-b border-line px-6 py-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="category" className="text-xs font-semibold text-ink-subtle">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="h-8 w-72 rounded-ui border border-line bg-white px-2 text-sm text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand"
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={onGenerate}
        disabled={!category || loading}
        className="h-8 rounded-ui bg-brand px-3 text-sm font-medium text-white hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-subtle"
      >
        Generate phishing email
      </button>
    </div>
  );
}
