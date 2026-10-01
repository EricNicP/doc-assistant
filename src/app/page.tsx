"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Search,
  MessageSquare,
  Send,
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

interface SearchResult {
  text: string;
  score: number;
  index: number;
}

interface ChatMessage {
  sender: "user" | "assistant";
  text: string;
}

export default function Home() {
  // Document state
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [docData, setDocData] = useState<{
    fileName: string;
    totalCharacters: number;
    paragraphsCount: number;
    fullText: string;
    paragraphs: string[];
  } | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Chat state
  const [chatQuestion, setChatQuestion] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // UI status / alerts
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Handle Document Upload & Parsing
  const handleFileUpload = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsUploading(true);
    setErrorMessage(null);
    setSearchResults([]);
    setChatHistory([]);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse file.");
      }

      setDocData(data);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred during file upload.");
      setDocData(null);
    } finally {
      setIsUploading(false);
    }
  };

  // 2. Handle Semantic Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !docData) return;

    setIsSearching(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          paragraphs: docData.paragraphs,
          topK: 4,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to execute search.");
      }

      setSearchResults(data.results);
    } catch (err: any) {
      setErrorMessage(err.message || "Search failed.");
    } finally {
      setIsSearching(false);
    }
  };

  // 3. Handle Grounded Document Q&A
  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuestion.trim() || !docData || isChatting) return;

    const userQ = chatQuestion.trim();
    setChatQuestion("");
    setChatHistory((prev) => [...prev, { sender: "user", text: userQ }]);
    setIsChatting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userQ,
          context: docData.fullText,
          history: chatHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate answer.");
      }

      setChatHistory((prev) => [
        ...prev,
        { sender: "assistant", text: data.answer },
      ]);
    } catch (err: any) {
      setErrorMessage(err.message || "Chat failed.");
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "⚠️ Failed to get an answer. Please check your API key and server logs.",
        },
      ]);
    } finally {
      setIsChatting(false);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleReset = () => {
    setFile(null);
    setDocData(null);
    setSearchResults([]);
    setChatHistory([]);
    setSearchQuery("");
    setChatQuestion("");
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              <h1 className="text-2xl font-bold tracking-tight text-white">
                DocSearch & Grounded Q&A
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              In-memory semantic vector search and prompt-grounded QA without external vector databases.
            </p>
          </div>

          {docData && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg transition border border-slate-700 self-start md:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Upload New Document
            </button>
          )}
        </header>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="bg-red-950/70 border border-red-800 text-red-300 text-sm p-3.5 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SECTION 1: Document Upload */}
        {!docData ? (
          <section className="bg-slate-900/60 border border-dashed border-slate-700 hover:border-indigo-500/70 transition rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.txt,.md"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
              }}
            />

            <div className="w-16 h-16 rounded-full bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-400 mb-4 shadow-lg shadow-indigo-950/50">
              {isUploading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <h3 className="text-lg font-semibold text-slate-200">
              {isUploading ? "Extracting & Preparing Document..." : "Upload your Document"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Supports PDF, TXT, or Markdown files. Text will be parsed and loaded into local session memory.
            </p>

            <button
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm px-6 py-2.5 rounded-xl transition shadow-md shadow-indigo-900/20"
            >
              {isUploading ? "Processing..." : "Select File"}
            </button>
          </section>
        ) : (
          /* SECTION 2: Document Loaded - Active Workspace */
          <div className="space-y-6">
            {/* Document Info Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-950 border border-indigo-800/60 rounded-lg text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-200">{docData.fileName}</h4>
                  <p className="text-xs text-slate-400">
                    {docData.paragraphsCount} paragraphs • {(docData.totalCharacters / 1000).toFixed(1)}k characters
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Memory Indexed
              </div>
            </div>

            {/* Split Grid: Semantic Search (Left) & Grounded Q&A (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* LEFT COLUMN: Semantic Vector Search */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col h-[620px]">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                    Semantic Vector Search
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Computes embeddings for your query and matches document snippets via cosine similarity.
                </p>

                <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search concepts, topics, or keywords..."
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
                  />
                  <button
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
                  >
                    {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    Rank
                  </button>
                </form>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {searchResults.length === 0 && !isSearching && (
                    <div className="h-full flex items-center justify-center text-center text-xs text-slate-500 p-6">
                      Enter a search term above to compute semantic relevance across paragraphs.
                    </div>
                  )}

                  {searchResults.map((result, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          Paragraph #{result.index + 1}
                        </span>
                        <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                          Score: {(result.score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
                        {result.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN: Grounded Q&A Assistant */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col h-[620px]">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                    Grounded Document Q&A
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Asks questions strictly against full document context via Gemini (Zero Hallucination mode).
                </p>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 mb-4">
                  {chatHistory.length === 0 && (
                    <div className="h-full flex items-center justify-center text-center text-xs text-slate-500 p-6">
                      Ask anything about the document. Answers are strictly grounded in its contents.
                    </div>
                  )}

                  {chatHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col ${
                        msg.sender === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <span className="text-[10px] text-slate-500 mb-1 px-1">
                        {msg.sender === "user" ? "You" : "Assistant"}
                      </span>
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-indigo-600 text-white rounded-br-none"
                            : "bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {isChatting && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      <span>Analyzing document context...</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <form onSubmit={handleAskQuestion} className="flex gap-2">
                  <input
                    type="text"
                    value={chatQuestion}
                    onChange={(e) => setChatQuestion(e.target.value)}
                    placeholder="Ask a question about this document..."
                    disabled={isChatting}
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isChatting || !chatQuestion.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Ask
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}
      </div>
    </main>
  );
}