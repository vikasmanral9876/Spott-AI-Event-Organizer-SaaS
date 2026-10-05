import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured in the server environment.");
      return NextResponse.json(
        { error: "Server configuration error: Gemini API key is missing." },
        { status: 500 },
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const systemPrompt = `You are an event planning assistant. Generate event details based on the user's description.

Return a JSON object with this exact structure:
{
  "title": "Event title (catchy and professional, single line)",
  "description": "Detailed event description in a single paragraph (2-3 sentences).",
  "category": "One of: tech, music, sports, art, food, business, health, education, gaming, networking, outdoor, community",
  "suggestedCapacity": 50,
  "suggestedTicketType": "free"
}

User's event idea: ${prompt}

Rules:
- Return ONLY the JSON object
- "category" MUST be one of: "tech", "music", "sports", "art", "food", "business", "health", "education", "gaming", "networking", "outdoor", "community"
- "suggestedCapacity" must be a positive integer
- "suggestedTicketType" must be either "free" or "paid"
- "title" must be catchy and under 80 characters
- "description" should be 2-3 sentences, single paragraph
`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      return NextResponse.json(
        { error: "Received an empty response from AI model" },
        { status: 502 },
      );
    }

    // Clean the response (strip markdown code blocks if present)
    let cleanedText = text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText
        .replace(/^```json\s*/i, "")
        .replace(/\s*```$/, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "");
    }

    let eventData;
    try {
      eventData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON output:", cleanedText, parseError);
      return NextResponse.json(
        { error: "Failed to parse AI-generated event details" },
        { status: 500 },
      );
    }

    return NextResponse.json(eventData);
  } catch (error) {
    console.error("Error generating event:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to generate event. " + (error?.message || "Please try again later.") },
      { status: 500 },
    );
  }
}
