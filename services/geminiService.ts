import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type ExplanationLevel = 'beginner' | 'intermediate' | 'advanced';

export async function explainLesson(
  subject: string,
  topic: string,
  level: ExplanationLevel,
  context?: string
) {
  const systemInstruction = `You are an expert tutor on the topic of ${subject}. 
Your goal is to explain educational concepts to students at a ${level} level. 
${level === 'beginner' ? 'Use simple language, analogies, and focus on foundational concepts. Avoid jargon.' : ''}
${level === 'intermediate' ? 'Use clear language, explain key terms, and provide some practical examples or extensions of the base concept.' : ''}
${level === 'advanced' ? 'Use technical language, assume high familiarity with the subject, and explore complex implications or high-level theory.' : ''}
Always be encouraging, academic yet approachable, and use formatting like bolding and bullet points to make the explanation readable.`;

  const prompt = `Explain this topic to me: ${topic}. 
${context ? `Extra context provided: ${context}` : ''}
Keep the explanation focused and educational.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to get explanation from AI.");
  }
}

export async function chatWithTutor(
  messages: { role: 'user' | 'model'; parts: { text: string }[] }[],
  level: ExplanationLevel,
  subject?: string
) {
  const systemInstruction = `You are a helpful AI Tutor${subject ? ` for ${subject}` : ''}. 
You are currently helping a student who needs explanations. 
While the student has selected a "${level}" level, you should also actively infer their actual understanding from their questions and responses.
If they seem confused, simplify further. If they seem to grasp the concepts quickly, challenge them with deeper questions.
Encourage the student to ask follow-up questions and be very supportive.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: messages,
      config: {
        systemInstruction,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to get response from AI.");
  }
}
