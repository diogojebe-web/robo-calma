"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function ChatPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (user) {
      const messagesRef = collection(db, 'chats', user.uid, 'messages');
      const q = query(messagesRef, orderBy('timestamp'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const history = querySnapshot.docs.map(doc => doc.data());
        setMessages(history);
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || !user) return;
    const userMessage = { 
      role: 'user', 
      text: userInput,
      timestamp: serverTimestamp() 
    };
    const messagesRef = collection(db, 'chats', user.uid, 'messages');
    await addDoc(messagesRef, userMessage);
    setUserInput('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });
      const data = await response.json();
      const botMessage = { 
        role: 'bot', 
        text: data.text,
        timestamp: serverTimestamp() 
      };
      await addDoc(messagesRef, botMessage);
    } catch (error) {
      console.error("Erro ao comunicar com a API:", error);
      const errorMessage = { 
        role: 'bot', 
        text: 'Desculpe, estou com um problema para me conectar. Tente novamente mais tarde.',
        timestamp: serverTimestamp()
      };
      await addDoc(messagesRef, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-blue-50">
        <p className="text-blue-800">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-blue-50">
      <header className="bg-white shadow-md p-4 flex items-center flex-shrink-0">
        <h1 className="text-xl font-bold text-blue-800">Robô C.A.L.M.A.</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col justify-center items-center h-full text-center p-4">
            <h2 className="font-serif text-3xl font-bold text-blue-800">Robô C.A.L.M.A.</h2>
            <p className="mt-2 text-lg text-gray-600">Seu assistente de bem-estar. Como posso te ajudar hoje?</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {/* AQUI ESTÁ A CORREÇÃO: trocamos bg-blue-500 por bg-blue-600 */}
            <div className={`max-w-xs lg:max-w-md rounded-lg p-3 shadow ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (<div className="flex justify-start"><div className="max-w-xs lg:max-w-md bg-white rounded-lg p-3 shadow"><p className="text-sm text-gray-500 animate-pulse">Digitando...</p></div></div>)}
        <div ref={messagesEndRef} />
      </main>
      <footer className="bg-white p-4 shadow-inner flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder={isLoading ? "Aguarde..." : "Digite sua mensagem..."} className="flex-1 rounded-full border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading} />
          <button type="submit" className="ml-4 rounded-full bg-blue-600 p-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300" disabled={isLoading}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg>
          </button>
        </form>
      </footer>
    </div>
  );
}