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
      Do not include the raw extracted text. Do not use markdown symbols like asterisks or dashes.
      Return strictly a JSON object with this exact structure (do not wrap in markdown blocks):
      {
        "summary": "A clear, professional 2-3 sentence summary of the document's purpose.",
        "trustScore": 85,
        "clauses": [
          {
            "title": "Name of the clause (e.g., Non-Compete)",
            "description": "Plain English explanation of what this means for the candidate.",
            "riskLevel": "High", 
            "legalReference": "Relevant section of Indian law if applicable, or null"
          }
        ]
      }
      Risk level must be exactly one of: "High", "Medium", or "Low".
    `;

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

    // Strip any potential markdown wrappers the AI might accidentally add
    let textResult = result.response.text().trim();
    if (textResult.startsWith('\`\`\`json')) {
      textResult = textResult.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (textResult.startsWith('\`\`\`')) {
      textResult = textResult.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }

    return textResult;
  } catch (error) {
    console.error("AI Audit Server Error:", error);
    throw new Error("Analysis failed.");
  }
}