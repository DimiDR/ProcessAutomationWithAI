export const queryOpenRouter = async (prompt: string) => {
  const response = await fetch("/api/openrouter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      model: "anthropic/claude-3-haiku:beta", // You can change this model
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.content;
};

export const getAIResponse = async (prompt: string) => {
  return await queryOpenRouter(prompt);
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

export const generateCanvasJSON = async (
  question: string,
  aiResponse: string
) => {
  const prompt = `You are a process automation expert. Based on the following question and recommendations, generate a valid ReactFlow canvas JSON structure to visualize the automation workflow.

QUESTION: "${question}"

RECOMMENDATIONS: "${aiResponse}"

Generate a JSON structure that represents this process as a flowchart. Follow these EXACT specifications:

1. **Structure**:
{
  "name": "Descriptive Process Name",
  "nodes": [...],
  "edges": [...]
}

2. **Node Types**:
- "start": Green circle - beginning of process
- "end": Red circle - end of process  
- "process": Rectangle - main process steps
- "decision": Diamond - decision points

3. **Node Structure** (REQUIRED FIELDS):
{
  "id": "unique-node-id",
  "type": "processNode",
  "position": { "x": 80, "y": 80 },
  "data": {
    "label": "Short step name",
    "nodeType": "start|end|process|decision",
    "automationType": "Manual|Code|LowCode|NoCode|RPA|AI Agent",
    "description": "Detailed description of what happens in this step"
  }
}

4. **Automation Types**:
- "AI Agent": For AI-powered automation
- "RPA": For robotic process automation
- "NoCode": For platforms like Zapier, Make
- "LowCode": For platforms like Bubble, OutSystems
- "Code": For custom programming solutions
- "Manual": For human-performed steps

5. **Edge Structure**:
{
  "id": "e1-2",
  "source": "source-node-id",
  "target": "target-node-id",
  "markerType": "arrowclosed"
}

6. **Layout Rules**:
- Start with position x: 80, y: 80
- Space nodes horizontally by 240-300px
- Space nodes vertically by 160-200px for parallel branches
- Use grid-based positioning (multiples of 80)
- Always start with ONE "start" node
- Always end with ONE "end" node

7. **Best Practices**:
- Create 5-10 nodes for a complete process
- Assign meaningful automation types based on the recommendations
- Include detailed descriptions in each node
- Connect nodes in logical workflow order
- Use decision nodes for branching logic

CRITICAL: Return ONLY the JSON object. No markdown code blocks, no explanations, no additional text. Start with { and end with }.`;

  return await queryOpenRouter(prompt);
};