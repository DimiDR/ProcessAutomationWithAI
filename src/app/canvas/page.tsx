"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { auth } from "@/lib/firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import { ActivityTracker } from "@/lib/activityTracker";
import Link from "next/link";
import Sidebar from "@/lib/sidebar";
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  OnConnect,
  OnInit,
  MarkerType,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

// Process Node Component
function ProcessNode({ data, selected }: any) {
  const getNodeStyle = () => {
    let baseStyle = {
      padding: '8px 12px',
      borderRadius: '4px',
      border: selected ? '2px solid #3b82f6' : '1px solid #d1d5db',
      background: '#ffffff',
      minWidth: '120px',
      textAlign: 'center' as const,
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: selected ? '0 0 0 1px #3b82f6' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    };

    switch (data.nodeType) {
      case 'start':
        return {
          ...baseStyle,
          background: '#4CAF50',
          color: 'white',
          borderRadius: '50%',
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        };
      case 'end':
        return {
          ...baseStyle,
          background: '#f44336',
          color: 'white',
          borderRadius: '50%',
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        };
      case 'decision':
        return {
          ...baseStyle,
          transform: 'rotate(45deg)',
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        };
      default:
        return baseStyle;
    }
  };

  const getAutomationColor = () => {
    switch (data.automationType) {
      case 'Code':
        return '#8b5cf6';
      case 'LowCode':
        return '#06b6d4';
      case 'NoCode':
        return '#10b981';
      case 'RPA':
        return '#f59e0b';
      case 'AI Agent':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <>
      {/* Target handle (for incoming connections) - hidden for start nodes */}
      {data.nodeType !== 'start' && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: '#555' }}
        />
      )}
      
      <div style={getNodeStyle()}>
        {data.nodeType === 'decision' ? (
          <div style={{ transform: 'rotate(-45deg)' }}>
            {data.label}
          </div>
        ) : (
          <div>
            <div>{data.label}</div>
            {data.automationType && data.automationType !== 'Manual' && (
              <div
                style={{
                  fontSize: '10px',
                  marginTop: '4px',
                  color: getAutomationColor(),
                  fontWeight: 'bold',
                }}
              >
                [{data.automationType}]
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Source handle (for outgoing connections) - hidden for end nodes */}
      {data.nodeType !== 'end' && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: '#555' }}
        />
      )}
    </>
  );
}

// Define node types
const nodeTypes: NodeTypes = {
  processNode: ProcessNode,
};

// Properties Panel Component
function PropertiesPanel({ 
  selectedNode, 
  onUpdate, 
  onDelete 
}: { 
  selectedNode: Node | null; 
  onUpdate: (data: any) => void; 
  onDelete: () => void;
}) {
  if (!selectedNode) {
    return (
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Properties
        </h3>
        <p className="text-sm text-gray-500">
          Select a node to edit its properties
        </p>
      </div>
    );
  }

  // Check if node has valid data structure
  if (!selectedNode.data) {
    return (
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Properties
        </h3>
        <p className="text-sm text-gray-500">
          Node data is missing. Please try reselecting the node.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Node Properties
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Node Type
          </label>
          <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm">
            {selectedNode.data.nodeType || 'process'}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            type="text"
            value={selectedNode.data.label || ''}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={selectedNode.data.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Add a description..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Automation Type
          </label>
          <select
            value={selectedNode.data.automationType || 'Manual'}
            onChange={(e) => onUpdate({ automationType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Manual">Manual</option>
            <option value="Code">Code</option>
            <option value="LowCode">LowCode</option>
            <option value="NoCode">NoCode</option>
            <option value="RPA">RPA</option>
            <option value="AI Agent">AI Agent</option>
          </select>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={onDelete}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Node
          </button>
        </div>
      </div>
    </div>
  );
}

// History interface for undo/redo
interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

export default function CanvasPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);
  const [savedCanvases, setSavedCanvases] = useState<
    Array<{ id: string; name: string; nodes: Node[]; edges: Edge[] }>
  >([]);
  const [currentCanvasName, setCurrentCanvasName] = useState("Untitled Canvas");

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Undo/Redo state
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

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
    if (user) {
      initializeCanvas();
    }
  }, [user]);

  // Add history entry whenever nodes or edges change
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      addToHistory({ nodes, edges });
    }
  }, [nodes, edges]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyStep, history]);

  const addToHistory = (state: HistoryState) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyStep + 1);
      newHistory.push(state);
      // Limit history to 50 steps
      if (newHistory.length > 50) {
        newHistory.shift();
        setHistoryStep(49);
        return newHistory;
      }
      setHistoryStep(newHistory.length - 1);
      return newHistory;
    });
  };

  const undo = () => {
    if (historyStep > 0) {
      const prevState = history[historyStep - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryStep(historyStep - 1);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const nextState = history[historyStep + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryStep(historyStep + 1);
    }
  };

  const initializeCanvas = () => {
    // Load canvas data from localStorage if exists
    const canvasData = localStorage.getItem("canvasData");
    if (canvasData) {
      try {
        const data = JSON.parse(canvasData);
        loadCanvas(data);
        localStorage.removeItem("canvasData"); // Clear temp data
      } catch (error) {
        console.error("Error loading canvas data:", error);
      }
    }

    // Load saved canvases for logged-in users
    if (!guestMode && user && user.email) {
      loadSavedCanvases();
    }
  };

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    }, eds)),
    [setEdges]
  );

  const onInit: OnInit = useCallback(
    (instance) => setReactFlowInstance(instance),
    []
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

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
    if (guestMode) {
      alert("Please log in to save canvases.");
      return;
    }

    const canvasData = {
      id: Date.now().toString(),
      name: currentCanvasName,
      nodes,
      edges,
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
    if (!canvasData) return;

    // Load React Flow data
    if (canvasData.nodes && canvasData.edges) {
      // Validate and ensure all nodes have proper data structure
      const validatedNodes = canvasData.nodes.map((node: Node) => ({
        ...node,
        data: node.data || {
          label: 'Untitled',
          nodeType: 'process',
          automationType: 'Manual',
          description: '',
        },
      }));
      
      setNodes(validatedNodes);
      setEdges(canvasData.edges);
      if (canvasData.name) {
        setCurrentCanvasName(canvasData.name);
      }
    }
  };

  const createNewCanvas = () => {
    setNodes([]);
    setEdges([]);
    setCurrentCanvasName("Untitled Canvas");
    setSelectedNodeId(null);
    setHistory([]);
    setHistoryStep(-1);

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
    const newNode: Node = {
      id: `node-${Date.now()}-${Math.random()}`,
      type: 'processNode',
      position: {
        x: Math.floor(Math.random() * 15) * 20 + 100, // Snap to grid
        y: Math.floor(Math.random() * 10) * 20 + 100, // Snap to grid
      },
      data: {
        label: getNodeLabel(type),
        nodeType: type,
        automationType: 'Manual',
        description: '',
      },
    };

    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeId(newNode.id);
  };

  const getNodeLabel = (type: string) => {
    switch (type) {
      case "start":
        return "Start";
      case "process":
        return "Process";
      case "decision":
        return "Decision";
      case "end":
        return "End";
      default:
        return "Task";
    }
  };

  const updateNodeData = (data: any) => {
    if (!selectedNodeId) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          // Ensure node has a data object before updating
          const currentData = node.data || {};
          return { ...node, data: { ...currentData, ...data } };
        }
        return node;
      })
    );
  };

  const deleteSelectedNode = () => {
    if (!selectedNodeId) return;

    setNodes((nds) => nds.filter((node) => node.id !== selectedNodeId));
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== selectedNodeId && edge.target !== selectedNodeId
    ));
    setSelectedNodeId(null);
  };

  const exportCanvasAsJSON = () => {
    const canvasData = {
      name: currentCanvasName,
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(canvasData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `${currentCanvasName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportCanvas = async () => {
    if (!reactFlowWrapper.current) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(reactFlowWrapper.current);
      const link = document.createElement("a");
      link.download = `${currentCanvasName}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Error exporting canvas:", error);
      alert("Error exporting canvas. Please try again.");
    }
  };

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) || null;

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
                Process Canvas - {currentCanvasName}
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

            <div className="flex items-center space-x-2 border-l border-gray-300 pl-4">
              <button
                onClick={undo}
                disabled={historyStep <= 0}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                ↶ Undo
              </button>
              <button
                onClick={redo}
                disabled={historyStep >= history.length - 1}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Y)"
              >
                ↷ Redo
              </button>
            </div>

            <div className="flex items-center space-x-2 border-l border-gray-300 pl-4">
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

            <div className="flex items-center space-x-2 border-l border-gray-300 pl-4">
              <button
                onClick={exportCanvas}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Export PNG
              </button>

              <button
                onClick={exportCanvasAsJSON}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Canvas Area */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Canvas Workspace
                </h3>
                <p className="text-sm text-gray-600">
                  Drag nodes, connect with arrows. Nodes snap to 20px grid.
                </p>
              </div>
              <div
                ref={reactFlowWrapper}
                className="w-full h-96 lg:h-[600px] border-0"
              >
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onInit={onInit}
                  onNodeClick={onNodeClick}
                  onPaneClick={onPaneClick}
                  nodeTypes={nodeTypes}
                  snapToGrid={true}
                  snapGrid={[20, 20]}
                  fitView
                  attributionPosition="bottom-left"
                  className="bg-gray-50"
                  defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: true,
                    markerEnd: {
                      type: MarkerType.ArrowClosed,
                    },
                  }}
                >
                  <Controls />
                  <MiniMap />
                  <Background variant="dots" gap={20} size={2} />
                </ReactFlow>
              </div>
            </div>
          </div>

          {/* Properties Panel */}
          <div className="lg:col-span-1">
            <PropertiesPanel
              selectedNode={selectedNode}
              onUpdate={updateNodeData}
              onDelete={deleteSelectedNode}
            />
          </div>

          {/* Saved Canvases */}
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
