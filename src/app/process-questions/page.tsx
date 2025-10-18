"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import { getAIResponse, generateCanvasJSON } from "@/lib/openRouter";
import { ActivityTracker } from "@/lib/activityTracker";
import Link from "next/link";
import Sidebar from "@/lib/sidebar";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";

// Simple Process Node for Preview
function ProcessNode({ data }: any) {
  const getNodeStyle = () => {
    const baseStyle = {
      padding: '10px 16px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      background: '#ffffff',
      minWidth: '100px',
      textAlign: 'center' as const,
      fontSize: '12px',
      fontWeight: '500',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.08)',
    };

    switch (data.nodeType) {
      case 'start':
        return {
          ...baseStyle,
          background: '#2ECC71',
          color: 'white',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        };
      case 'end':
        return {
          ...baseStyle,
          background: '#E74C3C',
          color: 'white',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        };
      case 'decision':
        return {
          ...baseStyle,
          background: '#FFF9E6',
          border: '2px solid #F39C12',
          color: '#855A00',
          transform: 'rotate(45deg)',
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div style={getNodeStyle()}>
      <div style={data.nodeType === 'decision' ? { transform: 'rotate(-45deg)' } : {}}>
        {data.label}
      </div>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  processNode: ProcessNode,
};

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
  const [generatedCanvas, setGeneratedCanvas] = useState<any>(null);
  const [isGeneratingCanvas, setIsGeneratingCanvas] = useState(false);
  const [canvasError, setCanvasError] = useState<string | null>(null);
  const [canvasWarning, setCanvasWarning] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState("");

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
      
      // Store the current question for canvas generation
      setCurrentQuestion(question);
      
      // Reset canvas state when new response is generated
      setGeneratedCanvas(null);
      setCanvasError(null);
      setCanvasWarning(null);

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

  const validateAndFixCanvasJSON = (jsonString: string) => {
    let warning = null;
    let parsedJSON = null;

    try {
      // Try to extract JSON from markdown code blocks
      let cleanedJSON = jsonString.trim();
      
      // Remove markdown code blocks
      if (cleanedJSON.includes("```")) {
        const jsonMatch = cleanedJSON.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          cleanedJSON = jsonMatch[1];
          warning = "Extracted JSON from markdown formatting";
        }
      }
      
      // Try parsing
      parsedJSON = JSON.parse(cleanedJSON);
      
      // Validate and fix structure
      if (!parsedJSON.nodes || !Array.isArray(parsedJSON.nodes)) {
        throw new Error("Invalid structure: missing nodes array");
      }
      
      if (!parsedJSON.edges) {
        parsedJSON.edges = [];
        warning = "Added missing edges array";
      }
      
      // Fix nodes
      parsedJSON.nodes = parsedJSON.nodes.map((node: any, index: number) => {
        const fixed: any = {
          id: node.id || `node-${Date.now()}-${index}`,
          type: node.type || "processNode",
          position: node.position || { 
            x: 80 + (index * 240), 
            y: 80 + Math.floor(index / 4) * 160 
          },
          data: {
            label: node.data?.label || node.label || `Step ${index + 1}`,
            nodeType: node.data?.nodeType || node.nodeType || "process",
            automationType: node.data?.automationType || node.automationType || "Manual",
            description: node.data?.description || node.description || "",
          },
        };
        
        // Ensure type is processNode
        if (fixed.type !== "processNode") {
          fixed.type = "processNode";
          warning = "Fixed node types to processNode";
        }
        
        return fixed;
      });
      
      // Fix edges
      parsedJSON.edges = parsedJSON.edges.map((edge: any, index: number) => ({
        id: edge.id || `e${index}`,
        source: edge.source,
        target: edge.target,
        markerType: edge.markerType || "arrowclosed",
      }));
      
      // Ensure name exists
      if (!parsedJSON.name) {
        parsedJSON.name = "Generated Process";
      }
      
      return { success: true, data: parsedJSON, warning };
    } catch (error) {
      console.error("JSON parsing error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to parse JSON",
        warning: null 
      };
    }
  };

  const handleGenerateCanvas = async () => {
    if (!response || !currentQuestion) return;
    
    setIsGeneratingCanvas(true);
    setCanvasError(null);
    setCanvasWarning(null);
    
    try {
      const jsonResponse = await generateCanvasJSON(currentQuestion, response);
      
      // Validate and fix the JSON
      const result = validateAndFixCanvasJSON(jsonResponse);
      
      if (result.success) {
        setGeneratedCanvas(result.data);
        if (result.warning) {
          setCanvasWarning(result.warning);
        }
        
        // Track activity
        if (user && !guestMode) {
          await ActivityTracker.trackActivity({
            userId: user.uid,
            userEmail: user.email!,
            type: "canvas_generated",
            title: "Generated canvas from process question",
            description: `Created canvas: ${result.data.name}`,
            metadata: { 
              nodeCount: result.data.nodes?.length || 0,
              edgeCount: result.data.edges?.length || 0 
            },
          });
        }
      } else {
        setCanvasError(result.error || "Failed to generate valid canvas JSON");
      }
    } catch (error) {
      console.error("Error generating canvas:", error);
      setCanvasError("Failed to generate canvas. Please try again.");
    } finally {
      setIsGeneratingCanvas(false);
    }
  };

  const createCanvasFromResponse = (canvasData?: any) => {
    const dataToUse = canvasData || generatedCanvas;
    if (!dataToUse) return;

    // Store canvas data with metadata and navigate
    const canvasWithMetadata = {
      ...dataToUse,
      exportedAt: new Date().toISOString(),
      source: "process-questions",
    };
    
    localStorage.setItem("canvasData", JSON.stringify(canvasWithMetadata));
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
                  {!generatedCanvas && (
                    <button
                      onClick={handleGenerateCanvas}
                      disabled={isGeneratingCanvas}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingCanvas ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-700" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating Canvas...
                        </>
                      ) : (
                        "Generate Canvas"
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setResponse("");
                      setGeneratedCanvas(null);
                      setCanvasError(null);
                      setCanvasWarning(null);
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Clear
                  </button>
                </div>

                {/* Canvas Error */}
                {canvasError && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{canvasError}</p>
                        <button
                          onClick={handleGenerateCanvas}
                          className="mt-2 text-sm text-red-600 hover:text-red-500 font-medium"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Canvas Preview */}
                {generatedCanvas && (
                  <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
                    {canvasWarning && (
                      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
                        <div className="flex">
                          <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <p className="ml-3 text-sm text-yellow-700">{canvasWarning}</p>
                        </div>
                      </div>
                    )}
                    <div className="bg-white p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-md font-medium text-gray-900">
                          Canvas Preview: {generatedCanvas.name}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {generatedCanvas.nodes?.length || 0} nodes, {generatedCanvas.edges?.length || 0} connections
                        </span>
                      </div>
                      <div className="border border-gray-200 rounded-md" style={{ height: '350px' }}>
                        <ReactFlow
                          nodes={generatedCanvas.nodes}
                          edges={generatedCanvas.edges}
                          nodeTypes={nodeTypes}
                          fitView
                          attributionPosition="bottom-left"
                          proOptions={{ hideAttribution: true }}
                        >
                          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
                          <Controls />
                        </ReactFlow>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => createCanvasFromResponse(generatedCanvas)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Open in Canvas
                        </button>
                        <button
                          onClick={() => {
                            setGeneratedCanvas(null);
                            setCanvasError(null);
                            setCanvasWarning(null);
                          }}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Regenerate
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
