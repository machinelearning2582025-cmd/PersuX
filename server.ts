import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

function parseJSONSafely(text: string | undefined): any {
  if (!text) return {};
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  cleaned = cleaned.trim();
  return JSON.parse(cleaned);
}

const app = express();
app.use(express.json());

// API Routes
app.post("/api/why", async (req, res) => {
  try {
    const { goals, extraInfo } = req.body;
    const prompt = `Act as an expert communication coach. The user wants to learn communication skills for: ${goals.join(", ")}. 
Additional context: ${extraInfo || "None"}.
Generate a powerful, personalized 1-2 sentence "Why Statement" in clear Hinglish (Hindi written in English alphabet mixed with English). 
Make it sound like a personal mission statement. Start directly with the statement without any quotes or explanations.
Example format: "Main apne confidence aur communication ko strong banana chahta hoon taaki office mein smoothly present kar sakun..."`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
    });

    res.json({ statement: response.text?.trim() });
  } catch (error) {
    console.error("AI Error (Why):", error);
    res.status(500).json({ error: "Failed to generate Why statement" });
  }
});

app.post("/api/lesson", async (req, res) => {
  try {
    const { whyStatement, completedLessonsCount, coveredTopics } = req.body;
    const step = completedLessonsCount + 1;
    
    const prompt = `Act as an expert, deeply insightful personal communication coach. The user's 'Why' (goal) is: "${whyStatement}".
Generate Lesson #${step} tailored to help them achieve this goal.
We have already covered these topics: ${coveredTopics ? coveredTopics.join(", ") : "None"}.
CRITICAL: Do NOT teach these topics again. Provide fresh, deep, high-quality, actionable insights, NOT generic advice.
Output your response matching the requested JSON structure exactly. Ensure no markdown formatting or extra text. Use Hinglish naturally.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hook: { 
              type: Type.STRING, 
              description: "A short, engaging 1-sentence thought-provoking hook in Hinglish about this lesson. Focus on interest or curiosity." 
            },
            title: { 
              type: Type.STRING, 
              description: "A short, catchy title for the lesson (English or Hinglish)." 
            },
            content: { 
              type: Type.STRING, 
              description: "A 2-3 paragraph lesson content in Hinglish. Include an actionable psychological principle or micro-communication rule, and use an Indian context example so it feels relatable. Ensure the explanation is deep and insightful." 
            },
            reflectionPoint: { 
              type: Type.STRING, 
              description: "A single thought-provoking question in Hinglish directed at the user to reflect on mid-lesson." 
            },
            task: { 
              type: Type.STRING, 
              description: "A single, highly specific, actionable micro-task they must complete TODAY in real life. Keep it extremely simple and easy, requiring less than 1 minute to act on." 
            }
          },
          required: ["hook", "title", "content", "reflectionPoint", "task"]
        }
      }
    });

    const lessonData = parseJSONSafely(response.text);
    res.json(lessonData);
  } catch (error) {
    console.error("AI Error (Lesson):", error);
    res.status(500).json({ error: "Failed to generate lesson" });
  }
});

app.post("/api/coach", async (req, res) => {
  try {
    const { task, reflection } = req.body;
    const prompt = `The user just completed a communication practice task: "${task}".
Their reflection on how it went is: "${reflection}".
Act as an encouraging AI communication coach. Reply with a short, 1-2 sentence encouraging feedback or a tiny tip in Hinglish. Keep it highly motivational. Add an emoji.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
    });

    res.json({ reply: response.text?.trim() });
  } catch (error) {
    console.error("AI Error (Coach):", error);
    res.status(500).json({ error: "Failed to generate coach reply" });
  }
});

// Conditional local listener and dev-Vite setup
async function setupLocalServer() {
  if (!process.env.VERCEL) {
    const PORT = parseInt(process.env.PORT || "3000", 10);

    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Development server running on http://localhost:${PORT}`);
      });
    } else {
      // Production fallback for local standard express runs
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });

      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Production server running on http://localhost:${PORT}`);
      });
    }
  }
}

setupLocalServer();

export default app;
