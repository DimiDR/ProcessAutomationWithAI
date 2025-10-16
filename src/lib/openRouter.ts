const OPEN_ROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY;

export const queryOpenRouter = async (prompt: string) => {
  if (!OPEN_ROUTER_API_KEY) {
    throw new Error("Open Router API key not configured");
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
        model: "anthropic/claude-3-haiku:beta", // You can change this model
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
    throw new Error(`Open Router API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

export const generateProcessAutomationSuggestions = async (query: string) => {
  const prompt = `You are a process automation consultant AI. A user has described a process problem: "${query}". 
  Provide suggestions on how to automate this process using AI, robotics, NoCode/LowCode platforms, and/or programming. 
  Include:
  1. Analysis of the current process
  2. Suggested automation solutions (prioritized list)
  3. Estimated implementation effort for each
  4. Potential benefits
  5. Hybrid solutions if appropriate
  
  Be specific and actionable, suggesting tools like Zapier for NoCode, UiPath for RPA, or specific AI models.`;

  return await queryOpenRouter(prompt);
};
