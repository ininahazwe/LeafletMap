// components/AlertCarousel.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import type { WordPressAlert } from '@/hooks/useWordPressAlerts';
import { colorForCountry } from '@/components/MapView';

interface AlertCarouselProps {
  alerts: (WordPressAlert & { countryName?: string })[];
  isHidden?: boolean;
}

const CARD_WIDTH = 360;
const AUTO_SCROLL_INTERVAL = 3000;

export default function AlertCarousel({ alerts, isHidden = false }: AlertCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState<boolean>(false);
  const [showRightArrow, setShowRightArrow] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Auto-scroll
  useEffect(() => {
    if (alerts.length === 0 || isPaused || isHidden) return;

    const interval = setInterval(() => {
      if (!scrollContainerRef.current) return;

      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 10;

      if (isAtEnd) {
        scrollContainerRef.current.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      } else {
        scrollContainerRef.current.scrollTo({
          left: scrollLeft + CARD_WIDTH,
          behavior: 'smooth'
        });
      }
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, [alerts.length, isPaused, isHidden]);

  const scroll = (direction: 'left' | 'right'): void => {
    if (!scrollContainerRef.current) return;

    const newScrollLeft = scrollContainerRef.current.scrollLeft +
        (direction === 'right' ? CARD_WIDTH : -CARD_WIDTH);

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const handleScroll = (): void => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  if (alerts.length === 0) return null;

  return (
      <div
          className={`alert-carousel-container ${isHidden ? 'alert-carousel-hidden' : ''}`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
      >
        {/* Header */}
        <div className="alert-carousel-header">
          <h2 className="alert-carousel-title">Media Alerts</h2>
        </div>

        {/* Carousel wrapper */}
        <div className="alert-carousel-wrapper">
          {/* Left Arrow */}
          {showLeftArrow && (
              <button
                  type="button"
                  onClick={() => scroll('left')}
                  className="alert-carousel-arrow alert-carousel-arrow-left"
                  aria-label="Previous alerts"
              >
                <ChevronLeft size={24} />
              </button>
          )}

          {/* Scrollable container */}
          <div
              ref={scrollContainerRef}
              className="alert-carousel-scroll"
              onScroll={handleScroll}
          >
            {alerts.map((alert, index) => (
                <article
                    key={alert.id}
                    className="alert-carousel-card sequential-appear"
                    style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {alert.countryName && (
                      <div
                          className="alert-carousel-time"
                          style={{
                            backgroundColor: alert.countryIso3
                                ? colorForCountry(alert.countryIso3)
                                : '#999999'
                          }}
                      >
                        {alert.countryName}
                      </div>
                  )}

                  <div className="alert-carousel-content">
                    <h3 className="alert-carousel-card-title" dangerouslySetInnerHTML={{ __html: alert.title }} />
                    <p
                        className="alert-carousel-excerpt"
                        dangerouslySetInnerHTML={{ __html: alert.excerpt }}
                    />

                    <div className="alert-carousel-footer">
                      {alert.date && (
                          <span className="alert-carousel-country">
                      {new Date(alert.date).toLocaleDateString('en-US')}
                    </span>
                      )}

                      {/* Correction : Ajout du tag <a> ouvrant */}
                      <a
                          href={alert.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="alert-carousel-link"
                      >
                        Read more
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </article>
            ))}
          </div>

          {/* Right Arrow */}
          {showRightArrow && (
              <button
                  type="button"
                  onClick={() => scroll('right')}
                  className="alert-carousel-arrow alert-carousel-arrow-right"
                  aria-label="Next alerts"
              >
                <ChevronRight size={24} />
              </button>
          )}
        </div>
      </div>
  );
}