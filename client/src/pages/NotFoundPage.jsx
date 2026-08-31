import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex w-[1126px] max-w-full flex-col items-center gap-3 px-5 py-24 text-center">
      <h1 className="font-heading text-3xl font-semibold text-text-h">Page not found</h1>
      <p className="text-text">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="mt-2 inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white no-underline transition-opacity duration-200 hover:opacity-90"
      >
        Back to home
      </Link>
    </div>
  )
}
