#!/usr/bin/env node

/**
 * MCP server for browser testing.
 * Provides tools for testing web application UI elements like sidebar visibility.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import puppeteer from "puppeteer";

/**
 * Create an MCP server with browser testing capabilities.
 */
const server = new Server(
  {
    name: "browser-test-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handler that lists available browser testing tools.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "check_sidebar_visibility",
        description:
          "Check if sidebar is visible on a web page by launching a browser",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "URL of the page to test",
            },
            selector: {
              type: "string",
              description: "CSS selector for the sidebar element",
              default: ".fixed",
            },
          },
          required: ["url"],
        },
      },
      {
        name: "run_element_visibility_test",
        description: "Run a general element visibility test on a web page",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "URL of the page to test",
            },
            selector: {
              type: "string",
              description: "CSS selector for the element to check",
            },
            description: {
              type: "string",
              description: "Description of what is being tested",
            },
          },
          required: ["url", "selector", "description"],
        },
      },
    ],
  };
});

/**
 * Handler for browser testing tools.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "check_sidebar_visibility": {
      const url = String(request.params.arguments?.url);
      const selector = String(request.params.arguments?.selector || ".fixed");

      if (!url) {
        throw new Error("URL is required");
      }

      try {
        const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2" });

        // Wait a bit for any dynamic content to load
        await page.waitForTimeout(2000);

        // Check if sidebar element exists and is visible
        const elementExists = (await page.$(selector)) !== null;

        let isVisible = false;
        let visibilityDetails = "";

        if (elementExists) {
          isVisible = await page.evaluate((sel) => {
            const element = document.querySelector(sel);
            if (!element) return false;

            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();

            return (
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              style.opacity !== "0" &&
              rect.width > 0 &&
              rect.height > 0
            );
          }, selector);

          visibilityDetails = await page.evaluate((sel) => {
            const element = document.querySelector(sel);
            if (!element) return "Element not found";

            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();

            return `Element found with dimensions: ${rect.width}x${rect.height}, display: ${style.display}, visibility: ${style.visibility}, opacity: ${style.opacity}`;
          }, selector);
        }

        await browser.close();

        const result = {
          url,
          selector,
          elementExists,
          isVisible,
          visibilityDetails,
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Browser test error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }

    case "run_element_visibility_test": {
      const url = String(request.params.arguments?.url);
      const selector = String(request.params.arguments?.selector);
      const description = String(request.params.arguments?.description);

      if (!url || !selector || !description) {
        throw new Error("URL, selector, and description are required");
      }

      try {
        const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2" });

        // Wait for page to stabilize
        await page.waitForTimeout(3000);

        // Take a screenshot for documentation
        const screenshot = await page.screenshot({ encoding: "base64" });

        // Check element visibility
        const elementExists = (await page.$(selector)) !== null;
        let testResult = "";

        if (elementExists) {
          const visibilityInfo = await page.evaluate((sel) => {
            const element = document.querySelector(sel);
            if (!element) return null;

            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();

            return {
              display: style.display,
              visibility: style.visibility,
              opacity: style.opacity,
              width: rect.width,
              height: rect.height,
              top: rect.top,
              left: rect.left,
            };
          }, selector);

          const isVisible =
            visibilityInfo.display !== "none" &&
            visibilityInfo.visibility !== "hidden" &&
            visibilityInfo.opacity !== "0" &&
            visibilityInfo.width > 0 &&
            visibilityInfo.height > 0;

          testResult = `${description}: ${isVisible ? "PASS" : "FAIL"}`;
        } else {
          testResult = `${description}: FAIL (Element not found)`;
        }

        await browser.close();

        return {
          content: [
            {
              type: "text",
              text: `Test Result: ${testResult}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Browser test error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }

    default:
      throw new Error("Unknown tool");
  }
});

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
