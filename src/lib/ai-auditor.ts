'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKeys = [
  process.env.GEMINI_KEY_1,
  process.env.GEMINI_KEY_2,
  process.env.GEMINI_KEY_3,
  process.env.GEMINI_KEY_4,
  process.env.GEMINI_KEY_5,
].filter(Boolean) as string[];

let currentKeyIndex = 0;

function getNextKey() {
  if (apiKeys.length === 0) {
    throw new Error("No API keys found in the environment.");
  }
  const key = apiKeys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  return key;
}

export async function auditContract(base64Data: string, fileType: string) {
  try {
    const activeKey = getNextKey();
    const genAI = new GoogleGenerativeAI(activeKey);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
      You are a senior Indian Legal Expert. Analyze this employment document.
      1. Extract all text clearly.
      2. Identify 'Red Flags' (Illegal bonds, unfair notice periods, or predatory clauses).
      3. Cite the relevant section of the Indian Contract Act 1872 if a clause is unfair.
      4. Provide a 'Trust Score' from 0-100.
      Return the response in a clear, structured format.
    `;

    // Final security check to ensure no headers disrupt the API
    const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: cleanBase64,
          mimeType: fileType,
        },
      },
    ]);

    return result.response.text();
  } catch (error) {
    console.error("AI Audit Server Error:", error);
    return "The AI analysis encountered a system error. Please ensure the document is clear and try again.";
  }
}