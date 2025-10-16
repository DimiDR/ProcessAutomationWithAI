"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
import { ActivityTracker } from "@/lib/activityTracker";
import Sidebar from "@/lib/sidebar";

export default function CaseStudiesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);

  const caseStudies = [
    {
      id: 1,
      title: "Retail Automation Success Story",
      industry: "Retail",
      problem: "Manual inventory tracking leading to 20% stock discrepancies",
      solution:
        "Implemented AI-powered demand forecasting and automated reordering",
      results: "85% reduction in inventory errors, 30% cost savings",
      technologies: ["AI Forecasting", "RPA", "IoT Sensors"],
    },
    {
      id: 2,
      title: "Manufacturing Process Optimization",
      industry: "Manufacturing",
      problem: "Inefficient production line scheduling causing delays",
      solution:
        "Deployed predictive analytics for real-time production scheduling",
      results: "40% improvement in on-time delivery, 25% reduction in waste",
      technologies: ["Machine Learning", "IoT", "NoCode Workflow"],
    },
    {
      id: 3,
      title: "Financial Services Document Processing",
      industry: "Finance",
      problem: "Manual processing of thousands of documents daily",
      solution:
        "Automated document classification and data extraction using AI",
      results: "90% reduction in processing time, 99% accuracy rate",
      technologies: ["OCR", "AI Classification", "LowCode Integration"],
    },
    {
      id: 4,
      title: "Healthcare Patient Management",
      industry: "Healthcare",
      problem: "Time-consuming patient scheduling and follow-up processes",
      solution: "Intelligent chatbot system for appointments and reminders",
      results: "50% reduction in no-shows, improved patient satisfaction",
      technologies: ["AI Chatbots", "Natural Language Processing"],
    },
    {
      id: 5,
      title: "Logistics Route Optimization",
      industry: "Logistics",
      problem: "Inefficient delivery routes causing increased fuel costs",
      solution: "Real-time route optimization using AI and GPS data",
      results: "35% reduction in fuel costs, 20% faster deliveries",
      technologies: ["GPS Tracking", "AI Optimization", "Mobile Apps"],
    },
    {
      id: 6,
      title: "Customer Service Automation",
      industry: "Customer Service",
      problem: "High volume of routine customer inquiries overwhelming agents",
      solution: "Deployed advanced IVR and chatbot combination",
      results: "60% reduction in call volume, 80% faster resolution",
      technologies: ["AI Chatbots", "Voice Recognition", "CRM Integration"],
    },
  ];

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

  const handleCaseStudyView = async (caseStudy: any) => {
    if (user && !guestMode) {
      await ActivityTracker.trackActivity({
        userId: user.uid,
        userEmail: user.email!,
        type: "case_study_viewed",
        title: `Viewed case study: ${caseStudy.title}`,
        description: "User viewed a case study",
        metadata: { caseStudyId: caseStudy.id },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar guestMode={guestMode} />

      {/* Header */}
      <header className="bg-white shadow ml-64">
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
              {guestMode ? (
                <Link
                  href="/auth"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Login
                </Link>
              ) : (
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="ml-64 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Case Study Library
          </h1>
          <p className="mt-2 text-gray-600">
            Explore successful automation implementations across various
            industries
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {caseStudies.map((study) => (
            <div
              key={study.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {study.industry}
                  </span>
                  <button
                    onClick={() => handleCaseStudyView(study)}
                    className="text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    View Details
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {study.title}
                </h3>

                <div className="space-y-2 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Problem:
                    </h4>
                    <p className="text-sm text-gray-600">{study.problem}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Solution:
                    </h4>
                    <p className="text-sm text-gray-600">{study.solution}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Results:
                    </h4>
                    <p className="text-sm text-green-600 font-medium">
                      {study.results}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Technologies Used:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {study.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Guest Mode Notice */}
        {guestMode && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Guest Mode Active
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  Sign up for a full account to track your learning progress and
                  get personalized case study recommendations.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
