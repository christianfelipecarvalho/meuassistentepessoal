'use client';

import React, { useState } from 'react';
import styles from './InitialSetupModal.module.css';

interface InitialSetupModalProps {
  isOpen: boolean;
  onComplete: (email: string) => void;
}

export const InitialSetupModal: React.FC<InitialSetupModalProps> = ({
  isOpen,
  onComplete
}) => {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(true);

  if (!isOpen) {
    return null;
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateEmail(email)) {
      setIsValid(true);
      onComplete(email);
    } else {
      setIsValid(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
      <div className={styles.header}>
        <h2>Bem-vindo ao Meu Assistente Financeiro</h2>
        <p className={styles.subtitle}>
          Precisamos do seu email para identificar sua conta
        </p>
      </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">📧 Seu Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setIsValid(true);
              }}
              placeholder="exemplo@email.com"
              className={`${styles.input} ${!isValid ? styles.inputError : ''}`}
              required
              autoFocus
            />
            {!isValid && (
              <span className={styles.errorMessage}>
                Por favor, insira um email válido
              </span>
            )}
          </div>

          <div className={styles.infoBox}>
            <p>ℹ️ Para que usamos seu email:</p>
            <ul>
              <li>Seu email é usado para identificar sua conta de forma única</li>
              <li>Garantimos a privacidade dos seus dados</li>
              <li>Você pode alterar isso depois nas configurações</li>
            </ul>
          </div>

          <div className={styles.buttons}>
            <button
              type="submit"
              className={styles.saveButton}
            >
              ✅ Salvar e Continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

