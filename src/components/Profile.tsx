'use client';

import React, { useState, useEffect } from 'react';
import { AboutModal } from './AboutModal';
import { TermsModal } from './TermsModal';
import { BugReportModal } from './BugReportModal';
import styles from './Profile.module.css';

interface ProfileProps {
  userEmail: string;
}

export const Profile: React.FC<ProfileProps> = ({ userEmail }) => {
  const [userName, setUserName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showBugReportModal, setShowBugReportModal] = useState(false);

  // Carregar nome do localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('userName') || '';
    setUserName(savedName);
    setEditName(savedName);
  }, []);

  const handleSaveName = () => {
    if (editName.trim()) {
      localStorage.setItem('userName', editName.trim());
      setUserName(editName.trim());
      setIsEditing(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 2000);
    } else {
      // Se vazio, remover do localStorage
      localStorage.removeItem('userName');
      setUserName('');
      setEditName('');
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(userName);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditName(userName);
    setIsEditing(true);
  };

  // Versão do app
  const appVersion = '1.0.0';
  
  // Tipo de licença (pode ser expandido no futuro)
  const licenseType = 'Gratuita'; // Pode ser: Gratuita, Premium, etc.

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatar}>
          {userName ? userName.charAt(0).toUpperCase() : userEmail.charAt(0).toUpperCase()}
        </div>
        <h2 className={styles.profileTitle}>Meu Perfil</h2>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.profileSection}>
          <label className={styles.profileLabel}>Email</label>
          <div className={styles.profileValue}>
            <span className={styles.emailValue}>{userEmail}</span>
          </div>
        </div>

        <div className={styles.profileSection}>
          <label className={styles.profileLabel}>Nome</label>
          {isEditing ? (
            <div className={styles.editContainer}>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={styles.nameInput}
                placeholder="Digite seu nome"
                autoFocus
                maxLength={50}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveName();
                  } else if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
              />
              <div className={styles.editActions}>
                <button
                  className={styles.saveButton}
                  onClick={handleSaveName}
                  aria-label="Salvar nome"
                >
                  ✓ Salvar
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={handleCancelEdit}
                  aria-label="Cancelar edição"
                >
                  ✕ Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.nameDisplay}>
              <span className={styles.nameValue}>
                {userName || 'Não informado'}
              </span>
              <button
                className={styles.editButton}
                onClick={handleEdit}
                aria-label="Editar nome"
              >
                ✏️ Editar
              </button>
            </div>
          )}
        </div>

        <div className={styles.profileDivider} />

        <div className={styles.profileSection}>
          <label className={styles.profileLabel}>Licença</label>
          <div className={styles.profileValue}>
            <span className={styles.licenseBadge}>{licenseType}</span>
          </div>
        </div>

        <div className={styles.profileSection}>
          <label className={styles.profileLabel}>Versão do App</label>
          <div className={styles.profileValue}>
            <span className={styles.versionValue}>v{appVersion}</span>
          </div>
        </div>
      </div>

      <div className={styles.aboutSection}>
        <button
          className={styles.aboutButton}
          onClick={() => setShowAboutModal(true)}
          aria-label="Sobre o aplicativo"
        >
          <span className={styles.aboutIcon}>ℹ️</span>
          <span className={styles.aboutText}>Sobre o Aplicativo</span>
          <span className={styles.aboutArrow}>›</span>
        </button>
        
        <button
          className={styles.aboutButton}
          onClick={() => setShowTermsModal(true)}
          aria-label="Termos de uso e privacidade"
        >
          <span className={styles.aboutIcon}>📄</span>
          <span className={styles.aboutText}>Termos de Uso e Privacidade</span>
          <span className={styles.aboutArrow}>›</span>
        </button>
        
        <button
          className={styles.aboutButton}
          onClick={() => setShowBugReportModal(true)}
          aria-label="Reportar bug ou falha"
        >
          <span className={styles.aboutIcon}>🐛</span>
          <span className={styles.aboutText}>Reportar Bug/Falha</span>
          <span className={styles.aboutArrow}>›</span>
        </button>
      </div>

      {showSuccessToast && (
        <div className={styles.successToast}>
          ✓ Nome salvo com sucesso!
        </div>
      )}

      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />

      <BugReportModal
        isOpen={showBugReportModal}
        onClose={() => setShowBugReportModal(false)}
        userEmail={userEmail}
        userName={userName}
      />
    </div>
  );
};

