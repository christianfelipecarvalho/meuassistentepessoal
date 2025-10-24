import React, { useState } from 'react';
import styles from './PWAInstructions.module.css';

interface PWAInstructionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstructions: React.FC<PWAInstructionsProps> = ({
  isOpen,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) {
    return null;
  }

  const steps = [
    {
      title: "Configurações do Navegador",
      content: "Vá para as configurações do seu navegador",
      icon: "⚙️"
    },
    {
      title: "Permissões do Site",
      content: "Procure por 'Permissões do site' ou 'Configurações do site'",
      icon: "🔒"
    },
    {
      title: "Encontrar o App",
      content: "Procure pelo nome do app ou pelo endereço do site",
      icon: "🔍"
    },
    {
      title: "Liberar Microfone",
      content: "Altere a permissão do microfone para 'Permitir'",
      icon: "🎤"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>📱 Como Liberar Permissões no PWA</h2>
          <p>Se você instalou o app como PWA, siga estes passos:</p>
        </div>

        <div className={styles.stepContainer}>
          <div className={styles.stepIndicator}>
            <span className={styles.stepNumber}>{currentStep + 1}</span>
            <span className={styles.stepTotal}>de {steps.length}</span>
          </div>

          <div className={styles.stepContent}>
            <div className={styles.stepIcon}>{steps[currentStep].icon}</div>
            <h3>{steps[currentStep].title}</h3>
            <p>{steps[currentStep].content}</p>
          </div>

          <div className={styles.stepProgress}>
            <div 
              className={styles.progressBar}
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.prevButton}
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Anterior
          </button>
          
          <button 
            className={styles.nextButton}
            onClick={nextStep}
          >
            {currentStep === steps.length - 1 ? 'Concluir' : 'Próximo'}
          </button>
        </div>

        <div className={styles.footer}>
          <p>💡 <strong>Dica:</strong> Após liberar as permissões, recarregue o app para que as mudanças tenham efeito.</p>
        </div>
      </div>
    </div>
  );
};
