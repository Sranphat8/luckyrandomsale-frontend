import React from "react";

export default function Navbar({ account, onConnect }) {
  return (
    <nav className="sticky top-0 z-40 bg-gradient-to-r from-black via-gray-900 to-gray-800 border-b border-gray-700 shadow-lg">
      <div className="max-w-6xl mx-auto px-5 py-2 flex items-center justify-between text-gray-200">
        
        {/* โลโก้ */}
        <a href="#home" className="flex items-center">
          <img
            src="https://i.pinimg.com/474x/39/d4/a0/39d4a0aacd23dfccc2871e8a6fb76d26.jpg"
            alt="Lucky Random Sale Logo"
            className="h-14 w-auto object-contain rounded-md shadow-md hover:scale-[1.02] transition-transform duration-200"
          />
        </a>

        {/* เมนู */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a
            href="#about"
            className="hover:text-white transition-colors duration-200"
          >
            เกี่ยวกับ
          </a>
          <a
            href="#items"
            className="hover:text-white transition-colors duration-200"
          >
            รายการสุ่ม
          </a>
          <a
            href="#fairness"
            className="hover:text-white transition-colors duration-200"
          >
            ความโปร่งใส
          </a>
        </div>

        {/* ปุ่ม Connect / แสดงบัญชี */}
        {!account ? (
          <button
            onClick={onConnect}
            className="px-5 py-2 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-100 active:scale-[0.98] transition"
          >
            เชื่อมต่อกระเป๋า
          </button>
        ) : (
          <div className="text-xs md:text-sm bg-gray-700/70 px-3 py-1.5 rounded-lg text-gray-200 border border-gray-600">
            {short(account)}
          </div>
        )}
      </div>
    </nav>
  );
}

function short(a) {
  return a ? a.slice(0, 6) + "..." + a.slice(-4) : "";
}
