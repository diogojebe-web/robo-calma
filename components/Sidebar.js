"use client";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { useEffect, useState } from "react";

// Adicionamos as novas "props" para a sidebar funcionar
export default function Sidebar({ isOpen, setIsOpen, handleNewChat, handleSelectChat, activeChatId }) {
  const [user] = useAuthState(auth);
  const [chats, setChats] = useState([]);

  // Este efeito "ouve" o banco de dados em tempo real para a lista de conversas
  useEffect(() => {
    if (user) {
      // ATENÇÃO: A estrutura correta do banco de dados é 'users', user.uid, 'chats'
      const chatsRef = collection(db, 'users', user.uid, 'chats');
      const q = query(chatsRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return () => unsubscribe();
    }
  }, [user]);

  return (
    <div 
      className={`fixed inset-y-0 left-0 z-30 flex h-full flex-col bg-gray-800 text-white w-64 p-4 transform transition-transform duration-300 ease-in-out 
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      md:relative md:translate-x-0`}
    >
      <div className="flex items-center justify-between mb-4">
        {/* Agora este botão CHAMA a função para criar um novo chat */}
        <button onClick={handleNewChat} className="flex-1 rounded-lg border border-gray-600 p-2 text-left text-sm hover:bg-gray-700">
          + Nova Conversa
        </button>

        <button onClick={() => setIsOpen(false)} className="ml-2 p-1 text-white md:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <p className="text-xs text-gray-400">Histórico de Conversas</p>
        <ul className="mt-2 space-y-2">
          {/* A lista de conversas agora é dinâmica, vinda do banco de dados */}
          {chats.map(chat => (
            <li 
              key={chat.id} 
              // Ao clicar, seleciona a conversa e fecha o menu no celular
              onClick={() => {
                handleSelectChat(chat.id);
                setIsOpen(false);
              }}
              // Muda a cor de fundo se for a conversa ativa
              className={`cursor-pointer rounded-lg p-2 text-sm text-gray-300 hover:bg-gray-700 truncate ${activeChatId === chat.id ? 'bg-gray-700' : ''}`}
              title={chat.title || 'Nova Conversa...'} // Mostra o título completo ao passar o mouse
            >
              {/* O nome da conversa (o truncate ajuda a não quebrar o layout) */}
              {chat.title || 'Nova Conversa...'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}