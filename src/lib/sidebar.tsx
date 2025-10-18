"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface SidebarProps {
  guestMode: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ guestMode, onCollapseChange }: SidebarProps) {
  const pathname = usePathname();
  // Initialize state from localStorage to prevent flash
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem("sidebarCollapsed");
      return savedState === "true";
    }
    return false;
  });

  // Notify parent of initial collapsed state
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, []);

  // Handle collapse toggle
  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
    if (onCollapseChange) {
      onCollapseChange(newState);
    }
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
          />
        </svg>
      ),
    },
    {
      name: "Process Questions",
      path: "/process-questions",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      name: "Canvas",
      path: "/canvas",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      name: "Case Studies",
      path: "/case-studies",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    {
      name: "Simulation",
      path: "/simulation",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0-10V5a2 2 0 012-2h2a2 2 0 012 2v4m0 0v6m0-6l-2-2m2 2l2-2m-2 2l2 2"
          />
        </svg>
      ),
    },
    {
      name: "User Management",
      path: "/user-management",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
    },
  ];

  // SAP Signavio inspired styles
  const isGuestMode = guestMode;
  const bgClass = isGuestMode
    ? "bg-gradient-to-br from-blue-50 to-indigo-50"
    : "bg-white";

  const headerBgClass = isGuestMode ? "bg-blue-100" : "bg-gray-50";

  return (
    <div
      className={`fixed left-0 top-0 h-full shadow-xl border-r border-gray-200 transition-all duration-300 z-50 flex flex-col ${
        isCollapsed ? "w-16" : "w-64"
      }`}
      style={{
        boxShadow: '0 0 20px rgba(0, 112, 242, 0.1)'
      }}
    >
      {/* Background with subtle pattern for visual distinction */}
      <div className={`flex-1 ${bgClass}`}>
        {/* Header */}
        <div
          className={`flex items-center ${
            isCollapsed ? "px-2 py-4" : "px-4 py-4"
          } border-b border-gray-200 ${headerBgClass}`}
        >
          {/* Toggle Button */}
          <button
            onClick={handleToggle}
            className="p-2 rounded-md transition-all duration-200"
            style={{
              backgroundColor: 'transparent',
              color: '#0070F2'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E8F3FF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isCollapsed ? "M13 5l7 7-7 7" : "M11 19l-7-7 7-7"}
              />
            </svg>
          </button>
          {!isCollapsed && (
            <h2 className="text-lg font-semibold ml-2" style={{ color: '#0057D9' }}>
              Navigation
            </h2>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="mt-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center ${
                      isCollapsed ? "px-2 py-3 justify-center" : "px-4 py-3"
                    } rounded-lg text-sm font-medium transition-all duration-200`}
                    style={{
                      backgroundColor: isActive ? '#E8F3FF' : 'transparent',
                      color: isActive ? '#0070F2' : '#374151',
                      borderLeft: isActive ? '4px solid #0070F2' : '4px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#F3F4F6';
                        e.currentTarget.style.color = '#0070F2';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#374151';
                      }
                    }}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <div className="flex-shrink-0">{item.icon}</div>
                    {!isCollapsed && (
                      <span className="ml-3 truncate">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Guest mode notice */}
      {isGuestMode && !isCollapsed && (
        <div className="p-3 border-t bg-blue-50 border-gray-200">
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs text-blue-700 font-medium">
              Guest Mode
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Sign in for full features
          </p>
        </div>
      )}
    </div>
  );
}
