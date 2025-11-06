import { useMemo } from 'react';
import { Transaction } from '@/types';
import { TimeFilterType, TransactionFilterUtils } from '@/utils';

interface UseAdSenseControlProps {
  showSetupModal: boolean;
  isEditModalOpen: boolean;
  isAddModalOpen: boolean;
  transactions: Transaction[] | null;
  currentView: 'record' | 'list' | 'reports' | 'profile';
  filterTypeList?: TimeFilterType;
  selectedDateList?: Date;
}

/**
 * Hook para controlar quando os anúncios do AdSense podem ser exibidos
 * Garante conformidade com políticas do Google AdSense
 */
export const useAdSenseControl = ({
  showSetupModal,
  isEditModalOpen,
  isAddModalOpen,
  transactions,
  currentView,
  filterTypeList,
  selectedDateList,
}: UseAdSenseControlProps): { canShowAds: boolean } => {
  const canShowAds = useMemo(() => {
    // 1. Não mostrar anúncios se algum modal bloqueante estiver aberto
    if (showSetupModal || isEditModalOpen || isAddModalOpen) {
      return false;
    }

    // 2. Não mostrar anúncios se não houver transações
    if (!transactions || transactions.length === 0) {
      return false;
    }

    // 3. Verificar por view específica
    switch (currentView) {
      case 'record':
        // View record: precisa ter transações para mostrar anúncios
        return transactions.length > 0;

      case 'list':
        // View list: precisa ter transações filtradas para mostrar anúncios
        if (filterTypeList && selectedDateList) {
          const filteredTransactions = TransactionFilterUtils.filterByPeriod(
            transactions,
            filterTypeList,
            selectedDateList
          );
          return filteredTransactions.length > 0;
        }
        return transactions.length > 0;

      case 'reports':
        // View reports: o componente Reports fará a verificação final de dados filtrados
        // Retornamos true aqui se houver transações, e o componente Reports verificará os dados filtrados
        return transactions.length > 0;

      case 'profile':
        // View profile: não deve mostrar anúncios (não tem conteúdo relevante)
        return false;

      default:
        return false;
    }
  }, [
    showSetupModal,
    isEditModalOpen,
    isAddModalOpen,
    transactions,
    currentView,
    filterTypeList,
    selectedDateList,
  ]);

  return { canShowAds };
};

