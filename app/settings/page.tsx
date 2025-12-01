"use client";
import { useEffect, useState } from "react";
import axios from "axios";

type User = {
  _id: string;
  username: string;
  name: string;
};

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ username: "", password: "", name: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await axios.get("/api/auth/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (processing) return;
    setProcessing(true);
    try {
      if (editing) {
        const payload: any = { id: editing, name: form.name, username: form.username };
        if (form.password) payload.password = form.password;
        await axios.put("/api/auth/users", payload);
        setEditing(null);
      } else {
        await axios.post("/api/auth/users", form);
      }
      setForm({ username: "", password: "", name: "" });
      setShowModal(false);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save user");
    } finally {
      setProcessing(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    if (processing) return;
    setProcessing(true);
    try {
      await axios.delete(`/api/auth/users?id=${id}`);
      loadUsers();
    } catch (err) {
      alert("Failed to delete user");
    } finally {
      setProcessing(false);
    }
  }

  function handleEdit(u: User) {
    setEditing(u._id);
    setForm({ username: u.username, name: u.name, password: "" });
    setShowModal(true);
  }

  function openCreateModal() {
    setEditing(null);
    setForm({ username: "", password: "", name: "" });
    setShowModal(true);
  }

  return (
    <div className="relative">
      {/* Decorative Background */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div className="absolute top-10 right-1/3 w-72 h-72 bg-cyan-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-linear-to-r from-cyan-600 to-blue-600 text-white p-6 rounded-2xl shadow-xl mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1">Settings</h1>
            <p className="text-white/80">Manage admin users and access</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-white text-cyan-600 px-6 py-3 rounded-xl hover:bg-cyan-50 font-bold shadow-lg hover:scale-105 transition-all"
          >
            + Add User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-xl">
            <div className="text-6xl mb-4">👥</div>
            <div className="text-xl font-semibold text-gray-600">No users found</div>
            <div className="text-gray-500 mt-2">Create your first admin user</div>
          </div>
        ) : (
          users.map((u) => (
            <div key={u._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-linear-to-br from-cyan-500 to-blue-600 h-20 flex items-center justify-center">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                  {u.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-xl mb-1 text-gray-800 text-center">{u.name}</h3>
                <div className="text-sm text-gray-500 text-center mb-4">@{u.username}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(u)}
                    disabled={processing}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u._id)}
                    disabled={processing}
                    className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-linear-to-r from-cyan-600 to-blue-600 p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white">
                {editing ? "Edit User" : "Add New User"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username *</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password {editing && "(leave empty to keep current)"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!editing}
                    className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <label className="flex items-center mt-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="mr-2"
                  />
                  Show password
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {processing ? "Processing..." : editing ? "Update User" : "Create User"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditing(null);
                    setForm({ username: "", password: "", name: "" });
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
