"use client";
import { useEffect, useState } from "react";
import axios from "axios";

type Player = {
  _id: string;
  name: string;
  age?: number;
  phone?: string;
  notes?: string;
  loyaltyPoints?: number;
  totalGamesPlayed?: number;
  rewardsEarned?: number;
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [form, setForm] = useState({ name: "", age: "", phone: "", notes: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadPlayers();
  }, []);

  async function loadPlayers() {
    const res = await axios.get("/api/players");
    setPlayers(res.data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (processing) return;
    setProcessing(true);
    try {
      const payload = {
        name: form.name,
        age: form.age ? parseInt(form.age) : undefined,
        phone: form.phone || undefined,
        notes: form.notes || undefined,
      };
      if (editing) {
        await axios.put(`/api/players/${editing}`, payload);
        setEditing(null);
      } else {
        await axios.post("/api/players", payload);
      }
      setForm({ name: "", age: "", phone: "", notes: "" });
      setShowModal(false);
      loadPlayers();
    } finally {
      setProcessing(false);
    }
  }

  async function handleDelete(id: string) {
    if (processing || !confirm("Delete this player?")) return;
    setProcessing(true);
    try {
      await axios.delete(`/api/players/${id}`);
      loadPlayers();
    } finally {
      setProcessing(false);
    }
  }

  async function handleClaimReward(p: Player) {
    if (processing) return;
    setProcessing(true);
    try {
      // Reset loyalty progress after claiming reward, keep other fields
      await axios.put(`/api/players/${p._id}`, {
        name: p.name,
        age: p.age,
        phone: p.phone,
        notes: p.notes,
        loyaltyPoints: 0,
        totalGamesPlayed: 0,
        rewardsEarned: p.rewardsEarned || 0,
      });
      loadPlayers();
    } finally {
      setProcessing(false);
    }
  }

  function handleEdit(p: Player) {
    setEditing(p._id);
    setForm({ name: p.name, age: p.age?.toString() || "", phone: p.phone || "", notes: p.notes || "" });
    setShowModal(true);
  }

  function openCreateModal() {
    setEditing(null);
    setForm({ name: "", age: "", phone: "", notes: "" });
    setShowModal(true);
  }

  const filteredPlayers = players.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.phone?.toLowerCase().includes(query) ||
      p.notes?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="relative">
      {/* Decorative Background */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div className="absolute top-10 right-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-linear-to-r from-blue-500 to-purple-600 text-white p-6 rounded-2xl shadow-xl mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1">Players Management</h1>
            <p className="text-white/80">Manage your gaming community</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50 font-bold shadow-lg hover:scale-105 transition-all"
          >
            + Add Player
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search players by name, phone, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="mt-2 text-sm text-gray-600">
            Found {filteredPlayers.length} player{filteredPlayers.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPlayers.map((p) => {
          const gamesPlayed = p.totalGamesPlayed || 0;
          const points = p.loyaltyPoints || 0;
          const rewardsEarned = p.rewardsEarned || 0;
          const gamesNeeded = 10; // Games needed for reward
          const progress = Math.min((gamesPlayed % gamesNeeded) / gamesNeeded * 100, 100);
          const hasReward = gamesPlayed >= gamesNeeded && (gamesPlayed % gamesNeeded === 0 || points >= gamesNeeded);
          
          return (
          <div key={p._id} className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all relative ${
            hasReward ? 'ring-4 ring-yellow-400 animate-pulse cursor-pointer' : ''
          }`}
          onClick={() => hasReward ? handleClaimReward(p) : undefined}
          title={hasReward ? 'Click to claim reward and reset progress' : ''}
          >
            {hasReward && (
              <div className="absolute top-2 right-2 z-10 pointer-events-none">
                <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-bounce">
                  <span>🎁</span>
                  <span>REWARD!</span>
                </div>
              </div>
            )}
            <div className="bg-linear-to-br from-blue-500 to-purple-600 h-24 flex items-center justify-center relative">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
                {p.name.charAt(0).toUpperCase()}
              </div>
              {/* Loyalty Badge */}
              {rewardsEarned > 0 && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                  {rewardsEarned}
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-xl mb-2 text-gray-800">{p.name}</h3>
              
              {/* Loyalty Progress Bar */}
              <div className="mb-3 bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-linear-to-r from-yellow-400 to-orange-500 transition-all duration-500 relative"
                  style={{ width: `${progress}%` }}
                >
                  {progress > 0 && (
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-600 mb-3 flex items-center justify-between">
                <span>🎮 {gamesPlayed % gamesNeeded}/{gamesNeeded} games</span>
                <span className="font-bold text-yellow-600">⭐ {points} pts</span>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Age:</span>
                  <span>{p.age || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Phone:</span>
                  <span>{p.phone || "N/A"}</span>
                </div>
                {p.notes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <span className="font-semibold">Notes:</span> {p.notes}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(p)}
                  disabled={processing}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  disabled={processing}
                  className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )})}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-linear-to-r from-blue-600 to-purple-600 p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white">
                {editing ? "Edit Player" : "Add New Player"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  placeholder="Enter player name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  placeholder="Enter age"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  placeholder="Additional notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {processing ? "Processing..." : editing ? "Update Player" : "Create Player"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditing(null);
                    setForm({ name: "", age: "", phone: "", notes: "" });
                  }}
                  className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
