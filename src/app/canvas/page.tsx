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
  BackgroundVariant,
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
      padding: '10px 16px',
      borderRadius: '6px',
      border: selected ? '2px solid #0070F2' : '1px solid #d1d5db',
      background: '#ffffff',
      minWidth: '130px',
      textAlign: 'center' as const,
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: selected ? '0 0 0 3px rgba(0, 112, 242, 0.2)' : '0 2px 4px 0 rgba(0, 0, 0, 0.08)',
      transition: 'all 0.2s ease',
    };

    switch (data.nodeType) {
      case 'start':
        return {
          ...baseStyle,
          background: '#2ECC71',
          color: 'white',
          borderRadius: '50%',
          border: selected ? '3px solid #27AE60' : '2px solid #27AE60',
          width: '85px',
          height: '85px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: selected ? '0 0 0 4px rgba(46, 204, 113, 0.2)' : '0 3px 6px 0 rgba(46, 204, 113, 0.3)',
        };
      case 'end':
        return {
          ...baseStyle,
          background: '#E74C3C',
          color: 'white',
          borderRadius: '50%',
          border: selected ? '3px solid #C0392B' : '2px solid #C0392B',
          width: '85px',
          height: '85px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: selected ? '0 0 0 4px rgba(231, 76, 60, 0.2)' : '0 3px 6px 0 rgba(231, 76, 60, 0.3)',
        };
      case 'decision':
        return {
          ...baseStyle,
          background: '#FFF9E6',
          border: selected ? '2px solid #F39C12' : '2px solid #F39C12',
          color: '#855A00',
          transform: 'rotate(45deg)',
          width: '85px',
          height: '85px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: selected ? '0 0 0 4px rgba(243, 156, 18, 0.2)' : '0 3px 6px 0 rgba(243, 156, 18, 0.2)',
        };
      default:
        return {
          ...baseStyle,
          background: '#FEFEFE',
          border: selected ? '2px solid #0070F2' : '1px solid #D1E7FF',
        };
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
      <div className="bg-white shadow-md rounded-lg border border-gray-200 p-5">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#0057D9' }}>
          Properties
        </h3>
        <div className="flex flex-col items-center justify-center py-8">
          <svg className="w-16 h-16 mb-3" style={{ color: '#D1E7FF' }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          </svg>
          <p className="text-sm text-gray-500 text-center">
            Select a node to edit its properties
          </p>
        </div>
      </div>
    );
  }

  // Check if node has valid data structure
  if (!selectedNode.data) {
    return (
      <div className="bg-white shadow-md rounded-lg border border-gray-200 p-5">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#0057D9' }}>
          Properties
        </h3>
        <p className="text-sm text-gray-500">
          Node data is missing. Please try reselecting the node.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg border border-gray-200 p-5">
      <h3 className="text-lg font-semibold mb-4" style={{ color: '#0057D9' }}>
        Node Properties
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Node Type
          </label>
          <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm font-medium" style={{ color: '#374151' }}>
            {selectedNode.data.nodeType || 'process'}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Label
          </label>
          <input
            type="text"
            value={selectedNode.data.label || ''}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm transition-all duration-200"
            style={{ outline: 'none' }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#0070F2';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 112, 242, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#D1D5DB';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Description
          </label>
          <textarea
            value={selectedNode.data.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm transition-all duration-200"
            style={{ outline: 'none' }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#0070F2';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 112, 242, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#D1D5DB';
              e.currentTarget.style.boxShadow = 'none';
            }}
            placeholder="Add a description..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Automation Type
          </label>
          <select
            value={selectedNode.data.automationType || 'Manual'}
            onChange={(e) => onUpdate({ automationType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm transition-all duration-200"
            style={{ outline: 'none' }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#0070F2';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 112, 242, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#D1D5DB';
              e.currentTarget.style.boxShadow = 'none';
            }}
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
            className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white shadow-sm transition-all duration-200"
            style={{ backgroundColor: '#E74C3C' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#C0392B';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#E74C3C';
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  // Initialize sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setSidebarCollapsed(savedState === "true");
    }
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
      <Sidebar 
        guestMode={guestMode} 
        onCollapseChange={setSidebarCollapsed}
      />

      {/* Header */}
      <header 
        className="bg-white shadow transition-margin"
        style={{ marginLeft: sidebarCollapsed ? '4rem' : '16rem' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <div className="flex items-center">
              <h2 className="ml-4 text-2xl font-bold" style={{ color: '#0057D9' }}>
                Process Canvas
              </h2>
              <span className="ml-3 text-xl text-gray-400">|</span>
              <span className="ml-3 text-lg text-gray-600">{currentCanvasName}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-600">
                {guestMode ? "Guest Mode" : `${user.email}`}
              </span>
              {guestMode ? (
                <Link
                  href="/auth"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white transition-all duration-200"
                  style={{ backgroundColor: '#0070F2' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0057D9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0070F2';
                  }}
                >
                  Login
                </Link>
              ) : (
                <Link
                  href="/auth"
                  className="inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-lg transition-all duration-200"
                  style={{ 
                    borderColor: '#D1D5DB',
                    color: '#374151',
                    backgroundColor: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F3F4F6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  Sign out
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main 
        className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 transition-margin"
        style={{ marginLeft: sidebarCollapsed ? '4rem' : '16rem' }}
      >
        {/* Toolbar */}
        <div className="mb-4 bg-white shadow-md rounded-lg border border-gray-200">
          <div className="flex flex-wrap items-center gap-3 p-3" style={{ backgroundColor: '#F9FAFB' }}>
            {/* Canvas Name Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={currentCanvasName}
                onChange={(e) => setCurrentCanvasName(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none text-sm font-medium"
                style={{ 
                  borderColor: '#D1D5DB',
                  minWidth: '200px',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0070F2';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 112, 242, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="Canvas Name"
              />
            </div>

            {/* File Actions */}
            <div className="flex items-center gap-2 pl-3 border-l-2 border-gray-300">
              <button
                onClick={createNewCanvas}
                className="inline-flex items-center gap-2 px-3 py-2 border shadow-sm text-sm font-medium rounded-lg transition-all duration-200"
                style={{ 
                  borderColor: '#D1D5DB',
                  color: '#374151',
                  backgroundColor: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6';
                  e.currentTarget.style.borderColor = '#9CA3AF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
                title="New Canvas"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New
              </button>

              {!guestMode && (
                <button
                  onClick={saveCurrentCanvas}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white shadow-sm transition-all duration-200"
                  style={{ backgroundColor: '#0070F2' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0057D9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0070F2';
                  }}
                  title="Save Canvas"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save
                </button>
              )}
            </div>

            {/* History Actions */}
            <div className="flex items-center gap-2 pl-3 border-l-2 border-gray-300">
              <button
                onClick={undo}
                disabled={historyStep <= 0}
                className="inline-flex items-center gap-1 px-3 py-2 border shadow-sm text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ 
                  borderColor: '#D1D5DB',
                  color: '#374151',
                  backgroundColor: 'white'
                }}
                onMouseEnter={(e) => {
                  if (historyStep > 0) {
                    e.currentTarget.style.backgroundColor = '#F3F4F6';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
                title="Undo (Ctrl+Z)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              <button
                onClick={redo}
                disabled={historyStep >= history.length - 1}
                className="inline-flex items-center gap-1 px-3 py-2 border shadow-sm text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ 
                  borderColor: '#D1D5DB',
                  color: '#374151',
                  backgroundColor: 'white'
                }}
                onMouseEnter={(e) => {
                  if (historyStep < history.length - 1) {
                    e.currentTarget.style.backgroundColor = '#F3F4F6';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
                title="Redo (Ctrl+Y)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                </svg>
              </button>
            </div>

            {/* Add Node Actions */}
            <div className="flex items-center gap-2 pl-3 border-l-2 border-gray-300">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Add:
              </span>
              <button
                onClick={() => addNode("start")}
                className="inline-flex items-center gap-1 px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white shadow-sm transition-all duration-200"
                style={{ backgroundColor: '#2ECC71' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#27AE60';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2ECC71';
                }}
                title="Add Start Node"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Start
              </button>
              <button
                onClick={() => addNode("process")}
                className="inline-flex items-center gap-1 px-3 py-2 border shadow-sm text-sm font-medium rounded-lg transition-all duration-200"
                style={{ 
                  borderColor: '#D1D5DB',
                  color: '#374151',
                  backgroundColor: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E8F3FF';
                  e.currentTarget.style.borderColor = '#0070F2';
                  e.currentTarget.style.color = '#0070F2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.color = '#374151';
                }}
                title="Add Process Node"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="4" y="4" width="16" height="16" strokeWidth={2} rx="2" />
                </svg>
                Process
              </button>
              <button
                onClick={() => addNode("decision")}
                className="inline-flex items-center gap-1 px-3 py-2 border shadow-sm text-sm font-medium rounded-lg transition-all duration-200"
                style={{ 
                  borderColor: '#D1D5DB',
                  color: '#374151',
                  backgroundColor: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFF4E6';
                  e.currentTarget.style.borderColor = '#F39C12';
                  e.currentTarget.style.color = '#F39C12';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.color = '#374151';
                }}
                title="Add Decision Node"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4l8 8-8 8-8-8 8-8z" />
                </svg>
                Decision
              </button>
              <button
                onClick={() => addNode("end")}
                className="inline-flex items-center gap-1 px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white shadow-sm transition-all duration-200"
                style={{ backgroundColor: '#E74C3C' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#C0392B';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#E74C3C';
                }}
                title="Add End Node"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                </svg>
                End
              </button>
            </div>

            {/* Export Actions */}
            <div className="flex items-center gap-2 pl-3 border-l-2 border-gray-300 ml-auto">
              <button
                onClick={exportCanvas}
                className="inline-flex items-center gap-2 px-3 py-2 border shadow-sm text-sm font-medium rounded-lg transition-all duration-200"
                style={{ 
                  borderColor: '#D1D5DB',
                  color: '#374151',
                  backgroundColor: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
                title="Export as PNG"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                PNG
              </button>

              <button
                onClick={exportCanvasAsJSON}
                className="inline-flex items-center gap-2 px-3 py-2 border shadow-sm text-sm font-medium rounded-lg transition-all duration-200"
                style={{ 
                  borderColor: '#D1D5DB',
                  color: '#374151',
                  backgroundColor: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
                title="Export as JSON"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                JSON
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Canvas Area */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow-md rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200" style={{ backgroundColor: '#F9FAFB' }}>
                <h3 className="text-lg font-semibold" style={{ color: '#0057D9' }}>
                  Canvas Workspace
                </h3>
                <p className="text-sm text-gray-600 mt-1">
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
                  <Background variant={BackgroundVariant.Dots} gap={20} size={2} />
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
            <div className="bg-white shadow-md rounded-lg border border-gray-200 p-5">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#0057D9' }}>
                Saved Canvases
              </h3>
              {!guestMode ? (
                savedCanvases.length > 0 ? (
                  <div className="space-y-2">
                    {savedCanvases.map((canvas) => (
                      <button
                        key={canvas.id}
                        onClick={() => loadCanvas(canvas)}
                        className="w-full text-left px-3 py-2 border rounded-lg text-sm font-medium transition-all duration-200"
                        style={{
                          borderColor: '#D1D5DB',
                          color: '#374151',
                          backgroundColor: 'white'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#E8F3FF';
                          e.currentTarget.style.borderColor = '#0070F2';
                          e.currentTarget.style.color = '#0070F2';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.borderColor = '#D1D5DB';
                          e.currentTarget.style.color = '#374151';
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="truncate">{canvas.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6">
                    <svg className="w-12 h-12 mb-3" style={{ color: '#D1E7FF' }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                    </svg>
                    <p className="text-xs text-gray-500 text-center">
                      No saved canvases yet. Create and save your first canvas!
                    </p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <svg className="w-12 h-12 mb-3" style={{ color: '#D1E7FF' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <p className="text-xs text-gray-500 text-center">
                    Log in to save and load canvases.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
