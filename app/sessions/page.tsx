"use client";
import { useEffect, useState } from "react";
import axios from "axios";

type Session = {
  _id: string;
  playStation: any;
  player: any;
  game: any;
  startTime: string;
  endTime: string;
  totalPrice: number;
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    const res = await axios.get("/api/sessions");
    setSessions(res.data);
  }

  function getDuration(start: string, end: string) {
    const diff = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 1000 / 60);
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="relative">
      {/* Decorative Background */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div className="absolute top-10 right-1/4 w-72 h-72 bg-indigo-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-xl mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1">Gaming Sessions</h1>
            <p className="text-white/80">Complete session history</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
            <div className="text-sm text-white/80">Total Sessions</div>
            <div className="text-2xl font-bold text-white">{sessions.length}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {sessions.map((s) => (
          <div key={s._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-200">
            {/* Header */}
            <div className="bg-linear-to-r from-indigo-600 to-purple-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎮</span>
                  <div>
                    <div className="font-bold text-lg">{s.playStation?.name || "N/A"}</div>
                    <div className="text-xs text-indigo-200">{formatDate(s.startTime)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{s.totalPrice} DT</div>
                  <div className="text-xs text-indigo-200">Total</div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                  {s.player?.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <div className="text-xs text-gray-500">Player</div>
                  <div className="font-semibold text-gray-900">{s.player?.name || "Unknown"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                  🎯
                </div>
                <div>
                  <div className="text-xs text-gray-500">Game</div>
                  <div className="font-semibold text-gray-900">{s.game?.title || "Unknown"}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Start Time</div>
                  <div className="text-sm font-semibold text-gray-700">{formatTime(s.startTime)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">End Time</div>
                  <div className="text-sm font-semibold text-gray-700">{formatTime(s.endTime)}</div>
                </div>
              </div>

              <div className="bg-gray-50 -mx-4 -mb-4 px-4 py-3 mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <span>⏱️</span>
                  <span className="text-sm font-semibold">{getDuration(s.startTime, s.endTime)}</span>
                </div>
                <div className="text-sm font-bold text-green-600">{s.totalPrice} DT</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📊</div>
          <div className="text-xl font-semibold text-gray-600">No sessions yet</div>
          <div className="text-gray-500 mt-2">Start a gaming session to see it here</div>
        </div>
      )}
    </div>
  );
}
