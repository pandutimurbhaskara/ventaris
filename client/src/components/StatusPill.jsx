const styles = {
  PROCESSING: 'bg-accent-bg text-accent',
  PENDING: 'bg-accent-bg text-accent',
  COMPLETED: 'bg-success-bg text-success',
  PAID: 'bg-success-bg text-success',
  CANCELLED: 'bg-danger-bg text-danger',
  FAILED: 'bg-danger-bg text-danger',
}

export default function StatusPill({ status }) {
  const style = styles[status?.toUpperCase()] || 'bg-social-bg text-text-h'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style}`}
    >
      {status?.toLowerCase()}
    </span>
  )
}
