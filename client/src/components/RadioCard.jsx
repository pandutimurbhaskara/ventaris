const label =
  'flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 text-sm transition-colors duration-200 has-[:checked]:border-accent-border has-[:checked]:bg-accent-bg'

export default function RadioCard({ name, value, checked, onChange, title, subtitle }) {
  return (
    <label className={label}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="mt-0.5 accent-accent"
      />
      <span>
        <span className="block font-medium text-text-h">{title}</span>
        {subtitle && <span className="block text-text">{subtitle}</span>}
      </span>
    </label>
  )
}
