import { NextRequest, NextResponse } from 'next/server';

// Configuração do Telegram Bot para Avaliações
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_AVALIACOES_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, rating, feedback } = body;

    // Validar dados
    if (!email || !rating || !feedback) {
      return NextResponse.json(
        { error: 'Email, avaliação e feedback são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Avaliação deve ser entre 1 e 5 estrelas' },
        { status: 400 }
      );
    }

    // Validar configuração
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('⚠️ Telegram bot de avaliações não configurado');
      return NextResponse.json(
        { error: 'Telegram bot não configurado' },
        { status: 500 }
      );
    }

    // Criar mensagem formatada
    const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    const formattedMessage = `
🤖 *NOVA AVALIAÇÃO DO APP*

${stars}
📊 *Avaliação:* ${rating}/5 estrelas
📧 *Usuário:* ${email}

💬 *Feedback:*
${feedback}

---
⏰ *Data:* ${new Date().toLocaleString('pt-BR')}
    `.trim();

    // Enviar para Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: formattedMessage,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erro ao enviar avaliação no Telegram:', error);
      return NextResponse.json(
        { error: 'Erro ao enviar avaliação no Telegram' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao processar avaliação:', error);
    return NextResponse.json(
      { error: 'Erro ao processar avaliação' },
      { status: 500 }
    );
  }
}

