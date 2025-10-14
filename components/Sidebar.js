"use client";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { useEffect, useState, useRef } from "react";
import ContextMenu from './ContextMenu';

// Link do WhatsApp (Brasil = 55). Número: 21 98817-0913
const WHATSAPP_LINK =
  "https://wa.me/5521988170913?text=Ol%C3%A1%2C%20vim%20do%20Rob%C3%B4%20C.A.L.M.A.%20e%20quero%20saber%20mais%20sobre%20o%20M%C3%A9todo%20C.A.L.M.A.";

export default function Sidebar({
  isOpen,
  setIsOpen,
  handleNewChat,
  handleSelectChat,
  activeChatId,
  handleRenameChat,
  handleDeleteChat
}) {
  const [user] = useAuthState(auth);
  const [chats, setChats] = useState([]);
  const [editingChatId, setEditingChatId] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  const [menuData, setMenuData] = useState({ isOpen: false, x: 0, y: 0, chat: null });
  const longPressTimer = useRef();
  const isLongPress = useRef(false);

  // carrega lista de chats
  useEffect(() => {
    if (user) {
      const chatsRef = collection(db, 'users', user.uid, 'chats');
      const q = query(chatsRef, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [user]);

  const closeMenu = () => setMenuData({ isOpen: false, x: 0, y: 0, chat: null });

  const startEditing = () => {
    if (!menuData.chat) return;
    setEditingChatId(menuData.chat.id);
    setNewTitle(menuData.chat.title || "");
    closeMenu();
  };

  const submitRename = async (chatId) => {
    const title = newTitle.trim();
    setEditingChatId(null);
    if (!title) return;
    await handleRenameChat(chatId, title);
    setNewTitle("");
  };

  const confirmDelete = async () => {
    if (!menuData.chat) return;
    const ok = window.confirm(`Tem certeza que deseja excluir a conversa "${menuData.chat.title}"? Esta ação não pode ser desfeita.`);
    if (ok) await handleDeleteChat(menuData.chat.id);
    closeMenu();
  };

  // toque longo (mobile)
  const handleTouchStart = (e, chat) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      e.preventDefault();
      isLongPress.current = true;
      const position = e.touches?.[0];
      setMenuData({ isOpen: true, x: position?.pageX || 0, y: position?.pageY || 0, chat });
    }, 500);
  };

  const handleTouchEnd = (e, chat) => {
    clearTimeout(longPressTimer.current);
    if (!isLongPress.current) {
      if (!menuData.isOpen && editingChatId !== chat.id) {
        handleSelectChat(chat.id);
        setIsOpen(false);
      }
    }
  };

  // clique direito (desktop)
  const handleContextMenu = (e, chat) => {
    e.preventDefault();
    setMenuData({ isOpen: true, x: e.pageX, y: e.pageY, chat });
  };

  // clique normal (desktop)
  const handleClickItem = (chat) => {
    if (!menuData.isOpen && editingChatId !== chat.id) {
      handleSelectChat(chat.id);
      setIsOpen(false);
    }
  };

  const openWhatsapp = () => {
    if (typeof window !== 'undefined') window.open(WHATSAPP_LINK, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const selectedId = menuData.chat?.id;

  return (
    <>
      <div
        className={`sidebar-history fixed inset-y-0 left-0 z-30 flex h-full flex-col bg-gray-800 text-white w-72 p-4 transform transition-transform duration-300 ease-in-out 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 md:w-64`}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Topo: botão Nova conversa + fechar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleNewChat}
            className="flex-1 rounded-lg border border-gray-600 p-2 text-left text-sm hover:bg-gray-700"
          >
            + Nova Conversa
          </button>
          <button onClick={() => setIsOpen(false)} className="ml-2 p-1 text-white md:hidden" aria-label="Fechar menu">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* CTA: Conheça o Método C.A.L.M.A. */}
        <div className="mb-4 rounded-lg bg-blue-900/30 border border-blue-700 p-3">
          <p className="text-sm font-semibold text-blue-200 mb-1">
            Conheça o <span className="text-white">Método C.A.L.M.A.</span>
          </p>
          <p className="text-xs text-blue-100/90 mb-2">
            Controle a ansiedade e a compulsão. Emagreça com leveza.
          </p>
          <button
            onClick={openWhatsapp}
            className="w-full text-center text-sm font-medium rounded-md bg-green-600 hover:bg-green-700 px-3 py-2"
          >
            Falar no WhatsApp
          </button>
        </div>

        {/* Histórico */}
        <div className="flex-1 overflow-y-auto">
          <p className="text-xs text-gray-400">Histórico de Conversas</p>
          <ul className="mt-2 space-y-2">
            {chats.map(chat => {
              const isSelectedByMenu = selectedId === chat.id;
              return (
                <li
                  key={chat.id}
                  onClick={() => handleClickItem(chat)}               // desktop: clique normal
                  onContextMenu={(e) => handleContextMenu(e, chat)}   // desktop: clique direito
                  onTouchStart={(e) => handleTouchStart(e, chat)}     // mobile: toque longo
                  onTouchEnd={(e) => handleTouchEnd(e, chat)}         // mobile: toque curto
                  onTouchMove={() => clearTimeout(longPressTimer.current)} // cancela se arrastar
                  className={[
                    "flex items-center justify-between rounded-lg p-2 text-sm text-gray-300 hover:bg-gray-700 select-none transition",
                    activeChatId === chat.id && !editingChatId ? "bg-gray-700" : "",
                    isSelectedByMenu ? "ring-2 ring-blue-400 bg-gray-700/80 scale-[.99]" : ""
                  ].join(" ")}
                >
                  {editingChatId === chat.id ? (
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onBlur={() => submitRename(chat.id)}
                      onKeyDown={(e) => e.key === 'Enter' && submitRename(chat.id)}
                      className="w-full bg-transparent text-white outline-none"
                      autoFocus
                    />
                  ) : (
                    <span className="truncate cursor-pointer" title={chat.title || 'Nova Conversa...'}>
                      {chat.title || 'Nova Conversa...'}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* MENU com overlay e “pílula” do título */}
      <ContextMenu
        isOpen={menuData.isOpen}
        x={menuData.x}
        y={menuData.y}
        onClose={closeMenu}
        onRename={startEditing}
        onDelete={confirmDelete}
        title={menuData.chat?.title || "Nova Conversa..."}
      />
    </>
  );
}
