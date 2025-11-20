// components/AlertCarouselLoader.tsx
"use client";

export default function AlertCarouselLoader() {
  return (
    <div className="fixed bottom-6 left-6 z-[1300] w-[90%] max-w-4xl">
      {/* Conteneur principal */}
      <div className="w-full bg-white border border-neutral-medium rounded-lg overflow-hidden box-shadow">
        {/* Header avec shimmer */}
        <div className="alert-carousel-header">
          <div className="flex justify-between items-center gap-3">
            <div className="h-6 bg-gray-400 rounded w-40 animate-pulse" />
            <div className="h-6 bg-gray-300 rounded-full w-24 animate-pulse" />
          </div>
        </div>

        {/* Carousel items shimmer */}
        <div className="flex gap-4 p-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-80 bg-gray-100 rounded-lg overflow-hidden animate-pulse"
            >
              {/* Time badge */}
              <div className="h-7 bg-gray-300 w-20 rounded-b" />

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Title */}
                <div className="h-5 bg-gray-300 rounded w-full" />
                <div className="h-5 bg-gray-300 rounded w-4/5" />

                {/* Excerpt */}
                <div className="space-y-2 pt-2">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/5" />
                </div>

                {/* Footer */}
                <div className="h-6 bg-gray-200 rounded w-32 mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading text */}
      <div className="mt-2 text-center text-sm text-gray-500 animate-pulse">
        Loading media alerts...
      </div>
    </div>
  );
}