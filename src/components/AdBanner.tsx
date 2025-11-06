'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './AdBanner.module.css';

interface AdBannerProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  adLayout?: 'in-article' | 'fluid';
  className?: string;
  compact?: boolean;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  adSlot,
  adFormat = 'auto',
  adLayout,
  className = '',
  compact = false,
  style,
  disabled = false,
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAdContent, setHasAdContent] = useState(false);

  useEffect(() => {
    if (!adRef.current || pushedRef.current || disabled) {
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
              
              // Aguardar um pouco para o anúncio começar a carregar
              setTimeout(() => {
                setIsVisible(true);
              }, 500);
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
  }, [disabled]);

  // Observar quando o anúncio realmente carrega conteúdo
  useEffect(() => {
    if (!insRef.current || !isVisible || disabled) {
      return;
    }

    const observer = new MutationObserver(() => {
      const insElement = insRef.current;
      if (insElement) {
        // Verificar se há conteúdo no anúncio (iframe ou elementos filhos)
        const hasContent = 
          insElement.querySelector('iframe') !== null ||
          insElement.children.length > 0 ||
          insElement.innerHTML.trim().length > 0;
        
        if (hasContent) {
          setHasAdContent(true);
        }
      }
    });

    observer.observe(insRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // Verificar periodicamente se o anúncio carregou
    const checkInterval = setInterval(() => {
      const insElement = insRef.current;
      if (insElement) {
        const hasContent = 
          insElement.querySelector('iframe') !== null ||
          insElement.children.length > 0 ||
          insElement.innerHTML.trim().length > 0;
        
        if (hasContent) {
          setHasAdContent(true);
          clearInterval(checkInterval);
        }
      }
    }, 500);

    // Timeout para parar de verificar após 10 segundos
    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
      observer.disconnect();
    }, 10000);

    return () => {
      observer.disconnect();
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, [isVisible, disabled]);

  // Não renderizar se estiver desabilitado ou não houver conteúdo do anúncio
  if (disabled || !isVisible || !hasAdContent) {
    return null;
  }

  const containerClass = `${styles.adContainer} ${compact ? styles.compact : ''} ${adFormat === 'vertical' ? styles.vertical : adFormat === 'horizontal' ? styles.horizontal : ''} ${className}`;

  // Props para in-article (bloco dinâmico)
  const insProps: any = {
    ref: insRef,
    className: 'adsbygoogle',
    style: { display: 'block', textAlign: 'center' },
    'data-ad-client': 'ca-pub-9039559662831131',
    'data-ad-slot': adSlot,
  };

  if (adLayout === 'in-article') {
    insProps['data-ad-layout'] = 'in-article';
    insProps['data-ad-format'] = 'fluid';
  } else {
    insProps['data-ad-format'] = adFormat;
    insProps['data-full-width-responsive'] = 'true';
  }

  return (
    <div ref={adRef} className={containerClass} style={style}>
      <ins {...insProps} />
    </div>
  );
};

