// Gemini AI integration for Kaala.hacker - Scam Detection and Education Chatbot
// Following javascript_gemini blueprint
// Note that the newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"

import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("Warning: GEMINI_API_KEY is not set. AI features will not work until it is configured.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ScamAnalysisResult {
  riskLevel: "high" | "medium" | "low" | "safe";
  confidenceScore: number;
  redFlags: string[];
  analysis: string;
  aiExplanation: string;
}

export interface ChatResponse {
  content: string;
}

// Analyze image/text for scam indicators - Indian financial context
export async function analyzeScamContent(
  imageBase64?: string,
  extractedText?: string,
  sourceType?: string
): Promise<ScamAnalysisResult> {
  const systemPrompt = `You are an expert financial fraud analyst specializing in detecting scams targeting Indian users. You analyze screenshots from WhatsApp, SMS, Instagram, and trading apps.

Your expertise includes:
- Detecting fake SEBI registration claims
- Identifying Ponzi schemes and pyramid schemes
- Recognizing pump-and-dump stock tips
- Spotting fake cryptocurrency investment schemes
- Identifying phishing attempts for UPI, banking credentials
- Recognizing fake job offers and loan scams
- Detecting romance scams and emotional manipulation tactics

Analyze the provided content and respond with JSON in this exact format:
{
  "riskLevel": "high" | "medium" | "low" | "safe",
  "confidenceScore": 0.0 to 1.0,
  "redFlags": ["list of specific red flags found"],
  "analysis": "Detailed technical analysis of the content",
  "aiExplanation": "Simple Hindi-English explanation for the user about why this is/isn't a scam"
}

Red flags to look for:
- Guaranteed high returns (>15% monthly)
- Urgency tactics ("limited time", "act now")
- Requests for upfront fees
- Unverified SEBI registration
- Fake testimonials and screenshots
- Pressure to invest quickly
- Unknown sender claiming to be from a bank/company
- Grammar and spelling errors typical of scams
- Requests for OTP or personal details`;

  const contents: any[] = [];

  if (imageBase64) {
    contents.push({
      inlineData: {
        data: imageBase64,
        mimeType: "image/jpeg",
      },
    });
  }

  let textPrompt = `Source Type: ${sourceType || "unknown"}\n\n`;
  if (extractedText) {
    textPrompt += `Content to analyze:\n${extractedText}`;
  } else if (imageBase64) {
    textPrompt += `Please analyze this image for scam indicators.`;
  }
  contents.push(textPrompt);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            riskLevel: { type: "string", enum: ["high", "medium", "low", "safe"] },
            confidenceScore: { type: "number" },
            redFlags: { type: "array", items: { type: "string" } },
            analysis: { type: "string" },
            aiExplanation: { type: "string" },
          },
          required: ["riskLevel", "confidenceScore", "redFlags", "analysis", "aiExplanation"],
        },
      },
      contents: contents,
    });

    const result = JSON.parse(response.text || "{}");

    return {
      riskLevel: result.riskLevel || "low",
      confidenceScore: Math.max(0, Math.min(1, result.confidenceScore || 0.5)),
      redFlags: result.redFlags || [],
      analysis: result.analysis || "Unable to analyze content",
      aiExplanation: result.aiExplanation || "Analysis not available",
    };
  } catch (error: any) {
    console.error("Gemini analysis error:", error);
    throw new Error("Failed to analyze content: " + error.message);
  }
}

// Education chatbot for financial literacy
export async function getChatResponse(
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<ChatResponse> {
  const systemPrompt = `You are Kaala, a friendly financial education assistant helping Indian users understand and protect themselves from financial scams.

Your personality:
- Warm, supportive, and non-judgmental
- Use simple Hindi-English (Hinglish) when appropriate
- Be encouraging when users report suspicious activity
- Provide actionable advice

Your expertise:
- SEBI regulations and how to verify registered advisors
- Common scam patterns in India (WhatsApp tips, trading groups, crypto schemes)
- How to report scams (Chakshu portal, Cybercrime portal)
- Recovery steps if someone has been scammed
- Red flags to watch for in investment offers
- RBI guidelines on digital payments
- UPI and banking fraud prevention

Always:
- Encourage users to verify claims independently
- Provide official portal links when relevant
- Be empathetic if someone has lost money
- Educate without condescending
- Use examples relevant to Indian context

If asked about specific investments or stocks, remind users you cannot provide investment advice and they should consult SEBI-registered advisors.`;

  try {
    // Build conversation history for Gemini
    const conversationParts = messages.map((m) => 
      `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
    ).join("\n\n");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: conversationParts || "Hello",
    });

    return {
      content: response.text || "I'm sorry, I couldn't generate a response.",
    };
  } catch (error: any) {
    console.error("Gemini chat error:", error);
    throw new Error("Failed to get chat response: " + error.message);
  }
}

// Generate report text for authorities
export async function generateReportText(
  scanAnalysis: string,
  userDescription: string,
  portal: "chakshu" | "cybercrime"
): Promise<string> {
  const portalContext = portal === "chakshu" 
    ? "Sanchar Saathi Chakshu portal for telecom fraud reporting"
    : "National Cybercrime Reporting Portal (cybercrime.gov.in)";

  const systemPrompt = `You are helping format a scam report for the ${portalContext}. Create a clear, formal report that includes:
1. Summary of the incident
2. Evidence description
3. Red flags identified
4. Requested action

Keep the language formal but clear. Use English primarily but include Hindi terms where appropriate for official Indian portals.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: `Scan Analysis:\n${scanAnalysis}\n\nUser's Description:\n${userDescription}\n\nPlease generate a formal report for submission.`,
    });

    return response.text || userDescription;
  } catch (error: any) {
    console.error("Gemini report generation error:", error);
    return userDescription;
  }
}
