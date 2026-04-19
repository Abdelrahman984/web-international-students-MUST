import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center">
      <p className="text-sm font-semibold text-green-600 mb-2">404</p>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Page Not Found
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        The page you requested does not exist.
      </p>
      <Link
        to="/"
        className="inline-flex items-center px-5 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
      >
        Go Back Home
      </Link>
    </div>
  );
}
