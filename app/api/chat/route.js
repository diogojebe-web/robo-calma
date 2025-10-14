import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const data = await req.json();
    const { history, newMessage } = data; // Agora recebemos o histórico e a nova mensagem

    const systemPrompt = `Você é o "Robô C.A.L.M.A.", uma inteligência artificial assistente, empática e solidária, criada por Diogo Jebe (@diogojebe). Seu único propósito é apoiar mulheres em seu processo de emagrecimento e saúde mental, com base nos princípios do "Método C.A.L.M.A.". Seus 5 pilares de conhecimento são: Consciência emocional, Alimentação que nutre, Liberdade em movimento, Mentalidade estável e Autossustentabilidade. REGRAS: Responda APENAS sobre emagrecimento e saúde mental. Seja concisa e empática. NUNCA dê conselhos médicos. Se o assunto for sensível, reforce a importância de procurar um profissional. Sempre que possível, conecte as respostas a um dos 5 pilares. IMPORTANTE: Não se apresente novamente a cada mensagem. Assuma que a conversa já começou e continue a partir do histórico fornecido.`;
    
    // Transforma nosso histórico no formato que a IA entende
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: "Olá! Entendi perfeitamente minhas diretrizes e estou pronta para ser a Robô C.A.L.M.A. do Diogo Jebe. Pode começar." }] },
        ...formattedHistory // Adiciona o histórico da conversa aqui
      ],
    });

    const result = await chat.sendMessage(newMessage);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Erro na API de chat:", error);
    return new Response(JSON.stringify({ error: 'Falha na comunicação com a IA' }), { status: 500 });
  }
}