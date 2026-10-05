import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { CATEGORIES } from "@/lib/data";

const MAX_PROMPT_LENGTH = 1000;

export async function POST(req) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured in the server environment.");
      return NextResponse.json(
        { error: "AI service configuration error. Please try again later." },
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

    const rawPrompt = typeof body?.prompt === "string" ? body.prompt : "";
    const prompt = rawPrompt.trim();

    if (!prompt) {
      return NextResponse.json(
        { error: "Please describe your event" },
        { status: 400 },
      );
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        { error: "Please keep your event description within the allowed length." },
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

    const validCategoryIds = CATEGORIES.map((c) => c.id).join(", ");

    const systemPrompt = `You are an event planning assistant for the Spott event platform. Generate realistic and professional event details based on the user's description.

Return a JSON object with this exact structure:
{
  "title": "Event title (catchy and professional, 5-80 characters, single line)",
  "description": "Detailed event description in a single paragraph (informative, 2-3 sentences, 20-500 characters).",
  "category": "One of: ${validCategoryIds}",
  "suggestedCapacity": 50,
  "suggestedTicketType": "free"
}

User's event idea: ${prompt}

Rules:
- Return ONLY the JSON object, never return Markdown or commentary
- "title" must be catchy, professional, and between 5 and 80 characters
- "description" must be an informative single paragraph between 20 and 500 characters
- "category" MUST strictly be one of: ${validCategoryIds}
- "suggestedCapacity" must be a reasonable positive integer between 10 and 10000
- "suggestedTicketType" must be either "free" or "paid"
`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "The AI service returned an empty response. Please try again." },
        { status: 502 },
      );
    }

    // Clean the response (strip markdown code blocks if present as a fallback)
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
    } catch {
      console.error("Failed to parse Gemini JSON output:", cleanedText);
      return NextResponse.json(
        { error: "AI generated an invalid event response. Please try again." },
        { status: 502 },
      );
    }

    if (!eventData || typeof eventData !== "object") {
      return NextResponse.json(
        { error: "AI generated an invalid event response. Please try again." },
        { status: 502 },
      );
    }

    // 1. Validate Title
    const title = typeof eventData.title === "string" ? eventData.title.trim() : "";
    if (title.length < 5 || title.length > 100) {
      console.error("AI response validation failed on title:", eventData.title);
      return NextResponse.json(
        { error: "AI generated an invalid event response. Please try again." },
        { status: 502 },
      );
    }

    // 2. Validate Description
    const description = typeof eventData.description === "string" ? eventData.description.trim() : "";
    if (description.length < 20 || description.length > 1000) {
      console.error("AI response validation failed on description:", eventData.description);
      return NextResponse.json(
        { error: "AI generated an invalid event response. Please try again." },
        { status: 502 },
      );
    }

    // 3. Validate Category against application definitions
    const rawCategory = typeof eventData.category === "string" ? eventData.category.trim().toLowerCase() : "";
    const matchedCategory = CATEGORIES.find(
      (c) => c.id === rawCategory || c.label.toLowerCase() === rawCategory,
    );
    if (!matchedCategory) {
      console.error("AI response validation failed on category:", eventData.category);
      return NextResponse.json(
        { error: "AI generated an invalid event response. Please try again." },
        { status: 502 },
      );
    }

    // 4. Validate Capacity (positive integer)
    const rawCapacity = eventData.suggestedCapacity ?? eventData.capacity;
    const capacityNum = Number(rawCapacity);
    if (
      !Number.isFinite(capacityNum) ||
      !Number.isInteger(capacityNum) ||
      capacityNum < 1 ||
      capacityNum > 100000
    ) {
      console.error("AI response validation failed on capacity:", rawCapacity);
      return NextResponse.json(
        { error: "AI generated an invalid event response. Please try again." },
        { status: 502 },
      );
    }

    // 5. Validate Ticket Type ('free' or 'paid')
    const rawTicketType = typeof (eventData.suggestedTicketType || eventData.ticketType) === "string"
      ? (eventData.suggestedTicketType || eventData.ticketType).trim().toLowerCase()
      : "";
    if (rawTicketType !== "free" && rawTicketType !== "paid") {
      console.error("AI response validation failed on ticketType:", eventData.suggestedTicketType);
      return NextResponse.json(
        { error: "AI generated an invalid event response. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      title,
      description,
      category: matchedCategory.id,
      suggestedCapacity: capacityNum,
      suggestedTicketType: rawTicketType,
    });
  } catch (error) {
    const errorMsg = String(error?.message || "");
    const errorStatus = error?.status;

    // Check for high demand / temporary unavailability (503)
    if (
      errorStatus === 503 ||
      errorMsg.includes("503") ||
      errorMsg.includes("Service Unavailable") ||
      errorMsg.includes("high demand") ||
      errorMsg.includes("UNAVAILABLE")
    ) {
      console.warn("Gemini service temporarily unavailable (503).");
      return NextResponse.json(
        { error: "AI service is temporarily unavailable. Please try again in a moment." },
        { status: 503 },
      );
    }

    // Check for rate limit / quota exceeded (429)
    if (
      errorStatus === 429 ||
      errorMsg.includes("429") ||
      errorMsg.includes("quota") ||
      errorMsg.includes("Too Many Requests") ||
      errorMsg.includes("RESOURCE_EXHAUSTED")
    ) {
      console.warn("Gemini rate limit or quota exceeded (429).");
      return NextResponse.json(
        { error: "AI generation is temporarily unavailable. Please try again later." },
        { status: 429 },
      );
    }

    // Check for timeout or network abort
    if (
      error?.name === "AbortError" ||
      errorMsg.includes("timeout") ||
      errorMsg.includes("ETIMEDOUT") ||
      errorMsg.includes("ECONNRESET")
    ) {
      console.warn("Gemini request timed out or connection reset.");
      return NextResponse.json(
        { error: "AI service request timed out. Please try again." },
        { status: 504 },
      );
    }

    console.error("Gemini generation error:", errorMsg);
    return NextResponse.json(
      { error: "Failed to generate event. Please try again." },
      { status: 500 },
    );
  }
}
