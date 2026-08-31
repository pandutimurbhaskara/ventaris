const btn =
  'flex size-8 items-center justify-center rounded-md border border-border text-text-h transition-colors duration-200 hover:bg-social-bg disabled:cursor-not-allowed disabled:opacity-40'

export default function QuantityStepper({ value, max, onChange }) {
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        className={btn}
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        aria-label="Decrease quantity"
      >
        <svg className="size-4" role="presentation" aria-hidden="true">
          <use href="/icons.svg#minus-icon"></use>
        </svg>
      </button>
      <span className="w-6 text-center text-sm text-text-h">{value}</span>
      <button
        type="button"
        className={btn}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
      >
        <svg className="size-4" role="presentation" aria-hidden="true">
          <use href="/icons.svg#plus-icon"></use>
        </svg>
      </button>
    </div>
  )
}
