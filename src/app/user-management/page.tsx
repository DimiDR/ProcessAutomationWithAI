"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import Sidebar from "@/lib/sidebar";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  teams: string[];
  role: string;
  createdAt: any;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", role: "" });
  const [firebaseConnectionError, setFirebaseConnectionError] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const router = useRouter();

  // Initialize guest mode from localStorage on client side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      setGuestMode(localStorage.getItem("guestMode") === "true");
    }
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user && !guestMode) {
        router.push("/auth");
      }
    });

    if (!guestMode) {
      const unsubscribeUsers = onSnapshot(
        query(collection(db, "users"), orderBy("createdAt", "desc")),
        (snapshot) => {
          const userData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as UserProfile[];
          setUsers(userData);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching users:", error);
          setLoading(false);
          setFirebaseConnectionError(true);
        }
      );

      return () => {
        unsubscribeAuth();
        unsubscribeUsers();
      };
    } else {
      setLoading(false);
      return () => {
        unsubscribeAuth();
      };
    }
  }, [guestMode, router]);

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user.id);
    setEditForm({
      name: user.name || "",
      role: user.role,
    });
  };

  const handleSave = async () => {
    if (!editingUser) return;

    try {
      const userRef = doc(db, "users", editingUser);
      await updateDoc(userRef, {
        name: editForm.name,
        role: editForm.role,
      });
      setEditingUser(null);
      setEditForm({ name: "", role: "" });
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user. Please try again.");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteDoc(doc(db, "users", userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setEditForm({ name: "", role: "" });
  };

  if (!currentUser && !guestMode) {
    return null;
  }

  const showConnectionError = guestMode || firebaseConnectionError;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar guestMode={guestMode} />

      {/* Header */}
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h2 className="ml-4 text-2xl font-bold text-gray-900">
                  Process Automation Assistant
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {guestMode ? "Guest Mode" : `Welcome, ${currentUser?.email}`}
                </span>
                {guestMode ? (
                  <Link
                    href="/auth"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Login
                  </Link>
                ) : (
                  <Link
                    href="/auth"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Sign out
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                User Management
              </h1>
              <p className="mt-2 text-gray-600">
                Manage user accounts and permissions
              </p>
            </div>

            {showConnectionError ? (
              <div className="bg-white shadow-sm rounded-lg p-8">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    No connection to source system
                  </h2>
                  <p className="text-gray-600">
                    Unable to load user data. Please check your connection and
                    try again.
                  </p>
                </div>
              </div>
            ) : loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    All Users ({users.length})
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Teams
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingUser === user.id ? (
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    name: e.target.value,
                                  })
                                }
                                className="border rounded px-2 py-1 w-full"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900">
                                {user.name || "N/A"}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingUser === user.id ? (
                              <select
                                value={editForm.role}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    role: e.target.value,
                                  })
                                }
                                className="border rounded px-2 py-1"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="consultant">Consultant</option>
                              </select>
                            ) : (
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.role === "admin"
                                    ? "bg-red-100 text-red-800"
                                    : user.role === "consultant"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {user.role}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.teams.length > 0
                                ? user.teams.join(", ")
                                : "None"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {user.createdAt?.toDate().toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {editingUser === user.id ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={handleSave}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancel}
                                  className="text-gray-600 hover:text-gray-900"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEdit(user)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(user.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {users.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <p className="text-gray-500">No users found.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
