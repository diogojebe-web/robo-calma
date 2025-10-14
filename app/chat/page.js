"use client";

import { useState } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Olá! Eu sou o Robô C.A.L.M.A., seu assistente de bem-estar. Como você está se sentindo hoje?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage = { role: 'user', text: userInput };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userInput }),
      });

      const data = await response.json();
      const botMessage = { role: 'bot', text: data.text };
      setMessages(prevMessages => [...prevMessages, botMessage]);

    } catch (error) {
      console.error("Erro ao comunicar com a API:", error);
      const errorMessage = { role: 'bot', text: 'Desculpe, estou com um problema para me conectar. Tente novamente mais tarde.' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-blue-50">
      <header className="bg-white shadow-md p-4 flex items-center">
        <h1 className="text-xl font-bold text-blue-800">Robô C.A.L.M.A.</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md rounded-lg p-3 shadow ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="max-w-xs lg:max-w-md bg-white rounded-lg p-3 shadow">
                <p className="text-sm text-gray-500 animate-pulse">Digitando...</p>
              </div>
          </div>
        )}
      </main>

      <footer className="bg-white p-4 shadow-inner">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={isLoading ? "Aguarde..." : "Digite sua mensagem..."}
            className="flex-1 rounded-full border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button 
            type="submit"
            className="ml-4 rounded-full bg-blue-600 p-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}