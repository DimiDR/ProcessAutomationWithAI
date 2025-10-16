"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
import { ActivityTracker } from "@/lib/activityTracker";

export default function SimulationPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);
  const [scenario, setScenario] = useState({
    title: "E-commerce Order Processing",
    baselineEfficiency: 65,
    baselineCost: 100,
    baselineErrors: 8,
    automationEfficiency: 85,
    automationCost: 60,
    automationErrors: 1,
  });
  const [simulationResults, setSimulationResults] = useState<any>(null);

  const simulations = [
    {
      id: 1,
      title: "E-commerce Order Processing",
      industry: "Retail",
      description:
        "Automate the entire order fulfillment process from customer orders to shipping.",
      baseline: {
        efficiency: 65,
        cost: 100,
        errors: 8,
        completionTime: 120, // minutes
      },
      automated: {
        efficiency: 85,
        cost: 60,
        errors: 1,
        completionTime: 45, // minutes
      },
      technologies: ["RPA", "AI Decision Making", "Auto-Shipping"],
      roi: "245%",
    },
    {
      id: 2,
      title: "Invoice Processing & Payment",
      industry: "Finance",
      description:
        "Automate accounts payable process from invoice receipt to payment.",
      baseline: {
        efficiency: 60,
        cost: 100,
        errors: 12,
        completionTime: 480, // minutes (8 hours)
      },
      automated: {
        efficiency: 92,
        cost: 25,
        errors: 0.5,
        completionTime: 180, // minutes (3 hours)
      },
      technologies: [
        "OCR",
        "AI Classification",
        "Auto-Payment",
        "Workflow Automation",
      ],
      roi: "400%",
    },
    {
      id: 3,
      title: "HR Employee Onboarding",
      industry: "HR",
      description: "Streamline the entire employee onboarding process.",
      baseline: {
        efficiency: 55,
        cost: 100,
        errors: 15,
        completionTime: 1440, // minutes (24 hours)
      },
      automated: {
        efficiency: 88,
        cost: 35,
        errors: 2,
        completionTime: 480, // minutes (8 hours)
      },
      technologies: [
        "Digital Forms",
        "Auto-Documentation",
        "E-Signature",
        "Chatbots",
      ],
      roi: "285%",
    },
    {
      id: 4,
      title: "Customer Support Ticketing",
      industry: "Customer Service",
      description:
        "Automate ticket routing, resolution, and customer communication.",
      baseline: {
        efficiency: 70,
        cost: 100,
        errors: 5,
        completionTime: 240, // minutes (4 hours)
      },
      automated: {
        efficiency: 90,
        cost: 40,
        errors: 1,
        completionTime: 60, // minutes (1 hour)
      },
      technologies: ["AI Chatbots", "Smart Routing", "Auto-Resolution"],
      roi: "250%",
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

  const selectSimulation = (sim: any) => {
    setScenario({
      title: sim.title,
      baselineEfficiency: sim.baseline.efficiency,
      baselineCost: sim.baseline.cost,
      baselineErrors: sim.baseline.errors,
      automationEfficiency: sim.automated.efficiency,
      automationCost: sim.automated.cost,
      automationErrors: sim.automated.errors,
    });

    if (user && !guestMode) {
      ActivityTracker.trackActivity({
        userId: user.uid,
        title: `Started simulation: ${sim.title}`,
        type: "simulation_run",
      });
    }
  };

  const runSimulation = () => {
    // Calculate metrics
    const efficiencyGain =
      scenario.automationEfficiency - scenario.baselineEfficiency;
    const costSavings =
      ((scenario.baselineCost - scenario.automationCost) /
        scenario.baselineCost) *
      100;
    const errorReduction = scenario.baselineErrors - scenario.automationErrors;

    const results = {
      efficiencyGain,
      costSavings: Math.round(costSavings),
      errorReduction: Math.round(errorReduction * 100) / 100,
      paybackPeriod: Math.round(
        ((scenario.baselineCost - scenario.automationCost) /
          scenario.baselineCost) *
          12
      ),
      annualSavings: Math.round(
        (scenario.baselineCost - scenario.automationCost) * 1.5
      ),
      technologyStack: [
        { name: "Robotic Process Automation", impact: "High" },
        { name: "Artificial Intelligence", impact: "Medium" },
        { name: "Machine Learning", impact: "Medium" },
      ],
    };

    setSimulationResults(results);
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
                {guestMode ? "Back to Auth" : "Sign out"}
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
              href="/dashboard"
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
            >
              Dashboard
            </Link>
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
              className="border-yellow-500 text-yellow-600 border-b-2 whitespace-nowrap py-2 px-1 font-medium text-sm"
              aria-current="page"
            >
              Simulation
            </Link>
            {!guestMode && (
              <Link
                href="/user-management"
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
              >
                User Management
              </Link>
            )}
          </nav>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Simulation Environment
          </h1>
          <p className="mt-2 text-gray-600">
            Test automation scenarios and see potential cost savings and
            efficiency gains
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Simulation Scenarios */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Available Simulations
              </h2>
              <div className="space-y-4">
                {simulations.map((sim) => (
                  <div
                    key={sim.id}
                    className={`border rounded-lg p-4 cursor-pointer hover:border-yellow-500 transition-colors ${
                      scenario.title === sim.title
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => selectSimulation(sim)}
                  >
                    <h3 className="font-medium text-gray-900 mb-2">
                      {sim.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {sim.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {sim.industry}
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        {sim.roi} ROI
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Simulation Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Scenario */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Current Scenario: {scenario.title}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-red-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Manual Process (Baseline)
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Efficiency:</span>
                      <span className="font-medium">
                        {scenario.baselineEfficiency}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost:</span>
                      <span className="font-medium">
                        ${scenario.baselineCost}/unit
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Errors:</span>
                      <span className="font-medium">
                        {scenario.baselineErrors}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Automated Process
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Efficiency:</span>
                      <span className="font-medium">
                        {scenario.automationEfficiency}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost:</span>
                      <span className="font-medium">
                        ${scenario.automationCost}/unit
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Errors:</span>
                      <span className="font-medium">
                        {scenario.automationErrors}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={runSimulation}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
              >
                Run Simulation
              </button>
            </div>

            {/* Results */}
            {simulationResults && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Simulation Results
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      +{simulationResults.efficiencyGain}%
                    </div>
                    <div className="text-sm text-gray-600">Efficiency Gain</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {simulationResults.costSavings}%
                    </div>
                    <div className="text-sm text-gray-600">Cost Savings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      -{simulationResults.errorReduction}%
                    </div>
                    <div className="text-sm text-gray-600">Error Reduction</div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">
                    Key Metrics
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Estimated Annual Savings:</span>
                      <span className="font-medium text-green-600">
                        ${simulationResults.annualSavings.toLocaleString()},
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payback Period:</span>
                      <span className="font-medium text-blue-600">
                        {simulationResults.paybackPeriod} months
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 mt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">
                    Recommended Technologies
                  </h3>
                  <div className="space-y-2">
                    {simulationResults.technologyStack.map(
                      (tech: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm font-medium">
                            {tech.name}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              tech.impact === "High"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {tech.impact} Impact
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
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
                  Sign up for a full account to save simulation results and
                  access advanced customization features.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
