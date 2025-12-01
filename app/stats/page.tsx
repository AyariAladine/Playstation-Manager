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

export default function StatsPage() {
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
    <div>
      <h1 className="text-3xl font-bold mb-4">Statistics</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Daily Earnings</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border p-2 mb-2"
        />
        <div className="text-lg font-semibold text-green-600 mb-2">Total: {dailyTotal.toFixed(2)} DT</div>
        <div className="space-y-2">
          {dailySessions.map((s) => (
            <div key={s._id} className="border p-2 rounded text-sm">
              {s.playStation?.name} - {s.player?.name} - {s.game?.title} - {s.totalPrice} DT
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Monthly Summary ({thisMonth})</h2>
        <div className="space-y-1">
          <div>Total Revenue: <span className="font-semibold text-green-600">{monthlyTotal.toFixed(2)} DT</span></div>
          <div>Number of Sessions: <span className="font-semibold">{monthlySessions.length}</span></div>
          <div>Most Played Game: <span className="font-semibold">{mostPlayedGame}</span></div>
          <div>Most Used PlayStation: <span className="font-semibold">{mostUsedPS}</span></div>
        </div>
      </div>
    </div>
  );
}
