'use client';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-white">
      <div className="max-w-md space-y-6 text-center">
        {/* Offline Icon */}
        <div className="text-6xl">📡</div>

        {/* Title */}
        <h1 className="text-4xl font-bold">You're Offline</h1>

        {/* Description */}
        <p className="text-xl text-gray-400">
          It looks like you've lost your internet connection. Some features may
          not be available right now.
        </p>

        {/* Suggestions */}
        <div className="space-y-2 rounded-lg bg-gray-900 p-4 text-left text-sm text-gray-300">
          <p>• Check your internet connection</p>
          <p>• Try refreshing the page</p>
          <p>• Visit previously cached pages</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-yellow-500 px-4 py-2 font-bold text-black hover:bg-yellow-600"
          >
            Refresh
          </button>
          <button
            onClick={() => window.history.back()}
            className="rounded bg-gray-700 px-4 py-2 font-bold text-white hover:bg-gray-600"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
