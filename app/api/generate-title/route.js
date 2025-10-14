import { GoogleGenerativeAI } from "@google/generative-ai";

// Pega a nossa chave secreta do arquivo .env.local
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    // AQUI ESTÁ A CORREÇÃO DEFINITIVA: Usando o modelo EXATO que você descobriu que funciona!
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const data = await req.json();
    const firstMessage = data.message;

    if (!firstMessage) {
      return new Response(JSON.stringify({ error: 'Nenhuma mensagem fornecida' }), { status: 400 });
    }

    // A INSTRUÇÃO SECRETA PARA O ESPECIALISTA EM TÍTULOS
    const prompt = `Gere um título curto e descritivo em português, com no máximo 4 palavras, para uma conversa que começa com a seguinte pergunta: "${firstMessage}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let title = response.text();

    // Limpa o título, removendo aspas ou outros caracteres extras que a IA possa adicionar
    title = title.replace(/["*]/g, '').trim();

    return new Response(JSON.stringify({ title }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Erro ao gerar título:", error);
    return new Response(JSON.stringify({ error: 'Falha ao gerar título' }), { status: 500 });
  }
}