"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import { getAIResponse } from "@/lib/openRouter";
import { ActivityTracker } from "@/lib/activityTracker";
import Link from "next/link";
import Sidebar from "@/lib/sidebar";

export default function ProcessQuestionsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);
  const [question, setQuestion] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [response, setResponse] = useState("");
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ question: string; response: string }>
  >([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        // Check if guest mode
        const isGuest = localStorage.getItem("guestMode") === "true";
        if (isGuest) {
          setGuestMode(true);
          setUser({ email: "guest@example.com" } as User);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleGuestLogin = () => {
    localStorage.setItem("guestMode", "true");
    setGuestMode(true);
    setUser({ email: "guest@example.com" } as User);
    setLoading(false);
  };

  const generatePrompt = (userQuestion: string) => {
    return `You are an AI consultant specializing in process automation. A consultant has asked: "${userQuestion}"

Please analyze this query and provide recommendations for automating this process. Consider using a combination of:
- AI (artificial intelligence, machine learning)
- Robotics (RPA - Robotic Process Automation)
- NoCode/LowCode platforms (Zapier, Make, Airtable, Bubble, etc.)
- Custom programming solutions

For each recommendation, include:
1. The specific automation approach
2. Estimated implementation effort (Low/Medium/High)
3. Potential benefits (time savings, cost reduction, error reduction)
4. Any special considerations

After recommendations, suggest how this could create a flow that transfers to an interactive canvas for visualization.

Structure your response professionally and provide actionable insights.`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsGenerating(true);
    try {
      const prompt = generatePrompt(question);
      const aiResponse = await getAIResponse(prompt);

      setResponse(aiResponse);
      setConversationHistory((prev) => [
        ...prev,
        { question, response: aiResponse },
      ]);

      // Track activity if user is logged in
      if (user && !guestMode) {
        await ActivityTracker.trackActivity({
          userId: user.uid,
          userEmail: user.email!,
          type: "question_asked",
          title: `Asked: ${question.substring(0, 50)}${
            question.length > 50 ? "..." : ""
          }`,
          description:
            "User asked a process automation question and received AI recommendations",
          metadata: { questionLength: question.length },
        });
      }

      // Clear question input only if not in conversation mode
      setQuestion("");
    } catch (error) {
      console.error("Error generating response:", error);
      setResponse(
        "Sorry, there was an error generating the response. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const createCanvasFromResponse = () => {
    if (!response) return;

    // Generate a simple canvas JSON structure from the response
    const canvasData = {
      nodes: [
        {
          id: "start",
          type: "start",
          label: "Start Process",
          position: { x: 100, y: 100 },
        },
        {
          id: "automation",
          type: "process",
          label: "Automation Step",
          position: { x: 300, y: 100 },
          description: response.substring(0, 100) + "...",
        },
        {
          id: "end",
          type: "end",
          label: "End Process",
          position: { x: 500, y: 100 },
        },
      ],
      edges: [
        { id: "e1-2", source: "start", target: "automation" },
        { id: "e2-3", source: "automation", target: "end" },
      ],
    };

    // Store canvas data and navigate
    localStorage.setItem("canvasData", JSON.stringify(canvasData));
    window.location.href = "/canvas";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Access Required
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please log in to access this feature
          </p>
          <div className="mt-6 space-y-4">
            <Link
              href="/auth"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Log In
            </Link>
            <button
              onClick={handleGuestLogin}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar guestMode={guestMode} />

      {/* Header */}
      <header className="bg-white shadow ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="text-indigo-600 hover:text-indigo-500"
              >
                ← Back to Dashboard
              </Link>
              <h2 className="ml-4 text-2xl font-bold text-gray-900">
                Process Questions
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

      <main className="ml-64 max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Ask About Process Automation
            </h3>
            <p className="text-gray-600 mb-6">
              Describe a business process you'd like to automate, and our AI
              will provide tailored recommendations using AI, RPA,
              NoCode/LowCode platforms, or custom programming solutions.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="question"
                  className="block text-sm font-medium text-gray-700"
                >
                  Process Question
                </label>
                <textarea
                  id="question"
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="E.g., How can I automate our repetitive data entry process?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isGenerating || !question.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Generating..." : "Get Recommendations"}
              </button>
            </form>

            {response && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-2">
                  AI Recommendations
                </h4>
                <div className="bg-gray-50 rounded-md p-4 whitespace-pre-wrap text-sm text-gray-700">
                  {response}
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={createCanvasFromResponse}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create Canvas
                  </button>
                  <button
                    onClick={() => setResponse("")}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {conversationHistory.length > 0 && (
              <div className="mt-8">
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Previous Questions
                </h4>
                <div className="space-y-4">
                  {conversationHistory.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-md p-4"
                    >
                      <p className="font-medium text-gray-900 mb-2">
                        Q: {item.question}
                      </p>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        A: {item.response.substring(0, 200)}...
                      </div>
                      <button
                        onClick={() => setResponse(item.response)}
                        className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm"
                      >
                        View Full Response
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
