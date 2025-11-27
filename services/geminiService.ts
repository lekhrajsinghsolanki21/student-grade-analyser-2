import { GoogleGenAI } from "@google/genai";
import { AnalysisData } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateClassReport = async (data: AnalysisData): Promise<string> => {
  const ai = createClient();
  if (!ai) return "API Key is missing. Please check your configuration.";

  // Simplify data for the prompt to save tokens and focus on trends
  const summaryContext = {
    classAverage: data.classAverage.toFixed(2),
    passPercentage: data.passPercentage.toFixed(2) + '%',
    // Fix: Use 'percentage' instead of 'average' as per StudentResult type definition
    topStudents: data.topPerformers.map(s => `${s.student.name} (${s.percentage.toFixed(1)}%)`).join(', '),
    subjectPerformance: data.subjectStats.map(s => `${s.subject}: Avg ${s.average.toFixed(1)}`).join(', '),
  };

  const prompt = `
    You are an expert academic analyst. Analyze the following student grade data for a class.
    
    Data Summary:
    ${JSON.stringify(summaryContext, null, 2)}
    
    Please provide a concise but insightful report including:
    1. Overall Class Performance Summary.
    2. Identification of the strongest and weakest subjects based on averages.
    3. Recommendations for the teacher on where to focus remedial attention.
    4. A brief encouraging remark for the class.
    
    Keep the tone professional yet encouraging. Format with Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while generating the report. Please try again.";
  }
};