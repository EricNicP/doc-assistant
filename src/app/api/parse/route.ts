import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided in the request." },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    let extractedText = "";
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
      const pdf = await extractText(new Uint8Array(fileBuffer));
      // unpdf returns an array of strings (one per page) or a joined string
      extractedText = Array.isArray(pdf.text) ? pdf.text.join("\n\n") : (pdf.text || "");
    } else if (
      fileName.endsWith(".txt") ||
      fileName.endsWith(".md") ||
      file.type.startsWith("text/")
    ) {
      extractedText = Buffer.from(fileBuffer).toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a .pdf, .txt, or .md file." },
        { status: 400 }
      );
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: "The document appears to be empty or unscannable." },
        { status: 422 }
      );
    }

    // Split extracted text into logical paragraph chunks for search
    const paragraphs = extractedText
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\s+/g, " ").trim())
      .filter((p) => p.length > 30);

    return NextResponse.json({
      success: true,
      fileName: file.name,
      totalCharacters: extractedText.length,
      paragraphsCount: paragraphs.length,
      fullText: extractedText,
      paragraphs: paragraphs.length > 0 ? paragraphs : [extractedText.trim()],
    });
  } catch (error: any) {
    console.error("Error parsing document:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse document." },
      { status: 500 }
    );
  }
}