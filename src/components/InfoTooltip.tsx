'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './InfoTooltip.module.css';

interface InfoTooltipProps {
  content: string;
  title?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        tooltipRef.current &&
        buttonRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.infoTooltipContainer}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.infoButton}
        onClick={handleToggle}
        onTouchStart={handleToggle}
        aria-label="Mais informações"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className={styles.infoIcon}>?</span>
      </button>

      {isOpen && (
        <>
          {/* Overlay para mobile */}
          <div 
            className={styles.overlay}
            onClick={() => setIsOpen(false)}
            onTouchStart={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Tooltip/Modal */}
          <div 
            ref={tooltipRef}
            className={styles.tooltip}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'tooltip-title' : undefined}
          >
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              onTouchStart={() => setIsOpen(false)}
              aria-label="Fechar"
            >
              ✕
            </button>
            {title && (
              <h4 id="tooltip-title" className={styles.tooltipTitle}>
                {title}
              </h4>
            )}
            <p className={styles.tooltipContent}>{content}</p>
          </div>
        </>
      )}
    </div>
  );
};

