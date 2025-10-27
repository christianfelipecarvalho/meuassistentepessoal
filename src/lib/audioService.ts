import { ParsedTransaction } from '@/types';

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording: boolean = false;

  async startRecording(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        this.audioChunks.push(event.data);
      };
      
      this.mediaRecorder.start();
      this.isRecording = true;
      
      return true;
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      throw new Error('Não foi possível acessar o microfone');
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('Nenhuma gravação em andamento'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.isRecording = false;
        
        // Parar todas as tracks do stream
        this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
        
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  getRecordingState(): boolean {
    return this.isRecording;
  }

  async checkMicrophonePermission(): Promise<boolean> {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return result.state === 'granted';
    } catch (error) {
      console.error('Erro ao verificar permissão do microfone:', error);
      return false;
    }
  }
}

export class SpeechTranscriber {
  private isSupported: boolean;

  constructor() {
    this.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    if (!this.isSupported) {
      throw new Error('Transcrição de áudio não suportada neste navegador');
    }

    // Para simplicidade, vamos usar uma abordagem que converte o áudio para texto
    // Em produção, você usaria uma API como Google Speech-to-Text ou Azure Speech
    return new Promise((resolve, reject) => {
      try {
        // Simulação de transcrição - em produção, você enviaria o áudio para uma API
        const mockTranscription = this.generateMockTranscription();
        resolve(mockTranscription);
      } catch (error) {
        reject(error);
      }
    });
  }

  private generateMockTranscription(): string {
    const mockTranscriptions = [
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
    ];
    
    return mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
  }

  parseTransaction(text: string): ParsedTransaction {
    const lowerText = text.toLowerCase();
    
    // Detectar tipo (gasto ou ganho)
    const isIncome = lowerText.includes('recebi') || 
                     lowerText.includes('ganhei') || 
                     lowerText.includes('salário') ||
                     lowerText.includes('bônus') ||
                     lowerText.includes('freelancer');
    const type: 'income' | 'expense' = isIncome ? 'income' : 'expense';
    
    // Extrair valor monetário
    const amountMatch = text.match(/(\d+(?:[.,]\d+)?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0;
    
    // Detectar categoria baseada em palavras-chave
    let category = 'Outros';
    if (lowerText.includes('almoço') || lowerText.includes('comida') || lowerText.includes('lanche') || lowerText.includes('café')) {
      category = 'Alimentação';
    } else if (lowerText.includes('gasolina') || lowerText.includes('transporte') || lowerText.includes('uber') || lowerText.includes('ônibus')) {
      category = 'Transporte';
    } else if (lowerText.includes('remédio') || lowerText.includes('médico') || lowerText.includes('farmácia') || lowerText.includes('hospital')) {
      category = 'Saúde';
    } else if (lowerText.includes('livro') || lowerText.includes('curso') || lowerText.includes('educação') || lowerText.includes('escola')) {
      category = 'Educação';
    } else if (lowerText.includes('cinema') || lowerText.includes('jogo') || lowerText.includes('lazer') || lowerText.includes('diversão')) {
      category = 'Lazer';
    } else if (lowerText.includes('casa') || lowerText.includes('aluguel') || lowerText.includes('luz') || lowerText.includes('água') || lowerText.includes('internet')) {
      category = 'Casa';
    } else if (lowerText.includes('roupa') || lowerText.includes('camisa') || lowerText.includes('calça') || lowerText.includes('sapato')) {
      category = 'Roupas';
    }
    
    return {
      type,
      amount,
      category,
      description: text,
      date: new Date()
    };
  }

  isTranscriptionSupported(): boolean {
    return this.isSupported;
  }
}

// DEPRECATED: Essas funções foram movidas para @/utils/formatters
// Mantidas aqui apenas para compatibilidade com código legado
// TODO: Remover após migração completa
export { formatCurrency, formatDate } from '@/utils';
