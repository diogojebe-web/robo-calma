"use client";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { useEffect, useRef, useState } from "react";
import ContextMenu from "./ContextMenu";

// WhatsApp (Brasil = 55) — 21 98817-0913
const WHATSAPP_LINK =
  "https://wa.me/5521988170913?text=Ol%C3%A1%2C%20vim%20do%20Rob%C3%B4%20C.A.L.M.A.%20e%20quero%20saber%20mais%20sobre%20o%20M%C3%A9todo%20C.A.L.M.A.";

export default function Sidebar({
  isOpen,
  setIsOpen,
  handleNewChat,
  handleSelectChat,
  activeChatId,
  handleRenameChat,
  handleDeleteChat,
}) {
  const [user] = useAuthState(auth);
  const [chats, setChats] = useState([]);
  const [editingChatId, setEditingChatId] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  const [menuData, setMenuData] = useState({
    isOpen: false,
    x: 0,
    y: 0,
    chat: null,
  });

  // anti-toque-fantasma por 300ms após fechar o menu
  const [ignoreTapUntil, setIgnoreTapUntil] = useState(0);
  const shouldIgnoreTap = () => Date.now() < ignoreTapUntil;

  // long press
  const longPressTimer = useRef();
  const isLongPress = useRef(false);

  // >>> NOVO: Guardas de scroll vs clique
  const touchStartPos = useRef({ x: 0, y: 0 });
  const didMove = useRef(false);
  const MOVE_THRESHOLD = 10; // pixels

  useEffect(() => {
    if (user) {
      const chatsRef = collection(db, "users", user.uid, "chats");
      const q = query(chatsRef, orderBy("createdAt", "desc"));
      const unsub = onSnapshot(q, (snap) => {
        setChats(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      });
      return () => unsub();
    }
  }, [user]);

  const closeMenuSafely = (closedByOverlay) => {
    setMenuData({ isOpen: false, x: 0, y: 0, chat: null });
    if (closedByOverlay) setIgnoreTapUntil(Date.now() + 300);
  };

  const startEditing = () => {
    if (!menuData.chat) return;
    setEditingChatId(menuData.chat.id);
    setNewTitle(menuData.chat.title || "");
    closeMenuSafely(false);
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
    const ok = window.confirm(
      `Tem certeza que deseja excluir a conversa "${menuData.chat.title}"? Esta ação não pode ser desfeita.`
    );
    if (ok) await handleDeleteChat(menuData.chat.id);
    closeMenuSafely(false);
  };

  // ——— Toque longo (mobile)
  const handleTouchStart = (e, chat) => {
    // reset guardas
    didMove.current = false;
    const t = e.touches?.[0];
    touchStartPos.current = { x: t?.clientX || 0, y: t?.clientY || 0 };

    isLongPress.current = false;
    clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      e.preventDefault();
      isLongPress.current = true;
      const pos = e.touches?.[0];
      setMenuData({
        isOpen: true,
        x: pos?.pageX || 0,
        y: pos?.pageY || 0,
        chat,
      });
    }, 500);
  };

  const handleTouchMove = (e) => {
    // se arrastar além do limite, NÃO é clique
    const t = e.touches?.[0];
    if (!t) return;
    const dx = Math.abs(t.clientX - touchStartPos.current.x);
    const dy = Math.abs(t.clientY - touchStartPos.current.y);
    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
      didMove.current = true;
    }
    // mover cancela o long-press
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleTouchEnd = (e, chat) => {
    clearTimeout(longPressTimer.current);

    // 1) se foi long-press: nada (menu já abriu)
    if (isLongPress.current) return;

    // 2) se overlay acabou de fechar: ignora
    if (menuData.isOpen || shouldIgnoreTap()) return;

    // 3) se rolou scroll (moveu acima do limite): ignora (não é clique)
    if (didMove.current) {
      didMove.current = false;
      return;
    }

    // 4) se está editando esse chat: ignora
    if (editingChatId === chat.id) return;

    // 5) 👉 clique válido
    handleSelectChat(chat.id);
    setIsOpen(false);
  };

  // ——— Clique direito (desktop)
  const handleContextMenu = (e, chat) => {
    e.preventDefault();
    setMenuData({ isOpen: true, x: e.pageX, y: e.pageY, chat });
  };

  // ——— Clique normal (desktop)
  const handleClickItem = (chat) => {
    if (menuData.isOpen || shouldIgnoreTap()) return;
    if (editingChatId === chat.id) return;
    handleSelectChat(chat.id);
    setIsOpen(false);
  };

  const openWhatsapp = () => {
    if (typeof window !== "undefined")
      window.open(WHATSAPP_LINK, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  const selectedId = menuData.chat?.id;

  return (
    <>
      <div
        className={`sidebar-history fixed inset-y-0 left-0 z-30 flex h-full flex-col bg-gray-800 text-white w-72 p-4 transform transition-transform duration-300 ease-in-out 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:relative md:translate-x-0 md:w-64`}
        onContextMenu={(e) => e.preventDefault()}
        // dica p/ mobile: ajuda o navegador a entender que a intenção principal é rolar
        style={{ touchAction: "pan-y" }}
      >
        {/* Topo */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleNewChat}
            className="flex-1 rounded-lg border border-gray-600 p-2 text-left text-sm hover:bg-gray-700"
          >
            + Nova Conversa
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="ml-2 p-1 text-white md:hidden"
            aria-label="Fechar menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* CTA */}
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
            {chats.map((chat) => {
              const isSelectedByMenu = selectedId === chat.id;
              return (
                <li
                  key={chat.id}
                  onClick={() => handleClickItem(chat)}               // desktop
                  onContextMenu={(e) => handleContextMenu(e, chat)}   // desktop
                  onTouchStart={(e) => handleTouchStart(e, chat)}     // mobile
                  onTouchMove={handleTouchMove}                       // mobile
                  onTouchEnd={(e) => handleTouchEnd(e, chat)}         // mobile
                  className={[
                    "flex items-center justify-between rounded-lg p-2 text-sm text-gray-300 hover:bg-gray-700 select-none transition",
                    activeChatId === chat.id && !editingChatId ? "bg-gray-700" : "",
                    isSelectedByMenu ? "ring-2 ring-blue-400 bg-gray-700/80 scale-[.99]" : "",
                  ].join(" ")}
                >
                  {editingChatId === chat.id ? (
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onBlur={() => submitRename(chat.id)}
                      onKeyDown={(e) => e.key === "Enter" && submitRename(chat.id)}
                      className="w-full bg-transparent text-white outline-none"
                      autoFocus
                    />
                  ) : (
                    <span
                      className="truncate cursor-pointer"
                      title={chat.title || "Nova Conversa..."}
                    >
                      {chat.title || "Nova Conversa..."}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Context menu */}
      <ContextMenu
        isOpen={menuData.isOpen}
        x={menuData.x}
        y={menuData.y}
        onClose={(closedByOverlay) => closeMenuSafely(closedByOverlay)}
        onRename={startEditing}
        onDelete={confirmDelete}
        title={menuData.chat?.title || "Nova Conversa..."}
      />
    </>
  );
}
