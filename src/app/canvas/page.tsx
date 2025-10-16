"use client";

import { useState, useEffect, useRef } from "react";
import { auth } from "@/lib/firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import { ActivityTracker } from "@/lib/activityTracker";
import Link from "next/link";
import Sidebar from "@/lib/sidebar";

declare global {
  interface Window {
    mxGraph: any;
    mxGraphModel: any;
    mxGeometry: any;
    mxCell: any;
    mxCodec: any;
    mxUtils: any;
    mxEvent: any;
    mxCellOverlay: any;
    mxImage: any;
    mxImageExport: any;
  }
}

export default function CanvasPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [savedCanvases, setSavedCanvases] = useState<
    Array<{ id: string; name: string; data: any }>
  >([]);
  const [currentCanvasName, setCurrentCanvasName] = useState("Untitled Canvas");
  const [isCreatingCanvas, setIsCreatingCanvas] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
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

  useEffect(() => {
    if (user && canvasRef.current) {
      initializeCanvas();
    }
  }, [user, canvasRef.current]);

  const initializeCanvas = () => {
    if (typeof window !== "undefined" && window.mxGraph) {
      const container = canvasRef.current;
      if (!container) return;

      // Initialize mxGraph
      const graph = new window.mxGraph(container);
      graphRef.current = graph;

      // Configure graph
      graph.setConnectable(true);
      graph.setCellsEditable(true);
      graph.setCellsMovable(true);
      graph.setCellsResizable(true);

      // Load canvas data from localStorage if exists
      const canvasData = localStorage.getItem("canvasData");
      if (canvasData) {
        try {
          const data = JSON.parse(canvasData);
          loadCanvasData(data);
          localStorage.removeItem("canvasData"); // Clear temp data
        } catch (error) {
          console.error("Error loading canvas data:", error);
        }
      }

      // Load saved canvases for logged-in users
      if (!guestMode && user && user.email) {
        loadSavedCanvases();
      }
    }
  };

  const loadCanvasData = (data: any) => {
    if (!graphRef.current || !data.nodes) return;

    const graph = graphRef.current;
    const model = graph.getModel();
    model.beginUpdate();

    try {
      const nodeMap = new Map();

      // Create nodes
      data.nodes.forEach((node: any) => {
        const vertex = graph.insertVertex(
          graph.getDefaultParent(),
          node.id,
          node.label,
          node.position.x,
          node.position.y,
          120,
          60,
          node.type === "start"
            ? "shape=ellipse;fillColor=#4CAF50;fontColor=white;"
            : node.type === "end"
            ? "shape=ellipse;fillColor=#f44336;fontColor=white;"
            : ""
        );
        nodeMap.set(node.id, vertex);
      });

      // Create edges
      if (data.edges) {
        data.edges.forEach((edge: any) => {
          const source = nodeMap.get(edge.source);
          const target = nodeMap.get(edge.target);
          if (source && target) {
            graph.insertEdge(
              graph.getDefaultParent(),
              edge.id,
              "",
              source,
              target
            );
          }
        });
      }
    } finally {
      model.endUpdate();
    }
  };

  const loadSavedCanvases = () => {
    if (guestMode) return;
    const saved = localStorage.getItem(`canvases_${user?.email}`);
    if (saved) {
      try {
        setSavedCanvases(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading saved canvases:", error);
      }
    }
  };

  const saveCurrentCanvas = () => {
    if (guestMode || !graphRef.current) {
      alert("Please log in to save canvases.");
      return;
    }

    const graph = graphRef.current;
    const encoder = new window.mxCodec();
    const node = encoder.encode(graph.getModel());

    const canvasData = {
      id: Date.now().toString(),
      name: currentCanvasName,
      data: window.mxUtils.getXml(node),
      timestamp: new Date().toISOString(),
    };

    const updatedCanvases = [...savedCanvases, canvasData];
    setSavedCanvases(updatedCanvases);
    localStorage.setItem(
      `canvases_${user?.email}`,
      JSON.stringify(updatedCanvases)
    );
    alert("Canvas saved successfully!");

    // Track canvas save activity
    if (user) {
      ActivityTracker.trackActivity({
        userId: user.uid,
        userEmail: user.email!,
        type: "canvas_saved",
        title: `Saved canvas: ${currentCanvasName}`,
        description: "User saved their process flow diagram",
        metadata: { canvasName: currentCanvasName },
      });
    }
  };

  const loadCanvas = (canvasData: any) => {
    if (!graphRef.current) return;

    const graph = graphRef.current;
    graph.getModel().clear();

    // Decode XML and load into graph
    const doc = window.mxUtils.parseXml(canvasData.data);
    const codec = new window.mxCodec(doc);
    const model = graph.getModel();
    codec.decode(doc.documentElement, model);
  };

  const createNewCanvas = () => {
    if (!graphRef.current) return;

    const graph = graphRef.current;
    graph.getModel().clear();
    setCurrentCanvasName("Untitled Canvas");
    setIsCreatingCanvas(true);

    // Track canvas creation activity
    if (user && !guestMode) {
      ActivityTracker.trackActivity({
        userId: user.uid,
        userEmail: user.email!,
        type: "canvas_created",
        title: "Created new canvas",
        description: "User started working on a new process flow diagram",
      });
    }
  };

  const addNode = (type: string) => {
    if (!graphRef.current) return;

    const graph = graphRef.current;
    const parent = graph.getDefaultParent();

    let label, style;
    switch (type) {
      case "start":
        label = "Start";
        style = "shape=ellipse;fillColor=#4CAF50;fontColor=white;";
        break;
      case "process":
        label = "Process";
        style = "";
        break;
      case "decision":
        label = "Decision";
        style = "shape=rhombus;";
        break;
      case "end":
        label = "End";
        style = "shape=ellipse;fillColor=#f44336;fontColor=white;";
        break;
      default:
        label = "Task";
        style = "";
    }

    const vertex = graph.insertVertex(
      parent,
      null,
      label,
      100,
      100,
      120,
      60,
      style
    );
    graph.setSelectionCell(vertex);
  };

  const exportCanvas = async () => {
    if (!canvasRef.current) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(canvasRef.current);
      const link = document.createElement("a");
      link.download = `${currentCanvasName}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Error exporting canvas:", error);
      alert("Error exporting canvas. Please try again.");
    }
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
            Please log in to access the canvas
          </p>
          <div className="mt-6 space-y-4">
            <Link
              href="/auth"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Log In
            </Link>
            <button
              onClick={() => (window.location.href = "/auth?guest=true")}
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
                Interactive Canvas - {currentCanvasName}
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

      <main className="ml-64 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Toolbar */}
        <div className="mb-4 bg-white shadow rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4">
            <input
              type="text"
              value={currentCanvasName}
              onChange={(e) => setCurrentCanvasName(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Canvas Name"
            />

            <button
              onClick={createNewCanvas}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              New Canvas
            </button>

            {!guestMode && (
              <button
                onClick={saveCurrentCanvas}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Save Canvas
              </button>
            )}

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                Add Node:
              </span>
              <button
                onClick={() => addNode("start")}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Start
              </button>
              <button
                onClick={() => addNode("process")}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Process
              </button>
              <button
                onClick={() => addNode("decision")}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Decision
              </button>
              <button
                onClick={() => addNode("end")}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                End
              </button>
            </div>

            <button
              onClick={exportCanvas}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Export PNG
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Canvas Area */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Canvas Workspace
                </h3>
                <p className="text-sm text-gray-600">
                  Click and drag to create connections between nodes
                </p>
              </div>
              <div
                ref={canvasRef}
                className="w-full h-96 lg:h-[600px] border-0"
                style={{ cursor: "crosshair" }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Saved Canvases
              </h3>
              {!guestMode ? (
                savedCanvases.length > 0 ? (
                  <div className="space-y-2">
                    {savedCanvases.map((canvas) => (
                      <button
                        key={canvas.id}
                        onClick={() => loadCanvas(canvas)}
                        className="w-full text-left px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm hover:bg-gray-50"
                      >
                        {canvas.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No saved canvases yet. Create and save your first canvas!
                  </p>
                )
              ) : (
                <p className="text-sm text-gray-500">
                  Log in to save and load canvases.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
