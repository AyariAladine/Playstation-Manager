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

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    const res = await axios.get("/api/sessions");
    setSessions(res.data);
  }

  const dailySessions = sessions.filter((s) => {
    const day = new Date(s.endTime).toISOString().split("T")[0];
    return day === selectedDate;
  });

  const dailyTotal = dailySessions.reduce((sum, s) => sum + s.totalPrice, 0);

  const today = new Date();
  const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const monthlySessions = sessions.filter((s) => {
    const month = new Date(s.endTime).toISOString().slice(0, 7);
    return month === thisMonth;
  });

  const monthlyTotal = monthlySessions.reduce((sum, s) => sum + s.totalPrice, 0);

  const gameCount: Record<string, number> = {};
  monthlySessions.forEach((s) => {
    const title = s.game?.title || "Unknown";
    gameCount[title] = (gameCount[title] || 0) + 1;
  });
  const mostPlayedGame = Object.keys(gameCount).reduce((a, b) => (gameCount[a] > gameCount[b] ? a : b), "None");

  const psCount: Record<string, number> = {};
  monthlySessions.forEach((s) => {
    const name = s.playStation?.name || "Unknown";
    psCount[name] = (psCount[name] || 0) + 1;
  });
  const mostUsedPS = Object.keys(psCount).reduce((a, b) => (psCount[a] > psCount[b] ? a : b), "None");

  return (
    <div className="relative">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-40 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-400 rounded-full blur-3xl"></div>
      </div>
      
      <div className="bg-linear-to-r from-blue-500 to-purple-600 text-white p-8 rounded-2xl shadow-2xl mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-white/90 text-lg">Real-time Statistics & Analytics</p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-linear-to-br from-green-500 to-emerald-600 p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="text-sm text-green-100 uppercase tracking-wide font-medium mb-2">Today's Earnings</div>
          <div className="text-3xl font-bold text-white">{dailyTotal.toFixed(2)} DT</div>
        </div>
        <div className="bg-linear-to-br from-blue-500 to-blue-700 p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="text-sm text-blue-100 uppercase tracking-wide font-medium mb-2">Monthly Revenue</div>
          <div className="text-3xl font-bold text-white">{monthlyTotal.toFixed(2)} DT</div>
        </div>
        <div className="bg-linear-to-br from-purple-500 to-purple-700 p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="text-sm text-purple-100 uppercase tracking-wide font-medium mb-2">Total Sessions (Month)</div>
          <div className="text-3xl font-bold text-white">{monthlySessions.length}</div>
        </div>
        <div className="bg-linear-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="text-sm text-orange-100 uppercase tracking-wide font-medium mb-2">Today's Sessions</div>
          <div className="text-3xl font-bold text-white">{dailySessions.length}</div>
        </div>
      </div>

      {/* Daily Earnings Section */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-blue-500 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <span className="text-blue-600">📅</span> Daily Earnings
        </h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border-2 border-blue-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 p-3 rounded-xl mb-6 w-full md:w-auto text-lg transition-all text-gray-900"
        />
        <div className="bg-linear-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl mb-6 shadow-lg">
          <div className="text-sm opacity-90 mb-1">Daily Total</div>
          <div className="text-3xl font-bold">{dailyTotal.toFixed(2)} DT</div>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {dailySessions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-4">📊</div>
              <p className="text-lg">No sessions for this date</p>
            </div>
          ) : (
            dailySessions.map((s) => (
              <div key={s._id} className="border-2 border-blue-100 bg-linear-to-r from-blue-50 to-white p-4 rounded-xl flex justify-between items-center hover:border-blue-400 hover:shadow-lg transition-all duration-200">
                <div>
                  <span className="font-bold text-blue-600">{s.playStation?.name}</span>
                  <span className="text-gray-400 mx-2">•</span>
                  <span className="text-gray-700">{s.player?.name}</span>
                  <span className="text-gray-400 mx-2">•</span>
                  <span className="text-gray-600">{s.game?.title}</span>
                </div>
                <span className="font-bold text-green-600 text-lg">{s.totalPrice} DT</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-blue-500">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <span className="text-blue-600">📈</span> Monthly Summary ({thisMonth})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-linear-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl hover:shadow-lg transition-all duration-200">
            <div className="text-sm text-green-700 font-medium uppercase tracking-wide mb-2">Total Revenue</div>
            <div className="text-3xl font-bold text-green-600">{monthlyTotal.toFixed(2)} DT</div>
          </div>
          <div className="p-6 bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-lg transition-all duration-200">
            <div className="text-sm text-blue-700 font-medium uppercase tracking-wide mb-2">Number of Sessions</div>
            <div className="text-3xl font-bold text-blue-600">{monthlySessions.length}</div>
          </div>
          <div className="p-6 bg-linear-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl hover:shadow-lg transition-all duration-200">
            <div className="text-sm text-purple-700 font-medium uppercase tracking-wide mb-2">Most Played Game</div>
            <div className="text-2xl font-bold text-purple-600 truncate">{mostPlayedGame}</div>
          </div>
          <div className="p-6 bg-linear-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl hover:shadow-lg transition-all duration-200">
            <div className="text-sm text-blue-700 font-medium uppercase tracking-wide mb-2">Most Used PlayStation</div>
            <div className="text-2xl font-bold text-blue-600 truncate">{mostUsedPS}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
