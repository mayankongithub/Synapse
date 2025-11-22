import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default async (req, context) => {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Health check
  if (pathname === "/.netlify/functions/api/health") {
    return new Response(
      JSON.stringify({
        status: "ok",
        message: "Synapse Backend is running",
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // Chat endpoint
  if (pathname === "/.netlify/functions/api/chat" && req.method === "POST") {
    try {
      const body = await req.json();
      const { message, fileContext } = body;

      const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = fileContext
        ? `File Context:\n${fileContext}\n\nUser: ${message}`
        : message;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return new Response(
        JSON.stringify({
          success: true,
          response: text,
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // Convert code endpoint
  if (
    pathname === "/.netlify/functions/api/convert" &&
    req.method === "POST"
  ) {
    try {
      const body = await req.json();
      const { code, fromLanguage, toLanguage } = body;

      const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Convert this ${fromLanguage} code to ${toLanguage}:\n\n${code}\n\nProvide only the converted code without explanations.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const convertedCode = response.text();

      return new Response(
        JSON.stringify({
          success: true,
          convertedCode: convertedCode,
          fromLanguage,
          toLanguage,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return new Response(
    JSON.stringify({
      error: "Not found",
      path: pathname,
    }),
    { status: 404, headers: { "Content-Type": "application/json" } }
  );
};

