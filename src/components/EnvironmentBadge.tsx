'use client';

import React from 'react';
import { shouldShowEnvironmentBadge, getEnvironmentName, getEnvironmentColor, isDevEnvironment } from '@/utils/environment';
import styles from './EnvironmentBadge.module.css';

export const EnvironmentBadge: React.FC = () => {
  const shouldShow = shouldShowEnvironmentBadge();
  const isDev = isDevEnvironment();
  
  if (!shouldShow) {
    return null; // Não mostrar nada em produção
  }

  return (
    <div 
      className={styles.badge}
      style={{ backgroundColor: getEnvironmentColor() }}
      title={`Ambiente: ${getEnvironmentName()}`}
    >
      <span className={styles.badgeIcon}>{isDev ? '⚙️' : '⚠️'}</span>
      <span className={styles.badgeText}>{getEnvironmentName()}</span>
    </div>
  );
};

