import { NextRequest, NextResponse } from "next/server";

const OPEN_ROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!OPEN_ROUTER_API_KEY) {
      return NextResponse.json(
        { error: "Open Router API key not configured. Please add OPEN_ROUTER_API_KEY to your .env.local file." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { prompt, model = "anthropic/claude-3-haiku:beta" } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPEN_ROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", errorText);
      return NextResponse.json(
        { error: `Open Router API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage,
    });
  } catch (error) {
    console.error("Error in OpenRouter API route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}

