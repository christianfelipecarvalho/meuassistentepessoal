// Configuração global da aplicação seguindo Single Responsibility Principle
export const AppConfig = {
  database: {
    name: 'MeuAssistenteDB',
    version: 1
  },
  
  audio: {
    sampleRate: 44100,
    echoCancellation: true,
    noiseSuppression: true,
    mimeType: 'audio/wav'
  },
  
  defaultCategories: [
    { name: 'Alimentação', color: '#ef4444', icon: '🍽️' },
    { name: 'Transporte', color: '#06b6d4', icon: '🚗' },
    { name: 'Saúde', color: '#3b82f6', icon: '🏥' },
    { name: 'Educação', color: '#10b981', icon: '📚' },
    { name: 'Lazer', color: '#f59e0b', icon: '🎮' },
    { name: 'Casa', color: '#8b5cf6', icon: '🏠' },
    { name: 'Roupas', color: '#ec4899', icon: '👕' },
    { name: 'Outros', color: '#6b7280', icon: '📦' }
  ],
  
  mockTranscriptions: [
    "Gastei 25 reais no almoço hoje",
    "Recebi 500 reais de salário",
    "Comprei remédios por 45 reais",
    "Paguei 80 reais de gasolina",
    "Gastei 15 reais no café da manhã",
    "Recebi 200 reais de freelancer",
    "Comprei uma camisa por 60 reais",
    "Paguei 120 reais de luz",
    "Gastei 30 reais no cinema",
    "Recebi 150 reais de bônus"
  ],
  
  categoryKeywords: {
    'Alimentação': ['almoço', 'comida', 'lanche', 'café', 'restaurante'],
    'Transporte': ['gasolina', 'transporte', 'uber', 'ônibus', 'taxi'],
    'Saúde': ['remédio', 'médico', 'farmácia', 'hospital', 'clínica'],
    'Educação': ['livro', 'curso', 'educação', 'escola', 'universidade'],
    'Lazer': ['cinema', 'jogo', 'lazer', 'diversão', 'show'],
    'Casa': ['casa', 'aluguel', 'luz', 'água', 'internet', 'condomínio'],
    'Roupas': ['roupa', 'camisa', 'calça', 'sapato', 'vestido']
  },
  
  incomeKeywords: ['recebi', 'ganhei', 'salário', 'bônus', 'freelancer', 'renda'],
  
  ui: {
    recordingButtonSize: {
      desktop: 200,
      mobile: 150
    },
    animationDuration: 300,
    pulseAnimationDuration: 1500
  },
  
  pwa: {
    name: 'Meu Assistente Financeiro',
    shortName: 'MeuAssistente',
    description: 'Assistente financeiro pessoal com gravação de áudio',
    themeColor: '#0ea5e9',
    backgroundColor: '#ffffff',
    display: 'standalone',
    orientation: 'portrait'
  }
} as const;

// Tipos derivados da configuração
export type AppConfigType = typeof AppConfig;
export type DefaultCategory = typeof AppConfig.defaultCategories[0];
export type CategoryKeywords = typeof AppConfig.categoryKeywords;
export type IncomeKeywords = typeof AppConfig.incomeKeywords;
