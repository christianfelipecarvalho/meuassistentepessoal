'use client';

import React, { useState } from 'react';
import styles from './FeedbackModal.module.css';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [step, setStep] = useState<'rating' | 'feedback'>('rating');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleRatingClick = (value: number) => {
    setRating(value);
    // Mudar para tela de feedback após 500ms
    setTimeout(() => {
      setStep('feedback');
    }, 500);
  };

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      alert('Por favor, escreva sua sugestão ou crítica');
      return;
    }

    setIsSubmitting(true);

    try {
      const userEmail = localStorage.getItem('userEmail') || 'Não identificado';
      
      await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          rating,
          feedback: feedback.trim(),
        }),
      });

      setIsSubmitting(false);
      onComplete();
      onClose();
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      setIsSubmitting(false);
      alert('Erro ao enviar feedback. Tente novamente.');
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {step === 'rating' ? (
          <div className={styles.ratingStep}>
            <div className={styles.header}>
              <h2>⭐ Avalie o App</h2>
              <p>Como foi sua experiência?</p>
            </div>

            <div className={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`${styles.starButton} ${
                    star <= (hoveredRating || rating) ? styles.active : ''
                  }`}
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  aria-label={`Avaliar com ${star} estrelas`}
                >
                  ⭐
                </button>
              ))}
            </div>

            {rating > 0 && (
              <div className={styles.ratingText}>
                {rating === 1 && '😞 Ruim'}
                {rating === 2 && '😐 Poderia ser melhor'}
                {rating === 3 && '😊 Bom'}
                {rating === 4 && '😃 Muito bom'}
                {rating === 5 && '🤩 Excelente!'}
              </div>
            )}

            <button 
              className={styles.skipButton}
              onClick={handleSkip}
              type="button"
            >
              Pular
            </button>
          </div>
        ) : (
          <div className={styles.feedbackStep}>
            <div className={styles.header}>
              <h2>💬 Conte-nos mais</h2>
              <p>Sua opinião é muito importante!</p>
            </div>

            <div className={styles.feedbackForm}>
              <div className={styles.ratingDisplay}>
                <div className={styles.ratingLabel}>
                  Sua avaliação: {rating} ⭐
                </div>
              </div>

              <div className={styles.textAreaGroup}>
                <label htmlFor="feedback">
                  {rating >= 4 ? '✨ O que mais gostou?' : '💡 Como podemos melhorar?'}
                </label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={
                    rating >= 4
                      ? 'Compartilhe o que mais gostou no app...'
                      : 'Diga-nos como podemos melhorar...'
                  }
                  rows={6}
                  className={styles.textarea}
                />
              </div>

              <div className={styles.buttons}>
                <button
                  className={styles.backButton}
                  onClick={() => setStep('rating')}
                  disabled={isSubmitting}
                  type="button"
                >
                  ← Voltar
                </button>
                <button
                  className={styles.submitButton}
                  onClick={handleSubmit}
                  disabled={isSubmitting || !feedback.trim()}
                  type="button"
                >
                  {isSubmitting ? '⏳ Enviando...' : '✅ Enviar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

