"use client";
import { useEffect, useState } from "react";
import axios from "axios";

type PlayStation = {
  _id: string;
  name: string;
  model?: string;
  status: "available" | "occupied";
  currentPlayer?: any;
  currentGame?: any;
  startTime?: string;
  prepaidSessions?: number;
};

type Player = { _id: string; name: string };
type Game = { _id: string; title: string; image?: string; pricingType?: string };

export default function PlayStationsPage() {
  const [playstations, setPlaystations] = useState<PlayStation[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [form, setForm] = useState({ name: "", model: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const [startData, setStartData] = useState<{ psId: string; playerId: string; gameId: string; prepaidSessions: number } | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [playerSearch, setPlayerSearch] = useState("");
  const [gameSearch, setGameSearch] = useState("");
  const [showPlayerDropdown, setShowPlayerDropdown] = useState(false);
  const [showGameDropdown, setShowGameDropdown] = useState(false);
  const [notifiedSessions, setNotifiedSessions] = useState<Set<string>>(new Set());
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Set up periodic data refresh to keep checking even when tab is inactive
    const dataRefreshInterval = setInterval(() => {
      loadData();
    }, 5000); // Refresh data every 5 seconds

    return () => clearInterval(dataRefreshInterval);
  }, []);

  useEffect(() => {
    // Close dropdowns when clicking outside
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('.player-dropdown-container')) {
        setShowPlayerDropdown(false);
      }
      if (!target.closest('.game-dropdown-container')) {
        setShowGameDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Update current time every second for real-time timer and check notifications
    // Use both setInterval and requestAnimationFrame to work even when tab is inactive
    let animationFrameId: number;
    let lastCheck = Date.now();
    
    const checkNotifications = () => {
      const now = Date.now();
      setCurrentTime(now);
      
      // Only check notifications if at least 1 second has passed
      if (now - lastCheck >= 1000) {
        lastCheck = now;
        
        // Check each occupied console for notification triggers
        playstations.forEach((ps) => {
          if (ps.status === "occupied" && ps.startTime && ps.currentGame) {
            const game = games.find(g => g._id === ps.currentGame._id || g._id === ps.currentGame);
            
            // Only notify for games with per15min pricing
            if (game && game.pricingType === 'per15min') {
              const start = new Date(ps.startTime).getTime();
              const elapsedMinutes = Math.floor((now - start) / (1000 * 60));
              
              // Calculate when to notify based on prepaid sessions
              const prepaidSessions = ps.prepaidSessions || 1;
              const prepaidMinutes = prepaidSessions * 15;
              
              // Notify at prepaid completion
              if (elapsedMinutes === prepaidMinutes) {
                const notificationKey = `${ps._id}-${elapsedMinutes}`;
                
                if (!notifiedSessions.has(notificationKey)) {
                  setNotifiedSessions(prev => new Set(prev).add(notificationKey));
                  
                  // Send desktop notification
                  if ('Notification' in window && Notification.permission === 'granted') {
                    const playerName = ps.currentPlayer?.name || 'Player';
                    const gameName = ps.currentGame?.title || game.title;
                    const hours = Math.floor(elapsedMinutes / 60);
                    const mins = elapsedMinutes % 60;
                    const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                    
                    new Notification('⏰ Prepaid Time Complete!', {
                      body: `${ps.name}: ${playerName} playing ${gameName}\nTime: ${timeStr} (${prepaidSessions} session${prepaidSessions > 1 ? 's' : ''})`,
                      icon: game.image || '/favicon.ico',
                      tag: notificationKey,
                      requireInteraction: true,
                    });
                    
                    // Play notification sound
                    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSiF0fPTgjMGHm7A7+OZUQ4NUrDn77NeHAU7k9n0y4IuBSh+zO/glEQMGmm96eaoVxQKRqDf8sFuIQUnhM/z1oU0Bh5tv+3mnFMPDlOw5/C1YhwFOpPZ9MyBLgUofszu4pdGDBtqvOnnq1kVCkag3/LAbiEFJ4TO89aFNQYebbzt5p1UDw5TsOjwtWQcBTmT2fTNgS8FKH7M7+KWSQwcarzo56xZFQlFn9/ywG4hBSaEzvPWhTQGHm297OafUw8NU6/n8LVkGwU5k9n0zYEvBSh+y+7jl0kNG2q86OeuWhQKRZ/f8r9vIAUmhc7z1YU0Bh1tve3mn1MPDVS/6O+1YxwFOJLZ9M2CMQYpgMzv45dKDBxrve3nrVkVCkWf3/K/cCAEJoXO89aFNAYebb7s5Z9UDgxTr+fwtWMcBTeS2fPNgjIGKYDM8OKXTQ0ba7zt56tZFQpFnt/yv24gBCWEzvTWhjQGHWy+7eSfVA0MUq/n8LRiHAU3ktnzzYIyBil/zO/jmE0NG2u87eaqWhQKRZ7f8r5vIAQlhc711oY0Bh1tu+zkoFQODFKv6O+zYRsFN5HY88yBMQYof8vv4pZKDBpqvO3lrFoVCUSe3vK9byAEJYXN89eFMwYcbLvs5KFUDQxSruiwtGEbBTaR2PPMgjEGKH7L7+OXSgwaa7vs5KpcFApDnt7xvW4fBCSEzfPWhTMHG2y77OOgVQ0MUK/n77RhGwU2kNjzzIIwBSh+y+/hmEoMGWq77OWrWRQJRJ3e8rxuHwQkhM3z1oU0Bhxrve3jnlQNCk+v5++zYRoENI/Y88uCMQUpfsrv4pdKDBppu+vlqloVCkOd3vG8bh4DJIPm8deENQcaa73s5J5VDQ1Pr+fvsmAbBDOP2PPLgjIGKn/J8OOXSwwZaLzs5apaFQpDnd3xv24eBCOCzPLWhzQGG2u+7eOeVAwNTq/m77BhGgUzj9jzy4IyByl/yO7imEsNGWe87OWqWhQJQp3d8L1tHgQjgsz01oY0Bhpqvuzin1UNDEyv5u6wYRoFMo/Y8st/MAQnfsjt4phKCxdmvOvkqVoUCUKc3fC9bR0EI4HN9NWGNQYaab7r4Z9UDAxMrefurF8ZBDGe2e/JgjMGKYDH7t+VSwwYZ7vo5KtbFQlBm93xwG4dAx9+zPDWiDYIHWu87OChVgwLTLDn7KxgGQQyn9ruyoQzBSmAyezem0sNGGe76eWrWhQJQpze88FuHwMffsrv1Yc0Bxxqvu3hoFYMC0uu6OysXxgFM5/a78qFNAYsgMfs4Z1LDRlnuunlrFsVCkGc3/LBbx8DHH7I7daHNQccar3t46BWDAk=');
                    audio.play().catch(() => {});
                  }
                }
              }
              
              // Notify every 15 minutes for overtime
              if (elapsedMinutes > prepaidMinutes && (elapsedMinutes - prepaidMinutes) % 15 === 0) {
                const notificationKey = `${ps._id}-${elapsedMinutes}`;
                
                if (!notifiedSessions.has(notificationKey)) {
                  setNotifiedSessions(prev => new Set(prev).add(notificationKey));
                  
                  if ('Notification' in window && Notification.permission === 'granted') {
                    const playerName = ps.currentPlayer?.name || 'Player';
                    const gameName = ps.currentGame?.title || game.title;
                    const hours = Math.floor(elapsedMinutes / 60);
                    const mins = elapsedMinutes % 60;
                    const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                    const overtimeIntervals = Math.floor((elapsedMinutes - prepaidMinutes) / 15);
                    
                    new Notification('⏰ Overtime Alert!', {
                      body: `${ps.name}: ${playerName} - ${gameName}\nTime: ${timeStr} (+${overtimeIntervals} extra session${overtimeIntervals > 1 ? 's' : ''})`,
                      icon: game.image || '/favicon.ico',
                      tag: notificationKey,
                      requireInteraction: true,
                    });
                    
                    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSiF0fPTgjMGHm7A7+OZUQ4NUrDn77NeHAU7k9n0y4IuBSh+zO/glEQMGmm96eaoVxQKRqDf8sFuIQUnhM/z1oU0Bh5tv+3mnFMPDlOw5/C1YhwFOpPZ9MyBLgUofszu4pdGDBtqvOnnq1kVCkag3/LAbiEFJ4TO89aFNQYebbzt5p1UDw5TsOjwtWQcBTmT2fTNgS8FKH7M7+KWSQwcarzo56xZFQlFn9/ywG4hBSaEzvPWhTQGHm297OafUw8NU6/n8LVkGwU5k9n0zYEvBSh+y+7jl0kNG2q86OeuWhQKRZ/f8r9vIAUmhc7z1YU0Bh1tve3mn1MPDVS/6O+1YxwFOJLZ9M2CMQYpgMzv45dKDBxrve3nrVkVCkWf3/K/cCAEJoXO89aFNAYebb7s5Z9UDgxTr+fwtWMcBTeS2fPNgjIGKYDM8OKXTQ0ba7zt56tZFQpFnt/yv24gBCWEzvTWhjQGHWy+7eSfVA0MUq/n8LRiHAU3ktnzzYIyBil/zO/jmE0NG2u87eaqWhQKRZ7f8r5vIAQlhc711oY0Bh1tu+zkoFQODFKv6O+zYRsFN5HY88yBMQYof8vv4pZKDBpqvO3lrFoVCUSe3vK9byAEJYXN89eFMwYcbLvs5KFUDQxSruiwtGEbBTaR2PPMgjEGKH7L7+OXSgwaa7vs5KpcFApDnt7xvW4fBCSEzfPWhTMHG2y77OOgVQ0MUK/n77RhGwU2kNjzzIIwBSh+y+/hmEoMGWq77OWrWRQJRJ3e8rxuHwQkhM3z1oU0Bhxrve3jnlQNCk+v5++zYRoENI/Y88uCMQUpfsrv4pdKDBppu+vlqloVCkOd3vG8bh4DJIPm8deENQcaa73s5J5VDQ1Pr+fvsmAbBDOP2PPLgjIGKn/J8OOXSwwZaLzs5apaFQpDnd3xv24eBCOCzPLWhzQGG2u+7eOeVAwNTq/m77BhGgUzj9jzy4IyByl/yO7imEsNGWe87OWqWhQJQp3d8L1tHgQjgsz01oY0Bhpqvuzin1UNDEyv5u6wYRoFMo/Y8st/MAQnfsjt4phKCxdmvOvkqVoUCUKc3fC9bR0EI4HN9NWGNQYaab7r4Z9UDAxMrefurF8ZBDGe2e/JgjMGKYDH7t+VSwwYZ7vo5KtbFQlBm93xwG4dAx9+zPDWiDYIHWu87OChVgwLTLDn7KxgGQQyn9ruyoQzBSmAyezem0sNGGe76eWrWhQJQpze88FuHwMffsrv1Yc0Bxxqvu3hoFYMC0uu6OysXxgFM5/a78qFNAYsgMfs4Z1LDRlnuunlrFsVCkGc3/LBbx8DHH7I7daHNQccar3t46BWDAk=');
                    audio.play().catch(() => {});
                  }
                }
              }
            }
          }
        });
      }
      
      animationFrameId = requestAnimationFrame(checkNotifications);
    };
    
    // Start the animation frame loop
    animationFrameId = requestAnimationFrame(checkNotifications);
    
    // Also use setInterval as backup (runs even when tab is backgrounded in some browsers)
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [playstations, games, notifiedSessions]);

  async function loadData() {
    const [psRes, plRes, gmRes] = await Promise.all([
      axios.get("/api/playstations"),
      axios.get("/api/players"),
      axios.get("/api/games"),
    ]);
    setPlaystations(psRes.data);
    setPlayers(plRes.data);
    setGames(gmRes.data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { name: form.name, model: form.model || undefined };
    if (editing) {
      await axios.put(`/api/playstations/${editing}`, payload);
      setEditing(null);
    } else {
      await axios.post("/api/playstations", payload);
    }
    setForm({ name: "", model: "" });
    setShowModal(false);
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this PlayStation?")) return;
    await axios.delete(`/api/playstations/${id}`);
    loadData();
  }

  function handleEdit(ps: PlayStation) {
    setEditing(ps._id);
    setForm({ name: ps.name, model: ps.model || "" });
    setShowModal(true);
  }

  function openCreateModal() {
    setEditing(null);
    setForm({ name: "", model: "" });
    setShowModal(true);
  }

  async function handleStart() {
    if (!startData || processing) return;
    setProcessing(startData.psId);
    try {
      await axios.post(`/api/playstations/${startData.psId}/start`, {
        playerId: startData.playerId,
        gameId: startData.gameId,
        prepaidSessions: startData.prepaidSessions,
      });
      setStartData(null);
      loadData();
    } finally {
      setProcessing(null);
    }
  }

  async function handleStop(psId: string) {
    if (processing) return;
    setProcessing(psId);
    try {
      await axios.post(`/api/playstations/${psId}/stop`);
      loadData();
    } finally {
      setProcessing(null);
    }
  }

  async function handleCancel(psId: string) {
    if (processing) return;
    setProcessing(psId);
    try {
      await axios.post(`/api/playstations/${psId}/cancel`);
      setCancelConfirm(null);
      loadData();
    } finally {
      setProcessing(null);
    }
  }

  function getElapsedTime(startTime?: string) {
    if (!startTime) return "";
    const start = new Date(startTime).getTime();
    const diff = Math.floor((currentTime - start) / 1000 / 60);
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  return (
    <div className="relative">
      {/* Decorative Background */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-indigo-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-linear-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-2xl shadow-xl mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1">PlayStation Consoles</h1>
            <p className="text-white/80">Monitor and control gaming stations</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-white text-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-50 font-bold shadow-lg hover:scale-105 transition-all"
          >
            + Add Console
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {playstations.map((ps) => (
          <div key={ps._id} className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border-4 border-gray-800 hover:border-blue-500 transition-all">
            {/* Screen Header */}
            <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b-2 border-gray-700">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${ps.status === "available" ? "bg-green-500 animate-pulse" : "bg-red-500 animate-pulse"}`}></div>
                <span className="text-white font-bold text-sm">{ps.name}</span>
              </div>
              {ps.model && <span className="text-gray-400 text-xs">{ps.model}</span>}
            </div>

            {/* Screen Display */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              {ps.status === "occupied" && ps.currentGame?.image ? (
                <img 
                  src={ps.currentGame.image} 
                  alt={ps.currentGame.title} 
                  className="w-full h-full object-cover"
                />
              ) : ps.status === "occupied" ? (
                <div className="text-center">
                  <div className="text-6xl mb-2">🎮</div>
                  <div className="text-white font-bold text-lg">{ps.currentGame?.title || "Gaming"}</div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-5xl mb-2">⏸️</div>
                  <div className="text-gray-500 font-semibold">Available</div>
                </div>
              )}
              
              {/* Status Overlay */}
              {ps.status === "occupied" && (
                <div className="absolute top-0 left-0 right-0 bg-linear-to-b from-black/80 to-transparent p-3">
                  <div className="text-white text-sm font-semibold">{ps.currentGame?.title}</div>
                  <div className="text-gray-300 text-xs">{ps.currentPlayer?.name}</div>
                  <div className="text-yellow-400 text-xs mt-1 flex items-center gap-1">
                    <span>⏱️</span>
                    <span>{getElapsedTime(ps.startTime)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Control Panel */}
            <div className="bg-gray-800 p-4 space-y-2">
              {ps.status === "available" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setStartData({ psId: ps._id, playerId: "", gameId: "", prepaidSessions: 1 })}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold shadow-lg"
                  >
                    ▶ START
                  </button>
                  <button
                    onClick={() => handleEdit(ps)}
                    className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    ⚙️
                  </button>
                  <button
                    onClick={() => handleDelete(ps._id)}
                    className="px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    🗑️
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button 
                    onClick={() => handleStop(ps._id)} 
                    disabled={processing === ps._id}
                    className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-bold shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    {processing === ps._id ? "⏳ Stopping..." : "⏹ STOP SESSION"}
                  </button>
                  <button 
                    onClick={() => setCancelConfirm(ps._id)} 
                    disabled={processing === ps._id}
                    className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    ❌ CANCEL (No Charge)
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-linear-to-r from-indigo-600 to-blue-600 p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white">
                {editing ? "Edit Console" : "Add New Console"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Console Name *</label>
                <input
                  type="text"
                  placeholder="e.g., PS5 #1"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Model</label>
                <input
                  type="text"
                  placeholder="e.g., PlayStation 5"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  {editing ? "Update Console" : "Create Console"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditing(null);
                    setForm({ name: "", model: "" });
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

      {/* Start Session Modal */}
      {startData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-linear-to-r from-green-600 to-emerald-600 p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white">Start Gaming Session</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Player *</label>
                <div className="relative player-dropdown-container">
                  <input
                    type="text"
                    placeholder="Search players..."
                    value={playerSearch}
                    onChange={(e) => {
                      setPlayerSearch(e.target.value);
                      setShowPlayerDropdown(true);
                    }}
                    onFocus={() => setShowPlayerDropdown(true)}
                    className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  />
                  {showPlayerDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {players
                        .filter((p) => p.name.toLowerCase().includes(playerSearch.toLowerCase()))
                        .map((p) => (
                          <div
                            key={p._id}
                            onClick={() => {
                              setStartData({ ...startData, playerId: p._id });
                              setPlayerSearch(p.name);
                              setShowPlayerDropdown(false);
                            }}
                            className={`p-3 hover:bg-green-50 cursor-pointer text-gray-900 ${
                              startData.playerId === p._id ? 'bg-green-100 font-semibold' : ''
                            }`}
                          >
                            {p.name}
                          </div>
                        ))}
                      {players.filter((p) => p.name.toLowerCase().includes(playerSearch.toLowerCase())).length === 0 && (
                        <div className="p-3 text-gray-500 text-center">No players found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Game *</label>
                <div className="relative game-dropdown-container">
                  <input
                    type="text"
                    placeholder="Search games..."
                    value={gameSearch}
                    onChange={(e) => {
                      setGameSearch(e.target.value);
                      setShowGameDropdown(true);
                    }}
                    onFocus={() => setShowGameDropdown(true)}
                    className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  />
                  {showGameDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {games
                        .filter((g) => g.title.toLowerCase().includes(gameSearch.toLowerCase()))
                        .map((g) => (
                          <div
                            key={g._id}
                            onClick={() => {
                              setStartData({ ...startData, gameId: g._id });
                              setGameSearch(g.title);
                              setShowGameDropdown(false);
                            }}
                            className={`p-3 hover:bg-green-50 cursor-pointer text-gray-900 flex items-center gap-3 ${
                              startData.gameId === g._id ? 'bg-green-100 font-semibold' : ''
                            }`}
                          >
                            {g.image && (
                              <img src={g.image} alt={g.title} className="w-10 h-10 object-cover rounded" />
                            )}
                            <span>{g.title}</span>
                          </div>
                        ))}
                      {games.filter((g) => g.title.toLowerCase().includes(gameSearch.toLowerCase())).length === 0 && (
                        <div className="p-3 text-gray-500 text-center">No games found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Prepaid Sessions *</label>
                <select
                  value={startData.prepaidSessions}
                  onChange={(e) => setStartData({ ...startData, prepaidSessions: parseInt(e.target.value) })}
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                >
                  <option value={1}>1 Session</option>
                  <option value={2}>2 Sessions</option>
                  <option value={3}>3 Sessions</option>
                  <option value={4}>4 Sessions</option>
                  <option value={5}>5 Sessions</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleStart}
                  disabled={!startData.playerId || !startData.gameId || !!processing}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  ▶ Start Session
                </button>
                <button 
                  onClick={() => {
                    setStartData(null);
                    setPlayerSearch("");
                    setGameSearch("");
                    setShowPlayerDropdown(false);
                    setShowGameDropdown(false);
                  }} 
                  className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-linear-to-r from-orange-600 to-red-600 p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white">⚠️ Cancel Session</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 text-lg mb-6">
                Are you sure you want to cancel this session? No charges will be applied to the customer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleCancel(cancelConfirm)}
                  disabled={!!processing}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {processing ? "⏳ Cancelling..." : "Yes, Cancel Session"}
                </button>
                <button
                  onClick={() => setCancelConfirm(null)}
                  disabled={!!processing}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold disabled:opacity-50"
                >
                  No, Keep Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
