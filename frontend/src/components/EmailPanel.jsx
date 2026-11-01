function Field({ label, children }) {
  return (
    <div className="flex gap-4 border-b border-line px-4 py-2 text-sm">
      <dt className="w-16 shrink-0 text-ink-subtle">{label}</dt>
      <dd className="min-w-0 break-words text-ink">{children}</dd>
    </div>
  );
}

export default function EmailPanel({ email, loading }) {
  return (
    <section className="flex min-h-0 flex-col">
      <h2 className="mb-3 text-sm font-semibold text-ink">Email</h2>
      {email ? (
        <article className="rounded-ui border border-line">
          <dl>
            <Field label="From">{email.email_from}</Field>
            <Field label="Subject">{email.email_subject}</Field>
          </dl>
          <div className="whitespace-pre-wrap px-4 py-4 text-sm leading-6 text-ink">
            {email.email_body}
            {"\n\n"}
            {email.email_sign_off}
          </div>
        </article>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-ui border border-dashed border-line px-6 text-center text-sm text-ink-subtle">
          {loading
            ? "Generating email..."
            : "Choose a category and generate an email to begin."}
        </div>
      )}
    </section>
  );
}
