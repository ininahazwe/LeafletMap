// components/AlertBadge-INLINE-STYLES.tsx
"use client";

import { Bell } from 'lucide-react';

interface AlertBadgeProps {
  count: number;
  onClick: () => void;
}

export default function AlertBadge({ count, onClick }: AlertBadgeProps) {
  if (count === 0) return null;

  const badgeStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '24px',
    left: '24px',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 20px',
    background: '#E85A4F',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    boxShadow: '0 4px 16px rgba(232, 90, 79, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: 500,
    fontSize: '14px',
  };

  const iconContainerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const countBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    background: 'white',
    color: '#E85A4F',
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 5px',
    borderRadius: '10px',
    minWidth: '18px',
    textAlign: 'center',
  };

  return (
    <button
      onClick={onClick}
      style={badgeStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(232, 90, 79, 0.4)';
        e.currentTarget.style.background = '#F07167';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(232, 90, 79, 0.3)';
        e.currentTarget.style.background = '#E85A4F';
      }}
      aria-label={`${count} alert${count > 1 ? 's' : ''} non lue${count > 1 ? 's' : ''}`}
    >
      <div style={iconContainerStyle}>
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span style={countBadgeStyle}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </div>
      <span style={{ fontWeight: 600 }}>
        {count} Alert{count > 1 ? 's' : ''}
      </span>
    </button>
  );
}