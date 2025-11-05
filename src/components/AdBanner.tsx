'use client';

import React, { useEffect, useRef } from 'react';
import styles from './AdBanner.module.css';

interface AdBannerProps {
  adSlot?: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
  compact?: boolean;
  style?: React.CSSProperties;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  adSlot,
  adFormat = 'auto',
  className = '',
  compact = false,
  style,
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!adRef.current || pushedRef.current) {
      return;
    }

    try {
      if (typeof window !== 'undefined') {
        // Aguardar o script do AdSense carregar
        const checkAdsbygoogle = () => {
          if ((window as any).adsbygoogle && !pushedRef.current) {
            try {
              ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
              pushedRef.current = true;
            } catch (error) {
              console.error('Erro ao carregar anúncio:', error);
            }
          } else if (!pushedRef.current) {
            // Tentar novamente após um delay
            setTimeout(checkAdsbygoogle, 100);
          }
        };

        // Verificar imediatamente
        checkAdsbygoogle();

        // Também verificar após um delay maior caso o script ainda não tenha carregado
        const timeoutId = setTimeout(checkAdsbygoogle, 1000);

        return () => {
          clearTimeout(timeoutId);
        };
      }
    } catch (error) {
      console.error('Erro ao inicializar anúncio:', error);
    }
  }, []);

  const containerClass = `${styles.adContainer} ${compact ? styles.compact : ''} ${adFormat === 'vertical' ? styles.vertical : adFormat === 'horizontal' ? styles.horizontal : ''} ${className}`;

  return (
    <div ref={adRef} className={containerClass} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-client="ca-pub-9039559662831131"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};

