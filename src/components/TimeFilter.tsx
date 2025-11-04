'use client';

import { TimeFilterType } from '@/utils';
import React from 'react';
import styles from './TimeFilter.module.css';

interface TimeFilterProps {
  filterType: TimeFilterType;
  onFilterChange: (filter: TimeFilterType) => void;
  referenceDate: Date;
  onDateChange?: (date: Date) => void;
  showDateNavigation?: boolean;
}

export const TimeFilter: React.FC<TimeFilterProps> = ({
  filterType,
  onFilterChange,
  referenceDate,
  onDateChange,
  showDateNavigation = true
}) => {
  const handleFilterChange = (newFilter: TimeFilterType) => {
    onFilterChange(newFilter);
  };

  const handlePreviousPeriod = () => {
    if (!onDateChange) return;
    
    const newDate = new Date(referenceDate);
    
    switch (filterType) {
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
      default:
        return;
    }
    
    onDateChange(newDate);
  };

  const handleNextPeriod = () => {
    if (!onDateChange) return;
    
    const newDate = new Date(referenceDate);
    const now = new Date();
    
    // Verificar se já está no período atual
    let isCurrentPeriod = false;
    
    switch (filterType) {
      case 'week':
        const currentWeekStart = new Date(now);
        const currentWeekDay = currentWeekStart.getDay();
        const currentWeekDiff = currentWeekStart.getDate() - currentWeekDay + (currentWeekDay === 0 ? -6 : 1);
        currentWeekStart.setDate(currentWeekDiff);
        const selectedWeekStart = new Date(newDate);
        const selectedWeekDay = selectedWeekStart.getDay();
        const selectedWeekDiff = selectedWeekStart.getDate() - selectedWeekDay + (selectedWeekDay === 0 ? -6 : 1);
        selectedWeekStart.setDate(selectedWeekDiff);
        isCurrentPeriod = currentWeekStart.getTime() === selectedWeekStart.getTime();
        if (!isCurrentPeriod) {
          newDate.setDate(newDate.getDate() + 7);
        }
        break;
      case 'month':
        isCurrentPeriod = newDate.getMonth() === now.getMonth() && newDate.getFullYear() === now.getFullYear();
        if (!isCurrentPeriod) {
          newDate.setMonth(newDate.getMonth() + 1);
        }
        break;
      case 'year':
        isCurrentPeriod = newDate.getFullYear() === now.getFullYear();
        if (!isCurrentPeriod) {
          newDate.setFullYear(newDate.getFullYear() + 1);
        }
        break;
      default:
        return;
    }
    
    if (!isCurrentPeriod) {
      onDateChange(newDate);
    }
  };

  const isCurrentPeriod = () => {
    const now = new Date();
    
    switch (filterType) {
      case 'week':
        const currentWeekStart = new Date(now);
        const currentWeekDay = currentWeekStart.getDay();
        const currentWeekDiff = currentWeekStart.getDate() - currentWeekDay + (currentWeekDay === 0 ? -6 : 1);
        currentWeekStart.setDate(currentWeekDiff);
        currentWeekStart.setHours(0, 0, 0, 0);
        
        const selectedWeekStart = new Date(referenceDate);
        const selectedWeekDay = selectedWeekStart.getDay();
        const selectedWeekDiff = selectedWeekStart.getDate() - selectedWeekDay + (selectedWeekDay === 0 ? -6 : 1);
        selectedWeekStart.setDate(selectedWeekDiff);
        selectedWeekStart.setHours(0, 0, 0, 0);
        
        return currentWeekStart.getTime() === selectedWeekStart.getTime();
      case 'month':
        return referenceDate.getMonth() === now.getMonth() && 
               referenceDate.getFullYear() === now.getFullYear();
      case 'year':
        return referenceDate.getFullYear() === now.getFullYear();
      default:
        return false;
    }
  };

  const getPeriodLabel = (): string => {
    switch (filterType) {
      case 'week':
        const startWeek = new Date(referenceDate);
        const day = startWeek.getDay();
        const diff = startWeek.getDate() - day + (day === 0 ? -6 : 1);
        startWeek.setDate(diff);
        const endWeek = new Date(startWeek);
        endWeek.setDate(startWeek.getDate() + 6);
        return `${startWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - ${endWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
      case 'month':
        return referenceDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      case 'year':
        return referenceDate.getFullYear().toString();
      case 'all':
      default:
        return 'Todas';
    }
  };

  return (
    <div className={styles.timeFilterContainer}>
      {/* Botões de filtro */}
      <div className={styles.filterButtons}>
        <button
          className={`${styles.filterButton} ${filterType === 'all' ? styles.active : ''}`}
          onClick={() => handleFilterChange('all')}
          title="Todas as transações"
        >
          📅 Todas
        </button>
        <button
          className={`${styles.filterButton} ${filterType === 'week' ? styles.active : ''}`}
          onClick={() => handleFilterChange('week')}
          title="Esta semana"
        >
          📆 Semana
        </button>
        <button
          className={`${styles.filterButton} ${filterType === 'month' ? styles.active : ''}`}
          onClick={() => handleFilterChange('month')}
          title="Este mês"
        >
          📅 Mês
        </button>
        <button
          className={`${styles.filterButton} ${filterType === 'year' ? styles.active : ''}`}
          onClick={() => handleFilterChange('year')}
          title="Este ano"
        >
          📊 Ano
        </button>
      </div>

      {/* Navegação de período (só mostra se não for "all") */}
      {filterType !== 'all' && showDateNavigation && (
        <div className={styles.periodNavigation}>
          <button
            className={styles.navButton}
            onClick={handlePreviousPeriod}
            title="Período anterior"
          >
            ◀
          </button>
          <p className={styles.periodLabel}>{getPeriodLabel()}</p>
          <button
            className={styles.navButton}
            onClick={handleNextPeriod}
            disabled={isCurrentPeriod()}
            title="Próximo período"
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
};

