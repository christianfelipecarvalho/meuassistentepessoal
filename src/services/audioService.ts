import { IAudioRecorder, ISpeechTranscriber, ParsedTransaction } from '@/interfaces';

// Audio Recorder seguindo Single Responsibility Principle
export class AudioRecorder implements IAudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording: boolean = false;
  private stream: MediaStream | null = null;

  async startRecording(): Promise<boolean> {
    try {
      this.stream = await this.getUserMedia();
      this.setupMediaRecorder(this.stream);
      this.startMediaRecorder();
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Não foi possível acessar o microfone');
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.isValidRecordingState()) {
        reject(new Error('Nenhuma gravação em andamento'));
        return;
      }

      this.setupStopHandler(resolve);
      this.stopMediaRecorder();
    });
  }

  getRecordingState(): boolean {
    return this.isRecording;
  }

  async checkMicrophonePermission(): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }
    
    try {
      // Verificar se a API está disponível
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }

      // Tentar obter permissão com configurações específicas para mobile
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Parar o stream imediatamente
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (error) {
      console.error('Microphone permission check failed:', error);
      return false;
    }
  }

  private async getUserMedia(): Promise<MediaStream> {
    return await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100,
        channelCount: 1
      } 
    });
  }

  private setupMediaRecorder(stream: MediaStream): void {
    const options = {
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 128000
    };

    // Fallback para navegadores que não suportam opus
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'audio/webm';
    }
    
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'audio/mp4';
    }

    this.mediaRecorder = new MediaRecorder(stream, options);
    this.audioChunks = [];
    
    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };
  }

  private startMediaRecorder(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.start(1000); // Coleta dados a cada segundo
      this.isRecording = true;
    }
  }

  private isValidRecordingState(): boolean {
    return this.mediaRecorder !== null && this.isRecording;
  }

  private setupStopHandler(resolve: (value: Blob) => void): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { 
          type: this.mediaRecorder?.mimeType || 'audio/webm' 
        });
        this.cleanup();
        resolve(audioBlob);
      };
    }
  }

  private stopMediaRecorder(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }

  private cleanup(): void {
    this.isRecording = false;
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
}

// Speech Transcriber seguindo Single Responsibility Principle
export class SpeechTranscriber implements ISpeechTranscriber {
  private readonly isSupported: boolean;
  private recognition: any = null;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    
    if (this.isSupported) {
      this.initializeRecognition();
    }
  }

  private initializeRecognition(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'pt-BR';
      this.recognition.maxAlternatives = 3; // Aumentar alternativas para melhor precisão
      
      // Configurações específicas para mobile
      if (this.isMobileDevice()) {
        this.recognition.continuous = true; // Melhor para mobile
        this.recognition.interimResults = true; // Mostrar resultados parciais
      }
    }
  }

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    if (!this.isSupported) {
      throw new Error('Transcrição de áudio não suportada neste navegador');
    }

    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Reconhecimento de voz não inicializado'));
        return;
      }

      // Para mobile, não tentar transcrever áudio gravado
      // A transcrição deve ser feita em tempo real durante a gravação
      if (this.isMobileDevice()) {
        console.log('📱 Mobile detectado: transcrição de áudio gravado não suportada');
        reject(new Error('Transcrição de áudio gravado não suportada no mobile. Use transcrição em tempo real.'));
      } else {
        // Para desktop, usar a abordagem com reprodução de áudio
        this.transcribeFromBlob(audioBlob, resolve, reject);
      }
    });
  }

  private transcribeDirectly(resolve: (text: string) => void, reject: (error: Error) => void): void {
    let transcriptionResult = '';
    const timeoutId: NodeJS.Timeout = setTimeout(() => {
      this.recognition.stop();
      if (!transcriptionResult) {
        reject(new Error('Timeout na transcrição'));
      }
    }, 10000); // 10 segundos de timeout

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Priorizar resultado final, mas aceitar interim se necessário
      if (finalTranscript) {
        transcriptionResult = finalTranscript;
      } else if (interimTranscript && !transcriptionResult) {
        transcriptionResult = interimTranscript;
      }
    };

    this.recognition.onend = () => {
      clearTimeout(timeoutId);
      if (transcriptionResult) {
        resolve(transcriptionResult);
      } else {
        reject(new Error('Não foi possível transcrever o áudio'));
      }
    };

    this.recognition.onerror = (event: any) => {
      clearTimeout(timeoutId);
      console.error('Erro na transcrição:', event.error);
      reject(new Error(`Erro na transcrição: ${event.error}`));
    };

    // Iniciar reconhecimento
    try {
      this.recognition.start();
    } catch (error) {
      clearTimeout(timeoutId);
      reject(new Error('Erro ao iniciar reconhecimento de voz'));
    }
  }

  private transcribeFromBlob(audioBlob: Blob, resolve: (text: string) => void, reject: (error: Error) => void): void {
    const audio = new Audio();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    audio.src = audioUrl;
    audio.controls = false;
    audio.style.display = 'none';
    document.body.appendChild(audio);

    let transcriptionResult = '';

    this.recognition.onresult = (event: any) => {
      const result = event.results[0];
      if (result && result.isFinal) {
        transcriptionResult = result[0].transcript;
      }
    };

    this.recognition.onend = () => {
      // Limpar recursos
      URL.revokeObjectURL(audioUrl);
      if (audio.parentNode) {
        document.body.removeChild(audio);
      }
      
      if (transcriptionResult) {
        resolve(transcriptionResult);
      } else {
        reject(new Error('Não foi possível transcrever o áudio'));
      }
    };

    this.recognition.onerror = (event: any) => {
      URL.revokeObjectURL(audioUrl);
      if (audio.parentNode) {
        document.body.removeChild(audio);
      }
      reject(new Error(`Erro na transcrição: ${event.error}`));
    };

    // Reproduzir o áudio e iniciar o reconhecimento
    audio.play().then(() => {
      this.recognition.start();
    }).catch((error) => {
      URL.revokeObjectURL(audioUrl);
      if (audio.parentNode) {
        document.body.removeChild(audio);
      }
      reject(new Error('Erro ao reproduzir áudio para transcrição'));
    });
  }

  // Método para transcrição em tempo real (durante a gravação)
  startRealTimeTranscription(onResult: (text: string) => void, onError: (error: Error) => void): void {
    if (!this.isSupported || !this.recognition) {
      onError(new Error('Transcrição em tempo real não suportada'));
      return;
    }

    console.log('🔄 Iniciando transcrição em tempo real...');
    
    // Reinicializar reconhecimento para garantir configurações corretas
    this.initializeRecognition();
    
    // Configurações otimizadas para mobile
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    
    // Configurações específicas para mobile
    if (this.isMobileDevice()) {
      this.recognition.maxAlternatives = 3;
      console.log('📱 Configurações mobile aplicadas');
    }

    let accumulatedText = '';
    let isStarted = false;

    this.recognition.onresult = (event: any) => {
      console.log('📝 Resultado recebido:', event);
      
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      console.log(`Final: "${finalTranscript}", Interim: "${interimTranscript}"`);

      // Acumular texto final
      if (finalTranscript) {
        accumulatedText += finalTranscript + ' ';
        console.log(`✅ Texto acumulado: "${accumulatedText.trim()}"`);
        onResult(accumulatedText.trim());
      } else if (interimTranscript) {
        // Mostrar texto acumulado + interim
        const currentText = (accumulatedText + interimTranscript).trim();
        console.log(`🔄 Texto atual: "${currentText}"`);
        onResult(currentText);
      }
    };

    this.recognition.onstart = () => {
      console.log('✅ Transcrição em tempo real iniciada');
      isStarted = true;
    };

    this.recognition.onend = () => {
      console.log('⏹️ Transcrição em tempo real finalizada');
      if (accumulatedText) {
        console.log(`📋 Texto final: "${accumulatedText.trim()}"`);
        onResult(accumulatedText.trim());
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('❌ Erro na transcrição em tempo real:', event.error);
      
      // Não parar por erros menores em mobile
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        console.log('⚠️ Erro menor ignorado:', event.error);
        return;
      }
      
      // Se não conseguiu iniciar, tentar novamente após um delay
      if (!isStarted && (event.error === 'not-allowed' || event.error === 'service-not-allowed')) {
        console.log('🔄 Tentando reiniciar após erro de permissão...');
        setTimeout(() => {
          try {
            this.recognition.start();
          } catch (error) {
            console.error('❌ Erro ao reiniciar:', error);
          }
        }, 1000);
        return;
      }
      
      onError(new Error(`Erro na transcrição: ${event.error}`));
    };

    try {
      console.log('🚀 Iniciando Speech Recognition...');
      this.recognition.start();
    } catch (error) {
      console.error('❌ Erro ao iniciar transcrição:', error);
      onError(new Error('Erro ao iniciar transcrição em tempo real'));
    }
  }

  stopRealTimeTranscription(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  parseTransaction(text: string): ParsedTransaction {
    const lowerText = text.toLowerCase();
    
    return {
      type: this.detectTransactionType(lowerText),
      amount: this.extractAmount(text),
      category: this.detectCategory(lowerText),
      description: text.trim(),
      date: new Date()
    };
  }

  isTranscriptionSupported(): boolean {
    return this.isSupported;
  }

  private detectTransactionType(lowerText: string): 'income' | 'expense' {
    const incomeKeywords = [
      'recebi', 'ganhei', 'salário', 'bônus', 'freelancer', 'renda', 
      'entrada', 'depósito', 'pagamento', 'venda', 'lucro', 'dividendo',
      'reembolso', 'devolução', 'cashback', 'cash back'
    ];
    
    const expenseKeywords = [
      'gastei', 'paguei', 'comprei', 'comprar', 'gasto', 'despesa',
      'saída', 'débito', 'retirada', 'compra', 'pagamento de'
    ];

    const isIncome = incomeKeywords.some(keyword => lowerText.includes(keyword));
    const isExpense = expenseKeywords.some(keyword => lowerText.includes(keyword));
    
    // Se não conseguir detectar pelo contexto, assume que é gasto
    return isIncome ? 'income' : 'expense';
  }

  private extractAmount(text: string): number {
    console.log(`Tentando extrair valor de: "${text}"`);
    
    // Padrões para detectar valores monetários - mais robustos
    const patterns = [
      // Padrões específicos com "reais"
      /(\d+(?:[.,]\d+)?)\s*(?:reais?|r\$|rs|real)/gi,
      /r\$\s*(\d+(?:[.,]\d+)?)/gi,
      
      // Padrões com palavras-chave monetárias
      /(?:gastei|paguei|comprei|recebi|ganhei)\s*(?:de\s*)?(\d+(?:[.,]\d+)?)/gi,
      
      // Padrões com "de" (ex: "gastei de 50 reais")
      /(?:de\s*)(\d+(?:[.,]\d+)?)/gi,
      
      // Padrões simples de números
      /(\d+(?:[.,]\d+)?)/g
    ];

    // Tentar cada padrão em ordem de prioridade
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          // Extrair apenas números, vírgulas e pontos
          const amountStr = match.replace(/[^\d.,]/g, '');
          if (amountStr) {
            // Converter vírgula para ponto
            const normalizedAmount = amountStr.replace(',', '.');
            const amount = parseFloat(normalizedAmount);
            
            if (!isNaN(amount) && amount > 0 && amount < 1000000) { // Limite razoável
              console.log(`✅ Valor detectado: ${amount} de "${match}"`);
              return amount;
            }
          }
        }
      }
    }

    console.log(`❌ Nenhum valor detectado em: "${text}"`);
    
    // Se não conseguir detectar valor, retorna um valor padrão baseado no contexto
    const lowerText = text.toLowerCase();
    if (lowerText.includes('gastei') || lowerText.includes('paguei') || lowerText.includes('comprei')) {
      console.log(`⚠️ Usando valor padrão para gasto: 1`);
      return 1; // Valor mínimo para gastos
    }
    if (lowerText.includes('recebi') || lowerText.includes('ganhei')) {
      console.log(`⚠️ Usando valor padrão para ganho: 1`);
      return 1; // Valor mínimo para ganhos
    }

    return 0;
  }

  private detectCategory(lowerText: string): string {
    const categoryKeywords = {
      'Alimentação': [
        'almoço', 'comida', 'lanche', 'café', 'restaurante', 'lanchonete',
        'padaria', 'supermercado', 'mercado', 'feira', 'açougue', 'peixaria',
        'pizza', 'hambúrguer', 'sanduíche', 'sorvete', 'doces', 'sobremesa',
        'bebida', 'refrigerante', 'suco', 'água', 'cerveja', 'vinho'
      ],
      'Transporte': [
        'gasolina', 'transporte', 'uber', 'ônibus', 'taxi', 'metrô',
        'trem', 'avião', 'passagem', 'combustível', 'estacionamento',
        'pedágio', 'manutenção', 'pneu', 'óleo', 'revisão', 'seguro'
      ],
      'Saúde': [
        'remédio', 'médico', 'farmácia', 'hospital', 'clínica', 'dentista',
        'exame', 'consulta', 'vacina', 'fisioterapia', 'psicólogo',
        'plano de saúde', 'convênio', 'medicamento', 'suplemento'
      ],
      'Educação': [
        'livro', 'curso', 'educação', 'escola', 'universidade', 'faculdade',
        'material escolar', 'mensalidade', 'matrícula', 'aula particular',
        'idioma', 'inglês', 'espanhol', 'francês', 'certificação'
      ],
      'Lazer': [
        'cinema', 'jogo', 'lazer', 'diversão', 'show', 'concerto', 'teatro',
        'museu', 'parque', 'viagem', 'turismo', 'hotel', 'pousada',
        'praia', 'montanha', 'festa', 'aniversário', 'casamento'
      ],
      'Casa': [
        'casa', 'aluguel', 'luz', 'água', 'internet', 'condomínio',
        'telefone', 'gás', 'limpeza', 'reforma', 'construção',
        'móveis', 'eletrodomésticos', 'decoração', 'jardinagem'
      ],
      'Roupas': [
        'roupa', 'camisa', 'calça', 'sapato', 'vestido', 'blusa',
        'calçado', 'acessórios', 'bolsa', 'carteira', 'relógio',
        'óculos', 'perfume', 'cosméticos', 'maquiagem'
      ],
      'Tecnologia': [
        'celular', 'smartphone', 'computador', 'notebook', 'tablet',
        'internet', 'wi-fi', 'software', 'aplicativo', 'jogo digital',
        'streaming', 'netflix', 'spotify', 'youtube premium'
      ]
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }

    return 'Outros';
  }
}

// Formatter seguindo Single Responsibility Principle
export class Formatter {
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  }

  static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}
