// components/AlertCarousel.tsx
"use client";

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Clock } from 'lucide-react';
import type { WordPressAlert } from '@/hooks/useWordPressAlerts';

interface AlertCarouselProps {
  alerts: WordPressAlert[];
  isHidden?: boolean; // Contrôle la visibilité
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const getCategoryColor = (category: WordPressAlert['category']): string => {
  switch (category) {
    case 'urgent':
      return '#E85A4F';
    case 'info':
      return '#4E79A7';
    case 'report':
      return '#2E7D32';
  }
};

export default function AlertCarousel({ alerts, isHidden = false }: AlertCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  if (alerts.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = 400;
    const newScrollLeft = scrollContainerRef.current.scrollLeft + 
      (direction === 'right' ? scrollAmount : -scrollAmount);
    
    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  return (
    <div className={`alert-carousel-container ${isHidden ? 'alert-carousel-hidden' : ''}`}>
      {/* Header */}
      <div className="alert-carousel-header">
        <h2 className="alert-carousel-title">Media Alerts</h2>
        <div className="alert-carousel-badge">
          {alerts.length} update{alerts.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Carousel wrapper */}
      <div className="alert-carousel-wrapper">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
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
          {alerts.map((alert) => (
            <article
              key={alert.id}
              className="alert-carousel-card"
            >
              {/* Time badge */}
              {alert.countryName && ( 
                <div 
                  className="alert-carousel-time"
                  style={{ backgroundColor: getCategoryColor(alert.category) }}
                >
                  {alert.countryName}
                </div>
              )}

              {/* Card content */}
              <div className="alert-carousel-content">
                <h3 className="alert-carousel-card-title">
                  {alert.title}
                </h3>
                
                <p className="alert-carousel-excerpt">
                  {alert.excerpt}
                </p>

                {/* Footer */}
                <div className="alert-carousel-footer">
                  {/* Afficher le nom du pays dynamiquement au lieu du code ISO */}
                  
                  {alert.date && (
                    <span className="alert-carousel-country">
                      {new Date(alert.date).toLocaleDateString('en-EN')}
                    </span>
                  )}
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