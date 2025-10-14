"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import Sidebar from '../../components/Sidebar';

export default function ChatPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleNewChat = async () => {
    if (!user) return;
    const chatsRef = collection(db, 'users', user.uid, 'chats');
    const newChatRef = await addDoc(chatsRef, {
      title: 'Nova Conversa...',
      createdAt: serverTimestamp()
    });
    setActiveChatId(newChatRef.id);
    setMessages([]);
    setIsSidebarOpen(false); // Fecha a sidebar no celular ao criar
  };

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (user && activeChatId) {
      const messagesRef = collection(db, 'users', user.uid, 'chats', activeChatId, 'messages');
      const q = query(messagesRef, orderBy('timestamp'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const history = querySnapshot.docs.map(doc => doc.data());
        setMessages(history);
      });
      return () => unsubscribe();
    } else {
      setMessages([]);
    }
  }, [user, activeChatId]);

  useEffect(scrollToBottom, [messages, isLoading]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || !user || !activeChatId) return;
    const userMessageText = userInput;
    setUserInput('');
    setIsLoading(true);
    const messagesRef = collection(db, 'users', user.uid, 'chats', activeChatId, 'messages');
    await addDoc(messagesRef, { 
      role: 'user', 
      text: userMessageText,
      timestamp: serverTimestamp() 
    });
    try {
      if (messages.length === 0) {
        const chatRef = doc(db, 'users', user.uid, 'chats', activeChatId);
        await updateDoc(chatRef, { title: userMessageText.substring(0, 35) + (userMessageText.length > 35 ? '...' : '') });
      }
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessageText }),
      });
      const data = await response.json();
      await addDoc(messagesRef, { 
        role: 'bot', 
        text: data.text,
        timestamp: serverTimestamp() 
      });
    } catch (error) {
      console.error("Erro na comunicação com a API:", error);
      await addDoc(messagesRef, { 
        role: 'bot', 
        text: 'Desculpe, estou com um problema. Tente novamente mais tarde.',
        timestamp: serverTimestamp()
      });
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
    // ESTRUTURA CORRIGIDA PARA MOBILE
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        handleNewChat={handleNewChat}
        handleSelectChat={handleSelectChat}
        activeChatId={activeChatId}
      />
      <div className="flex flex-1 flex-col bg-blue-50">
        <header className="bg-white shadow-md p-4 flex items-center justify-between flex-shrink-0 z-10">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="mr-4 p-1 text-gray-600 md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </button>
            <h1 className="text-xl font-bold text-blue-800">Robô C.A.L.M.A.</h1>
          </div>
          <button onClick={handleLogout} title="Sair" className="p-2 rounded-full text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {!activeChatId ? (
            <div className="flex flex-col justify-center items-center h-full text-center p-4">
              <h2 className="font-serif text-3xl font-bold text-blue-800">Selecione ou crie uma nova conversa</h2>
              <p className="mt-2 text-lg text-gray-600">Seu histórico aparecerá na barra lateral.</p>
            </div>
          ) : messages.length === 0 && !isLoading ? (
            <div className="flex flex-col justify-center items-center h-full text-center p-4">
              <h2 className="font-serif text-3xl font-bold text-blue-800">Robô C.A.L.M.A.</h2>
              <p className="mt-2 text-lg text-gray-600">Seu assistente de bem-estar. Como posso te ajudar hoje?</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md rounded-lg p-3 shadow ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (<div className="flex justify-start"><div className="max-w-xs lg:max-w-md bg-white rounded-lg p-3 shadow"><p className="text-sm text-gray-500 animate-pulse">Digitando...</p></div></div>)}
          <div ref={messagesEndRef} />
        </main>
        <footer className="bg-white p-4 shadow-inner flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center">
            <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder={!activeChatId ? "Selecione uma conversa para começar" : (isLoading ? "Aguarde..." : "Digite sua mensagem...")} className="flex-1 rounded-full border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={!activeChatId || isLoading} />
            <button type="submit" className="ml-4 rounded-full bg-blue-600 p-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300" disabled={!activeChatId || isLoading}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986a.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg>
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}