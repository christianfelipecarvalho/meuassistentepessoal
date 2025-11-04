'use client';

import React from 'react';
import styles from './AboutModal.module.css';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>📱 Sobre o Aplicativo</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>O que é?</h3>
            <p className={styles.text}>
              O <strong>Meu Assistente Financeiro</strong> é um aplicativo pessoal que ajuda você a 
              gerenciar suas finanças de forma simples e rápida. Você pode registrar seus gastos e 
              ganhos através de gravação de voz ou manualmente, organizando tudo por categorias.
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Principais Funcionalidades</h3>
            <ul className={styles.featuresList}>
              <li>🎤 <strong>Gravação por voz:</strong> Registre transações falando naturalmente</li>
              <li>📋 <strong>Organização por categorias:</strong> Organize seus gastos e ganhos</li>
              <li>📊 <strong>Relatórios e gráficos:</strong> Visualize seus dados financeiros</li>
              <li>🔍 <strong>Filtros de período:</strong> Analise por semana, mês ou ano</li>
              <li>📱 <strong>Funciona offline:</strong> Use sem internet após instalar</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>🔒 Privacidade e Armazenamento</h3>
            <div className={styles.privacyBox}>
              <p className={styles.text}>
                <strong>Todos os seus dados são salvos exclusivamente no seu celular ou dispositivo.</strong>
              </p>
              <p className={styles.text}>
                Nenhuma informação é enviada para servidores externos. Todas as transações, 
                categorias e configurações ficam armazenadas localmente no seu dispositivo, 
                garantindo total privacidade e segurança dos seus dados financeiros.
              </p>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>💡 Dica</h3>
            <p className={styles.text}>
              Para garantir que seus dados não sejam perdidos, recomendamos fazer backup regular 
              do seu dispositivo ou exportar seus dados periodicamente.
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.closeFooterButton}
            onClick={onClose}
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};

