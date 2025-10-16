"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
import { ActivityTracker, UserActivity } from "@/lib/activityTracker";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);
  const [activityMetrics, setActivityMetrics] = useState({
    questionsAsked: 0,
    canvasesCreated: 0,
    simulationsRun: 0,
    caseStudiesViewed: 0,
    totalActivities: 0,
  });

  useEffect(() => {
    // Check for guest mode first
    const isGuest = localStorage.getItem("guestMode") === "true";
    if (isGuest) {
      setGuestMode(true);
      setUser({ email: "guest@example.com" } as User);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Load recent activities and metrics
        try {
          const [activities, metrics] = await Promise.all([
            ActivityTracker.getRecentActivities(user.uid, 5),
            ActivityTracker.getActivityMetrics(user.uid),
          ]);
          setRecentActivities(activities);
          setActivityMetrics(metrics);
        } catch (error) {
          console.error("Error loading dashboard data:", error);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    window.location.href = "/auth";
    return null;
  }

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Process Automation Assistant
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {guestMode ? "Guest Mode" : `Welcome, ${user.email}`}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            <Link
              href="/process-questions"
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
            >
              Process Questions
            </Link>
            <Link
              href="/canvas"
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
            >
              Canvas
            </Link>
            <Link
              href="/case-studies"
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
            >
              Case Studies
            </Link>
            <Link
              href="/simulation"
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
            >
              Simulation
            </Link>
            <Link
              href="/user-management"
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
            >
              User Management
            </Link>
          </nav>
        </div>

        {/* Activity Metrics Section */}
        {activityMetrics.totalActivities > 0 && (
          <div className="mb-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Your Activity Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {activityMetrics.questionsAsked}
                </div>
                <div className="text-sm text-gray-600">Questions Asked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {activityMetrics.canvasesCreated}
                </div>
                <div className="text-sm text-gray-600">Canvases Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {activityMetrics.simulationsRun}
                </div>
                <div className="text-sm text-gray-600">Simulations Run</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {activityMetrics.caseStudiesViewed}
                </div>
                <div className="text-sm text-gray-600">Case Studies Viewed</div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="bg-white shadow px-4 py-5 sm:px-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Process Automation Assistant
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Powerful AI-driven tools to help consultants automate their
              clients' processes
            </p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Process Questions Card */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
                <h3 className="text-xl font-semibold mb-2">
                  Process Questions
                </h3>
                <p className="text-blue-100 mb-4">
                  Get AI-powered suggestions for automating business processes
                  using AI, robotics, NoCode/LowCode, and programming.
                </p>
                <Link
                  href="/process-questions"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                >
                  Get Started
                </Link>
              </div>

              {/* Canvas Card */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
                <h3 className="text-xl font-semibold mb-2">
                  Interactive Canvas
                </h3>
                <p className="text-green-100 mb-4">
                  Create and visualize process flow diagrams with automated
                  recommendations and simulations.
                </p>
                <Link
                  href="/canvas"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50"
                >
                  Design Process
                </Link>
              </div>

              {/* Case Studies Card */}
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
                <h3 className="text-xl font-semibold mb-2">
                  Case Study Library
                </h3>
                <p className="text-purple-100 mb-4">
                  Search and explore anonymized case studies of successful
                  automation implementations.
                </p>
                <Link
                  href="/case-studies"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50"
                >
                  Browse Library
                </Link>
              </div>

              {/* Simulation Card */}
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-md p-6 text-white">
                <h3 className="text-xl font-semibold mb-2">
                  Simulation Environment
                </h3>
                <p className="text-yellow-100 mb-4">
                  Run what-if scenarios and test automation solutions virtually.
                </p>
                <Link
                  href="/simulation"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-600 bg-white hover:bg-yellow-50"
                >
                  Simulate
                </Link>
              </div>

              {/* User Management Card */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-md p-6 text-white">
                <h3 className="text-xl font-semibold mb-2">User Management</h3>
                <p className="text-red-100 mb-4">
                  Manage teams, share workflows, and assign roles (Admin only).
                </p>
                <Link
                  href="/user-management"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50"
                >
                  Manage Users
                </Link>
              </div>

              {/* Recent Activity Card */}
              <div className="bg-gray-100 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Recent Activity
                </h3>
                <div className="space-y-2 mb-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <div
                        key={activity.id || index}
                        className="flex items-center space-x-2 text-sm text-gray-700"
                      >
                        <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 truncate">
                          <span className="font-medium">{activity.title}</span>
                          <span className="text-gray-500 ml-1">
                            {activity.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No recent activity yet. Start using the tools!
                    </p>
                  )}
                </div>
                <Link
                  href="#"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
                  onClick={(e) => e.preventDefault()} // Placeholder
                >
                  View All Activity
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
