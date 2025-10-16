"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import Sidebar from "../../components/Sidebar";

export default function ChatPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  // NOVA CONVERSA
  const handleNewChat = async () => {
    if (!user) return null;
    const chatsRef = collection(db, "users", user.uid, "chats");
    const newChatRef = await addDoc(chatsRef, {
      title: "Nova Conversa...",
      createdAt: serverTimestamp(),
    });
    setActiveChatId(newChatRef.id);
    setMessages([]);
    setIsSidebarOpen(false);
    return newChatRef.id;
  };

  // SELECIONAR CONVERSA
  const handleSelectChat = (chatId) => setActiveChatId(chatId);

  // RENOMEAR CONVERSA
  const handleRenameChat = async (chatId, newTitle) => {
    if (!user || !newTitle?.trim()) return;
    try {
      const chatRef = doc(db, "users", user.uid, "chats", chatId);
      await updateDoc(chatRef, { title: newTitle.trim() });
    } catch (e) {
      console.error("Erro ao renomear chat:", e);
      alert("Não consegui renomear. Tente novamente.");
    }
  };

  // EXCLUIR CONVERSA
  const handleDeleteChat = async (chatId) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);

      // apaga mensagens
      const msgsRef = collection(db, "users", user.uid, "chats", chatId, "messages");
      const msgsSnap = await getDocs(msgsRef);
      msgsSnap.forEach((d) => batch.delete(d.ref));

      // apaga o próprio chat
      const chatRef = doc(db, "users", user.uid, "chats", chatId);
      batch.delete(chatRef);

      await batch.commit();

      if (activeChatId === chatId) {
        setActiveChatId(null);
        setMessages([]);
      }
    } catch (e) {
      console.error("Erro ao excluir chat:", e);
      alert("Não consegui excluir. Tente novamente.");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Ouve mensagens do chat ativo
  useEffect(() => {
    if (user && activeChatId) {
      const messagesRef = collection(db, "users", user.uid, "chats", activeChatId, "messages");
      const q = query(messagesRef, orderBy("timestamp"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const history = querySnapshot.docs.map((doc) => doc.data());
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
      router.push("/");
    }
  }, [user, loading, router]);

  // Enviar mensagem
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || !user) return;

    let currentChatId = activeChatId;
    if (!currentChatId) {
      const newChatId = await handleNewChat();
      if (newChatId) currentChatId = newChatId;
      else return;
    }

    const userMessageText = userInput;
    const currentMessages = messages;
    setUserInput("");
    setIsLoading(true);

    const messagesRef = collection(db, "users", user.uid, "chats", currentChatId, "messages");
    await addDoc(messagesRef, {
      role: "user",
      text: userMessageText,
      timestamp: serverTimestamp(),
    });

    try {
      // Gera título na 1ª mensagem
      if (currentMessages.length === 0) {
        fetch("/api/generate-title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessageText }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.title) {
              const chatRef = doc(db, "users", user.uid, "chats", currentChatId);
              updateDoc(chatRef, { title: data.title });
            }
          })
          .catch((error) => console.error("Erro ao gerar título:", error));
      }

      // Chamada da API de chat OTIMIZADA (server devolve usage + model)
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: currentMessages, newMessage: userMessageText }),
      });
      const data = await response.json();

      await addDoc(messagesRef, {
        role: "bot",
        text: data.text,
        timestamp: serverTimestamp(),
      });

      // >>> Salvar USO DE TOKENS (se veio da API)
      try {
        if (data?.usage) {
          const usageRef = collection(db, "users", user.uid, "chats", currentChatId, "usage");
          await addDoc(usageRef, {
            model: data.model || "desconhecido",
            promptTokens: data.usage.promptTokenCount ?? null,
            outputTokens: data.usage.candidatesTokenCount ?? null,
            totalTokens: data.usage.totalTokenCount ?? null,
            createdAt: serverTimestamp(),
          });
          console.log("USAGE:", data.usage);
        }
      } catch (e) {
        console.warn("Não consegui salvar usage:", e);
      }
    } catch (error) {
      console.error("Erro na comunicação com a API:", error);
      await addDoc(messagesRef, {
        role: "bot",
        text: "Desculpe, estou com um problema. Tente novamente mais tarde.",
        timestamp: serverTimestamp(),
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
    <div className="flex w-full bg-gray-100" style={{ height: windowHeight || "100vh" }}>
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        handleNewChat={handleNewChat}
        handleSelectChat={handleSelectChat}
        activeChatId={activeChatId}
        handleRenameChat={handleRenameChat}
        handleDeleteChat={handleDeleteChat}
      />

      <div className="flex flex-1 flex-col h-full">
        <header className="bg-white shadow-md p-4 flex items-center justify-between flex-shrink-0 z-10">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="mr-4 p-1 text-gray-600 md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-blue-800">Robô C.A.L.M.A.</h1>
          </div>
          <button
            onClick={handleLogout}
            title="Sair"
            className="p-2 rounded-full text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-blue-50">
          {!activeChatId && messages.length === 0 && !isLoading && (
            <div className="flex flex-col justify-center items-center h-full text-center p-4">
              <h2 className="font-serif text-3xl font-bold text-blue-800">Robô C.A.L.M.A.</h2>
              <p className="mt-2 text-lg text-gray-600">Seu assistente de bem-estar. Como posso te ajudar hoje?</p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md rounded-lg p-3 shadow ${
                  msg.role === "user" ? "bg-blue-600 text-white" : "bg-white text-gray-800"
                }`}
              >
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

          <div ref={messagesEndRef} />
        </main>

        <footer className="bg-white p-4 shadow-inner flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={isLoading ? "Aguarde..." : "Digite sua mensagem..."}
              className="flex-1 rounded-full border border-gray-300 px-4 py-2
                         bg-white text-gray-900 placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="ml-4 rounded-full bg-blue-600 p-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300"
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986a.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}
