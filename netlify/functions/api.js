import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async (req, context) => {
  const url = new URL(req.url);
  let pathname = url.pathname;

  console.log("Received request:", { pathname, method: req.method, url: req.url });

  // Remove the function prefix if present
  if (pathname.startsWith("/.netlify/functions/api")) {
    pathname = pathname.replace("/.netlify/functions/api", "");
  }

  // Also handle /api prefix
  if (pathname.startsWith("/api")) {
    pathname = pathname.replace("/api", "");
  }

  // Normalize empty path
  if (!pathname || pathname === "") {
    pathname = "/health";
  }

  // Health check
  if (pathname === "/health" || pathname === "") {
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
  if (pathname === "/chat" && req.method === "POST") {
    try {
      const body = await req.json();
      const { message, fileContext } = body;

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = fileContext
        ? `File Context:\n${fileContext}\n\nUser: ${message}`
        : message;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

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
  if (pathname === "/convert" && req.method === "POST") {
    try {
      const body = await req.json();
      const { code, fromLanguage, toLanguage } = body;

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Convert this ${fromLanguage} code to ${toLanguage}:\n\n${code}\n\nProvide only the converted code without explanations.`;

      const result = await model.generateContent(prompt);
      const convertedCode = result.response.text();

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

  // Get file content endpoint
  if (pathname === "/files" && req.method === "GET") {
    try {
      const url = new URL(req.url);
      const filePath = url.searchParams.get("path") || "public/index.js";

      // Security: prevent directory traversal
      if (filePath.includes("..")) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid file path" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const fullPath = path.join(process.cwd(), filePath);

      if (!fs.existsSync(fullPath)) {
        return new Response(
          JSON.stringify({ success: false, error: "File not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      const content = fs.readFileSync(fullPath, "utf-8");

      return new Response(
        JSON.stringify({
          success: true,
          content: content,
          fileName: path.basename(filePath),
          filePath: filePath,
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

  // List files endpoint
  if (pathname === "/files-list" && req.method === "GET") {
    try {
      const url = new URL(req.url);
      const directory = url.searchParams.get("dir") || "public";

      const fullPath = path.join(process.cwd(), directory);

      if (!fs.existsSync(fullPath)) {
        return new Response(
          JSON.stringify({ success: false, error: "Directory not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      const files = fs.readdirSync(fullPath).map(file => ({
        name: file,
        path: path.join(directory, file),
        isDirectory: fs.statSync(path.join(fullPath, file)).isDirectory(),
      }));

      return new Response(
        JSON.stringify({
          success: true,
          files: files,
          directory: directory,
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

  // Handle file requests - /files or /files/filename
  if (pathname.startsWith("/files")) {
    if (req.method === "GET") {
      try {
        // Extract filename from path or query parameter
        let fileName = pathname.replace("/files/", "").split("?")[0];

        if (!fileName) {
          fileName = url.searchParams.get("path") || "public/index.js";
        }

        // Security: prevent directory traversal
        if (fileName.includes("..")) {
          return new Response(
            JSON.stringify({ success: false, error: "Invalid file path" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        // Try to read from public folder first
        let fullPath = path.join(process.cwd(), "public", fileName);

        if (!fs.existsSync(fullPath)) {
          // Try without public prefix
          fullPath = path.join(process.cwd(), fileName);
        }

        if (!fs.existsSync(fullPath)) {
          return new Response(
            JSON.stringify({ success: false, error: "File not found", path: fullPath }),
            { status: 404, headers: { "Content-Type": "application/json" } }
          );
        }

        const content = fs.readFileSync(fullPath, "utf-8");

        return new Response(
          JSON.stringify({
            success: true,
            content: content,
            fileName: path.basename(fullPath),
            filePath: fileName,
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
  }

  return new Response(
    JSON.stringify({
      error: "Not found",
      path: pathname,
    }),
    { status: 404, headers: { "Content-Type": "application/json" } }
  );
};

