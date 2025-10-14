"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import Sidebar from '../../components/Sidebar';

export default function ChatPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // NOVO: Estado para controlar a sidebar
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (user) {
      // Lógica para carregar mensagens virá aqui depois
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (!loading && 'user') {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSendMessage = async (e) => {
    // A lógica de enviar mensagem virá aqui depois
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-blue-50">
        <p className="text-blue-800">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Passamos o estado para a Sidebar saber se deve estar aberta ou fechada */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex flex-1 flex-col bg-blue-50">
        <header className="bg-white shadow-md p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center">
            {/* BOTÃO HAMBÚRGUER (SÓ APARECE NO CELULAR) */}
            <button onClick={() => setIsSidebarOpen(true)} className="mr-4 p-1 text-gray-600 md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-blue-800">Robô C.A.L.M.A.</h1>
          </div>
          <button onClick={handleLogout} title="Sair" className="p-2 rounded-full text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex flex-col justify-center items-center h-full text-center p-4">
            <h2 className="font-serif text-3xl font-bold text-blue-800">Selecione ou crie uma nova conversa</h2>
            <p className="mt-2 text-lg text-gray-600">Seu histórico aparecerá na barra lateral.</p>
          </div>
        </main>

        <footer className="bg-white p-4 shadow-inner flex-shrink-0">
          <div className="flex items-center">
            <input type="text" placeholder="Inicie uma nova conversa para começar..." className="flex-1 rounded-full border-gray-300 px-4 py-2 bg-gray-100" disabled />
            <button type="submit" className="ml-4 rounded-full bg-gray-300 p-3 text-white cursor-not-allowed" disabled>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986a.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}