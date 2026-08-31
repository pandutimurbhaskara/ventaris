const wrap = 'flex flex-col items-center gap-3 px-5 py-16 text-center text-text'

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className={wrap}>
      <span className="size-6 animate-spin rounded-full border-2 border-border border-t-accent" />
      <p>{label}</p>
    </div>
  )
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className={wrap}>
      <svg className="size-8 text-danger" role="presentation" aria-hidden="true">
        <use href="/icons.svg#alert-icon"></use>
      </svg>
      <p className="text-text-h">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-text-h transition-colors duration-200 hover:bg-social-bg"
        >
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ icon = 'box-icon', title, description, action }) {
  return (
    <div className={wrap}>
      <svg className="size-8 text-text" role="presentation" aria-hidden="true">
        <use href={`/icons.svg#${icon}`}></use>
      </svg>
      <p className="font-heading text-text-h">{title}</p>
      {description && <p className="max-w-sm text-sm">{description}</p>}
      {action}
    </div>
  )
}
