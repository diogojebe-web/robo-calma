"use client";

import { useEffect, useRef } from "react";

export default function ContextMenu({
  isOpen,
  x,
  y,
  onClose,
  onRename,
  onDelete,
  title,
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        event.preventDefault();
        event.stopPropagation();
        onClose(true); // avisa que fechou via overlay
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside, {
        passive: false,
      });
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // pílula acima do menu
  const pillOffsetY = 58;

  // clamp simples para o menu não “escapar” da tela
  const safeX = Math.max(80, Math.min(window.innerWidth - 80, x || 0));
  const safeY = Math.max(90, Math.min(window.innerHeight - 120, y || 0));

  return (
    <>
      {/* Overlay: captura completamente o toque/clique */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose(true);
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose(true);
        }}
      />

      {/* Pílula com o título */}
      <div
        className="fixed z-50 px-4 py-2 rounded-full bg-blue-100 text-blue-900 shadow"
        style={{
          left: safeX,
          top: Math.max(12, safeY - pillOffsetY),
          transform: "translateX(-50%)",
        }}
      >
        <span className="text-sm font-medium whitespace-nowrap">{title}</span>
      </div>

      {/* Menu */}
      <div
        ref={menuRef}
        className="fixed z-50 bg-gray-900 text-white rounded-xl shadow-xl p-2 w-44"
        style={{ top: safeY, left: safeX, transform: "translateX(-50%)" }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <ul className="divide-y divide-gray-800">
          <li
            onClick={() => {
              onRename();
              onClose(false);
            }}
            className="flex items-center justify-between p-3 text-sm hover:bg-gray-800 rounded-lg cursor-pointer"
          >
            <span>Renomear</span>
            <span>✏️</span>
          </li>
          <li
            onClick={() => {
              onDelete();
              onClose(false);
            }}
            className="flex items-center justify-between p-3 text-sm hover:bg-gray-800 rounded-lg cursor-pointer text-red-400"
          >
            <span>Excluir</span>
            <span>🗑️</span>
          </li>
        </ul>
      </div>
    </>
  );
}
