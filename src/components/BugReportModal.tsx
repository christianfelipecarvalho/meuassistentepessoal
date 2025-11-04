'use client';

import React, { useState } from 'react';
import styles from './BugReportModal.module.css';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName?: string;
}

export const BugReportModal: React.FC<BugReportModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  userName
}) => {
  const [bugDescription, setBugDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async () => {
    if (!bugDescription.trim()) {
      alert('Por favor, descreva o bug ou falha encontrada');
      return;
    }

    setIsSubmitting(true);

    try {
      const appVersion = '1.0.0';
      
      const response = await fetch('/api/bug-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          userName: userName || '',
          bugDescription: bugDescription.trim(),
          stepsToReproduce: stepsToReproduce.trim() || '',
          appVersion,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar reporte');
      }

      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Fechar modal após 2 segundos
      setTimeout(() => {
        setShowSuccess(false);
        setBugDescription('');
        setStepsToReproduce('');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Erro ao enviar reporte de bug:', error);
      setIsSubmitting(false);
      alert('Erro ao enviar reporte de bug. Tente novamente.');
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setBugDescription('');
      setStepsToReproduce('');
      setShowSuccess(false);
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {showSuccess ? (
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>Reporte Enviado!</h2>
            <p className={styles.successMessage}>
              Obrigado por nos ajudar a melhorar o aplicativo.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <h2 className={styles.title}>🐛 Reportar Bug/Falha</h2>
              <button
                className={styles.closeButton}
                onClick={handleClose}
                disabled={isSubmitting}
                aria-label="Fechar modal"
              >
                ✕
              </button>
            </div>

            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="bugDescription" className={styles.label}>
                  Descrição do Bug/Falha <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="bugDescription"
                  value={bugDescription}
                  onChange={(e) => setBugDescription(e.target.value)}
                  placeholder="Descreva o bug ou falha que você encontrou. Seja o mais detalhado possível..."
                  rows={6}
                  className={styles.textarea}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="stepsToReproduce" className={styles.label}>
                  Passos para Reproduzir (Opcional)
                </label>
                <textarea
                  id="stepsToReproduce"
                  value={stepsToReproduce}
                  onChange={(e) => setStepsToReproduce(e.target.value)}
                  placeholder="1. Passo 1...
2. Passo 2...
3. Passo 3..."
                  rows={4}
                  className={styles.textarea}
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.buttons}>
                <button
                  className={styles.cancelButton}
                  onClick={handleClose}
                  disabled={isSubmitting}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className={styles.submitButton}
                  onClick={handleSubmit}
                  disabled={isSubmitting || !bugDescription.trim()}
                  type="button"
                >
                  {isSubmitting ? '⏳ Enviando...' : '📤 Enviar Reporte'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

