'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "./supabase";

const apiKey = process.env.GEMINI_KEY_1 || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateHiringFunnel(jobTitle: string, jobDescription: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an Autonomous AI Hiring Orchestrator. 
      Analyze the following Job Title and Description. 
      Design a multi-stage hiring funnel appropriate for this role's complexity.
      
      Job Title: ${jobTitle}
      Job Description: ${jobDescription}

      Return strictly a JSON array of objects representing the stages. Do not use markdown blocks.
      Structure:
      [
        {
          "stage_order": 1,
          "stage_name": "Initial Screening",
          "evaluation_type": "MCQ",
          "difficulty": "Medium"
        }
      ]
      Ensure the final stage is always "Legal & Contract Audit" with evaluation_type "Legal Audit".
    `;

    const result = await model.generateContent(prompt);
    
    let textResult = result.response.text().trim();
    if (textResult.startsWith('\`\`\`json')) {
      textResult = textResult.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (textResult.startsWith('\`\`\`')) {
      textResult = textResult.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }

    const stages = JSON.parse(textResult);

    // Save Job to Supabase
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .insert([{ title: jobTitle, description: jobDescription }])
      .select()
      .single();

    if (jobError) throw new Error("Failed to save job");

    // Save Stages to Supabase
    const stagesWithJobId = stages.map((stage: any) => ({
      ...stage,
      job_id: jobData.id
    }));

    const { error: stageError } = await supabase
      .from('funnel_stages')
      .insert(stagesWithJobId);

    if (stageError) throw new Error("Failed to save stages");

    return { success: true, jobId: jobData.id, stages: stagesWithJobId };

  } catch (error) {
    console.error("Funnel Generation Error:", error);
    throw new Error("Failed to orchestrate hiring funnel.");
  }
}