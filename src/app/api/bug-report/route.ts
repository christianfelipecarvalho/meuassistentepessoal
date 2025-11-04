import { NextRequest, NextResponse } from 'next/server';

// Configuração do Telegram Bot
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, userName, bugDescription, stepsToReproduce, appVersion } = body;

    // Validar dados
    if (!email || !bugDescription) {
      return NextResponse.json(
        { error: 'Email e descrição do bug são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar configuração
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('⚠️ Telegram bot não configurado. Configure as variáveis de ambiente.');
      return NextResponse.json(
        { error: 'Telegram bot não configurado' },
        { status: 500 }
      );
    }

    // Formatar mensagem
    const formattedMessage = `🐛 *REPORTE DE BUG/FALHA*

📧 *Usuário:* ${email}
${userName ? `👤 *Nome:* ${userName}\n` : ''}📱 *Versão do App:* ${appVersion || 'Não informado'}

🐛 *Descrição do Bug:*
${bugDescription}

${stepsToReproduce ? `📝 *Passos para Reproduzir:*\n${stepsToReproduce}\n` : ''}---
⏰ *Data:* ${new Date().toLocaleString('pt-BR')}
🕐 *Hora:* ${new Date().toLocaleTimeString('pt-BR')}`;

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
      console.error('❌ Erro ao enviar reporte de bug no Telegram:', error);
      return NextResponse.json(
        { error: 'Erro ao enviar reporte de bug no Telegram' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao processar reporte de bug:', error);
    return NextResponse.json(
      { error: 'Erro ao processar reporte de bug' },
      { status: 500 }
    );
  }
}

