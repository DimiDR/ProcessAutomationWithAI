import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Sidebar from "../lib/sidebar";
import { usePathname } from "next/navigation";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock usePathname
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe("Sidebar Component", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
  });

  it("renders sidebar when guestMode is false", () => {
    render(<Sidebar guestMode={false} />);

    expect(screen.getByText("Navigation")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Process Questions")).toBeInTheDocument();
    expect(screen.getByText("Canvas")).toBeInTheDocument();
    expect(screen.getByText("Case Studies")).toBeInTheDocument();
    expect(screen.getByText("Simulation")).toBeInTheDocument();
    expect(screen.getByText("User Management")).toBeInTheDocument();
  });

  it("renders sidebar with guest mode styling when guestMode is true", () => {
    render(<Sidebar guestMode={true} />);

    expect(screen.getByText("Navigation")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Guest Mode")).toBeInTheDocument();

    // Check for guest mode styling
    const sidebar = document.querySelector("[class*='bg-gradient-to-br']");
    expect(sidebar).toBeInTheDocument();
  });

  it("highlights active menu item based on pathname", () => {
    mockUsePathname.mockReturnValue("/dashboard");

    render(<Sidebar guestMode={false} />);

    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink).toHaveClass("bg-indigo-50", "text-indigo-700");

    // Other links should not be active
    const processQuestionsLink = screen
      .getByText("Process Questions")
      .closest("a");
    expect(processQuestionsLink).not.toHaveClass("bg-indigo-50");
  });

  it("applies correct CSS classes for fixed positioning", () => {
    render(<Sidebar guestMode={false} />);

    const sidebar = document.querySelector(".fixed");
    expect(sidebar).toHaveClass("fixed", "left-0", "top-0", "h-full", "w-64");
  });

  it("renders SVG icons for each menu item (including guest mode info icon)", () => {
    render(<Sidebar guestMode={true} />);

    const svgs = document.querySelectorAll("svg");
    expect(svgs).toHaveLength(7); // Six for menu items + one for guest mode icon
  });

  it("has correct href attributes for menu links", () => {
    render(<Sidebar guestMode={false} />);

    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");

    const canvasLink = screen.getByText("Canvas").closest("a");
    expect(canvasLink).toHaveAttribute("href", "/canvas");
  });
});
