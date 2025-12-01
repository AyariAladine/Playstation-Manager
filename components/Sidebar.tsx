"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

export default function Sidebar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  async function handleLogout() {
    try {
      await axios.post("/api/auth/logout");
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-3 rounded-xl shadow-lg"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 p-6 min-h-screen bg-linear-to-b from-white via-blue-50 to-blue-100 
        shadow-2xl border-r border-blue-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-orange-400 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all">
              <span className="text-3xl sm:text-4xl">🎮</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">PlayStation</div>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          <Link href="/dashboard" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-xl hover:bg-blue-500 hover:text-white text-gray-700 hover:shadow-lg transition-all flex items-center gap-3 group font-medium">
            <span className="text-xl">📊</span>
            <span>Dashboard</span>
          </Link>
          <Link href="/playstations" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-xl hover:bg-blue-500 hover:text-white text-gray-700 hover:shadow-lg transition-all flex items-center gap-3 group font-medium">
            <span className="text-xl">🎮</span>
            <span>PlayStations</span>
          </Link>
          <Link href="/players" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-xl hover:bg-blue-500 hover:text-white text-gray-700 hover:shadow-lg transition-all flex items-center gap-3 group font-medium">
            <span className="text-xl">👥</span>
            <span>Players</span>
          </Link>
          <Link href="/games" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-xl hover:bg-blue-500 hover:text-white text-gray-700 hover:shadow-lg transition-all flex items-center gap-3 group font-medium">
            <span className="text-xl">🎯</span>
            <span>Games</span>
          </Link>
          <Link href="/sessions" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-xl hover:bg-blue-500 hover:text-white text-gray-700 hover:shadow-lg transition-all flex items-center gap-3 group font-medium">
            <span className="text-xl">⏱️</span>
            <span>Sessions</span>
          </Link>
          <Link href="/reports" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-xl hover:bg-blue-500 hover:text-white text-gray-700 hover:shadow-lg transition-all flex items-center gap-3 group font-medium">
            <span className="text-xl">📈</span>
            <span>Reports</span>
          </Link>
          <Link href="/settings" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-xl hover:bg-blue-500 hover:text-white text-gray-700 hover:shadow-lg transition-all flex items-center gap-3 group font-medium">
            <span className="text-xl">⚙️</span>
            <span>Settings</span>
          </Link>
          <div className="border-t border-gray-300 my-4"></div>
          <button
            onClick={() => { handleLogout(); setIsOpen(false); }}
            className="px-4 py-3 rounded-xl text-left text-gray-700 hover:bg-red-500 hover:text-white hover:shadow-lg transition-all flex items-center gap-3 font-medium"
          >
            <span className="text-xl">🚪</span>
            <span>Logout</span>
          </button>
        </nav>
      </aside>
    </>
  );
}
