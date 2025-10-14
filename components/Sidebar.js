"use client";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { useEffect, useState, useRef } from "react";
import ContextMenu from './ContextMenu';

export default function Sidebar({ isOpen, setIsOpen, handleNewChat, handleSelectChat, activeChatId, handleRenameChat, handleDeleteChat }) {
  const [user] = useAuthState(auth);
  const [chats, setChats] = useState([]);
  const [editingChatId, setEditingChatId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  
  const [menuData, setMenuData] = useState({ isOpen: false, x: 0, y: 0, chat: null });
  const longPressTimer = useRef();
  const isLongPress = useRef(false);

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
  
  const openMenu = (e, chat) => {
    e.preventDefault();
    setMenuData({ isOpen: true, x: e.pageX, y: e.pageY, chat: chat });
  };
  
  const closeMenu = () => setMenuData({ isOpen: false, x: 0, y: 0, chat: null });

  const startEditing = () => {
    if (!menuData.chat) return;
    setEditingChatId(menuData.chat.id);
    setNewTitle(menuData.chat.title);
    closeMenu();
  };

  const submitRename = (chatId) => {
    if (newTitle.trim()) {
      handleRenameChat(chatId, newTitle.trim());
    }
    setEditingChatId(null);
  };
  
  const confirmDelete = () => {
    if (!menuData.chat) return;
    if(window.confirm(`Tem certeza que deseja excluir a conversa "${menuData.chat.title}"? Esta ação não pode ser desfeita.`)){
      handleDeleteChat(menuData.chat.id);
    }
    closeMenu();
  };

  const handlePressStart = (e, chat) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      const eventCoord = e.touches ? e.touches[0] : e;
      openMenu(eventCoord, chat);
    }, 500);
  };

  const handlePressEnd = (e, chat) => {
    clearTimeout(longPressTimer.current);
    if (!isLongPress.current) {
        if (e.type !== 'contextmenu' && editingChatId !== chat.id && !menuData.isOpen) {
            handleSelectChat(chat.id);
            setIsOpen(false);
        }
    }
  };
  
  const handleContextMenu = (e, chat) => {
    e.preventDefault();
    clearTimeout(longPressTimer.current);
    openMenu(e, chat);
  };

  return (
    <>
      <div 
        className={`fixed inset-y-0 left-0 z-30 flex h-full flex-col bg-gray-800 text-white w-72 p-4 transform transition-transform duration-300 ease-in-out 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 md:w-64`}
      >
        <div className="flex items-center justify-between mb-4">
          <button onClick={handleNewChat} className="flex-1 rounded-lg border border-gray-600 p-2 text-left text-sm hover:bg-gray-700">
            + Nova Conversa
          </button>
          <button onClick={() => setIsOpen(false)} className="ml-2 p-1 text-white md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <p className="text-xs text-gray-400">Histórico de Conversas</p>
          <ul className="mt-2 space-y-2">
            {chats.map(chat => (
              <li 
                key={chat.id} 
                onMouseDown={(e) => handlePressStart(e, chat)}
                onMouseUp={(e) => handlePressEnd(e, chat)}
                onContextMenu={(e) => handleContextMenu(e, chat)}
                onTouchStart={(e) => handlePressStart(e, chat)}
                onTouchEnd={(e) => handlePressEnd(e, chat)}
                onTouchMove={() => clearTimeout(longPressTimer.current)} // Cancela se o dedo arrastar
                // AQUI ESTÁ A CORREÇÃO MÁGICA E DEFINITIVA:
                // select-none diz ao navegador para NÃO abrir o menu de copiar/colar
                className={`flex items-center justify-between rounded-lg p-2 text-sm text-gray-300 hover:bg-gray-700 select-none ${activeChatId === chat.id && !editingChatId ? 'bg-gray-700' : ''}`}
              >
                {editingChatId === chat.id ? (
                  <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onBlur={() => submitRename(chat.id)} onKeyDown={(e) => e.key === 'Enter' && submitRename(chat.id)} className="w-full bg-transparent text-white outline-none" autoFocus />
                ) : (
                  <span className="truncate cursor-pointer" title={chat.title || 'Nova Conversa...'}>{chat.title || 'Nova Conversa...'}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <ContextMenu 
        isOpen={menuData.isOpen}
        x={menuData.x}
        y={menuData.y}
        onClose={closeMenu}
        onRename={startEditing}
        onDelete={confirmDelete}
      />
    </>
  );
}