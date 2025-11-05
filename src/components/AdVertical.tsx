'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './AdBanner.module.css';

/**
 * Componente para anúncio vertical do Google AdSense
 * Ad-slot: 2279285801
 */
export const AdVertical: React.FC = () => {
  const adRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAdContent, setHasAdContent] = useState(false);

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
              
              // Aguardar um pouco para o anúncio começar a carregar
              setTimeout(() => {
                setIsVisible(true);
              }, 500);
            } catch (error) {
              console.error('Erro ao carregar anúncio vertical:', error);
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
      console.error('Erro ao inicializar anúncio vertical:', error);
    }
  }, []);

  // Observar quando o anúncio realmente carrega conteúdo
  useEffect(() => {
    if (!insRef.current || !isVisible) {
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
  }, [isVisible]);

  // Não renderizar se não houver conteúdo do anúncio
  if (!isVisible || !hasAdContent) {
    return null;
  }

  return (
    <div ref={adRef} className={`${styles.adContainer} ${styles.vertical}`}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-9039559662831131"
        data-ad-slot="2279285801"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

