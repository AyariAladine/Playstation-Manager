"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import ImageUpload from "../../components/ImageUpload";

type Game = {
  _id: string;
  title: string;
  image?: string;
  pricingType: "perGame" | "per15min";
  priceValue: number;
};

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [form, setForm] = useState({ title: "", image: "", pricingType: "perGame", priceValue: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadGames();
  }, []);

  async function loadGames() {
    const res = await axios.get("/api/games");
    setGames(res.data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (processing) return;
    setProcessing(true);
    try {
      const payload = {
        title: form.title,
        image: form.image || undefined,
        pricingType: form.pricingType,
        priceValue: parseFloat(form.priceValue),
      };
      if (editing) {
        await axios.put(`/api/games/${editing}`, payload);
        setEditing(null);
      } else {
        await axios.post("/api/games", payload);
      }
      setForm({ title: "", image: "", pricingType: "perGame", priceValue: "" });
      setShowModal(false);
      loadGames();
    } finally {
      setProcessing(false);
    }
  }

  async function handleDelete(id: string) {
    if (processing || !confirm("Delete this game?")) return;
    setProcessing(true);
    try {
      await axios.delete(`/api/games/${id}`);
      loadGames();
    } finally {
      setProcessing(false);
    }
  }

  function handleEdit(g: Game) {
    setEditing(g._id);
    setForm({ title: g.title, image: g.image || "", pricingType: g.pricingType, priceValue: g.priceValue.toString() });
    setShowModal(true);
  }

  function openCreateModal() {
    setEditing(null);
    setForm({ title: "", image: "", pricingType: "perGame", priceValue: "" });
    setShowModal(true);
  }

  const filteredGames = games.filter((g) => {
    const query = searchQuery.toLowerCase();
    return g.title.toLowerCase().includes(query);
  });

  return (
    <div className="relative">
      {/* Decorative Background */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div className="absolute top-10 left-20 w-72 h-72 bg-purple-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-400 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-linear-to-r from-purple-500 to-pink-600 text-white p-6 rounded-2xl shadow-xl mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1">Games Library</h1>
            <p className="text-white/80">Manage your game collection</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-white text-purple-600 px-6 py-3 rounded-xl hover:bg-purple-50 font-bold shadow-lg hover:scale-105 transition-all"
          >
            + Add Game
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search games by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
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
            Found {filteredGames.length} game{filteredGames.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredGames.map((g) => (
          <div key={g._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:scale-105">
            <div className="relative h-48 bg-gray-900 flex items-center justify-center overflow-hidden">
              {g.image ? (
                <img src={g.image} alt={g.title} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-500 text-5xl">🎮</div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 text-gray-800 truncate" title={g.title}>{g.title}</h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
                  {g.pricingType === "perGame" ? "Per Game" : "Per 15 min"}
                </span>
                <span className="text-lg font-bold text-green-600">{g.priceValue} DT</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(g)}
                  disabled={processing}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(g._id)}
                  disabled={processing}
                  className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-linear-to-r from-purple-600 to-pink-600 p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white">
                {editing ? "Edit Game" : "Add New Game"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Game Title *</label>
                <input
                  type="text"
                  placeholder="Enter game title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Game Image</label>
                <ImageUpload
                  currentImage={form.image}
                  onUploadComplete={(url) => setForm({ ...form, image: url })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pricing Type *</label>
                <select
                  value={form.pricingType}
                  onChange={(e) => setForm({ ...form, pricingType: e.target.value })}
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                >
                  <option value="perGame">Per Game</option>
                  <option value="per15min">Per 15 Minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price Value (DT) *</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Enter price"
                  value={form.priceValue}
                  onChange={(e) => setForm({ ...form, priceValue: e.target.value })}
                  required
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {processing ? "Processing..." : editing ? "Update Game" : "Create Game"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditing(null);
                    setForm({ title: "", image: "", pricingType: "perGame", priceValue: "" });
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
