'use client';

import React from 'react';
import styles from './TermsModal.module.css';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>📄 Termos de Uso e Privacidade</h2>
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
            <h3 className={styles.sectionTitle}>1. Aceitação dos Termos</h3>
            <p className={styles.text}>
              Ao utilizar o <strong>Meu Assistente Financeiro</strong>, você concorda com estes 
              termos de uso. Se você não concorda com qualquer parte destes termos, não deve 
              utilizar o aplicativo.
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>2. Armazenamento de Dados</h3>
            <div className={styles.importantBox}>
              <p className={styles.text}>
                <strong>IMPORTANTE:</strong> Todos os dados do aplicativo são armazenados 
                exclusivamente no seu dispositivo (celular, tablet ou computador). Nenhuma 
                informação é transmitida ou armazenada em servidores externos.
              </p>
            </div>
            <p className={styles.text}>
              Os dados são salvos localmente usando tecnologias de armazenamento do navegador 
              (localStorage, IndexedDB) e permanecem apenas no seu dispositivo.
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>3. Responsabilidade pelo Armazenamento</h3>
            <div className={styles.warningBox}>
              <p className={styles.text}>
                <strong>Você é o único responsável por:</strong>
              </p>
              <ul className={styles.responsibilityList}>
                <li>Fazer backup regular dos seus dados</li>
                <li>Proteger o acesso ao seu dispositivo</li>
                <li>Manter a segurança do seu dispositivo</li>
                <li>Prevenir perda, roubo ou danos ao dispositivo</li>
              </ul>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>4. Limitação de Responsabilidade</h3>
            <p className={styles.text}>
              <strong>O desenvolvedor e distribuidor deste aplicativo NÃO se responsabilizam por:</strong>
            </p>
            <ul className={styles.responsibilityList}>
              <li>Perda de dados devido a falhas do dispositivo</li>
              <li>Perda de dados devido a formatação, reset ou troca de dispositivo</li>
              <li>Perda de dados devido a exclusão acidental pelo usuário</li>
              <li>Perda de dados devido a problemas técnicos do navegador ou sistema operacional</li>
              <li>Perda de dados devido a atualizações do navegador ou sistema</li>
              <li>Qualquer dano financeiro ou prejuízo decorrente do uso ou não uso do aplicativo</li>
              <li>Inconsistências ou erros nos cálculos financeiros</li>
              <li>Decisões financeiras tomadas com base nas informações do aplicativo</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>5. Privacidade</h3>
            <p className={styles.text}>
              Como todos os dados são armazenados localmente no seu dispositivo, garantimos que:
            </p>
            <ul className={styles.privacyList}>
              <li>✓ Nenhum dado é coletado ou transmitido para servidores externos</li>
              <li>✓ Nenhum dado é compartilhado com terceiros</li>
              <li>✓ Não há rastreamento de uso ou analytics externos</li>
              <li>✓ Você tem controle total sobre seus dados</li>
            </ul>
            <p className={styles.text}>
              <strong>Nota:</strong> Alguns recursos podem usar APIs de terceiros (como transcrição de voz) 
              que podem processar dados temporariamente, mas não são armazenados por esses serviços.
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>6. Uso do Aplicativo</h3>
            <p className={styles.text}>
              Você concorda em usar o aplicativo apenas para fins legais e pessoais. É proibido:
            </p>
            <ul className={styles.responsibilityList}>
              <li>Usar o aplicativo para atividades ilegais</li>
              <li>Tentar acessar ou modificar dados de outros usuários</li>
              <li>Replicar ou distribuir o aplicativo sem autorização</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>7. Disponibilidade e Manutenção</h3>
            <p className={styles.text}>
              O aplicativo é fornecido "como está", sem garantias de qualquer tipo. Não garantimos:
            </p>
            <ul className={styles.responsibilityList}>
              <li>Disponibilidade contínua do aplicativo</li>
              <li>Correção de bugs ou erros</li>
              <li>Atualizações regulares</li>
              <li>Suporte técnico</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>8. Modificações dos Termos</h3>
            <p className={styles.text}>
              Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações 
              entrarão em vigor imediatamente após a publicação. É sua responsabilidade revisar 
              periodicamente estes termos.
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>9. Contato</h3>
            <p className={styles.text}>
              Em caso de dúvidas sobre estes termos, você pode entrar em contato através do 
              formulário de feedback disponível no aplicativo.
            </p>
          </div>

          <div className={styles.section}>
            <div className={styles.agreementBox}>
              <p className={styles.agreementText}>
                <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
              <p className={styles.agreementText}>
                Ao continuar usando o aplicativo, você confirma que leu, entendeu e concorda 
                com estes termos de uso.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.closeFooterButton}
            onClick={onClose}
          >
            Li e Entendi
          </button>
        </div>
      </div>
    </div>
  );
};

