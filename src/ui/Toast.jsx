import React from "react";

export default function Toast({ show, type="success", message="", onClose }) {
  if (!show) return null;
  const color = type === "error" ? "bg-red-600" : "bg-emerald-600";
  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div className={`text-white px-4 py-3 rounded-xl shadow-lg ${color} pop`}>
        <div className="flex items-start gap-3">
          <span className="text-xl">{type === "error" ? "⚠️" : "🎉"}</span>
          <div className="max-w-xs">{message}</div>
          <button className="opacity-80 hover:opacity-100" onClick={onClose}>✖</button>
        </div>
      </div>
    </div>
  );
}
