# 📄 DocSearch & Grounded Q&A Assistant

A lightweight, zero-vector-database document intelligence web application. Upload any PDF or text document to perform instant in-memory semantic search and ask grounded, hallucination-free questions.

---

## ✨ Features

- **Multi-Format Parsing**: Native document parsing for `.pdf`, `.txt`, and `.md` using `unpdf`.
- **In-Memory Semantic Search**: Computes TF-IDF vector representations and Cosine Similarity scores dynamically in memory with zero external database dependencies.
- **Zero-Hallucination Grounded Q&A**: Uses Google Gemini (`gemini-flash-lite-latest`, `gemini-3.5-flash`, etc. with multi-model failover) with strict prompt-grounding instructions to ensure answers rely only on document facts.
- **Modern Full-Stack Architecture**: Built on Next.js App Router, Tailwind CSS, Lucide Icons, and TypeScript.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js (App Router)](https://nextjs.org/) |
| **Frontend & UI** | React 19, Tailwind CSS, Lucide React |
| **LLM Inference** | Google Gemini API (`@google/genai`) |
| **Document Extraction** | `unpdf` |
| **Hosting & CI/CD** | [Vercel](https://vercel.com/) |

---

## 🚀 Getting Started

Follow these step-by-step instructions to get the project up and running locally.

### 1. Prerequisites

- **Node.js**: Version 18+ or 20+ installed ([Download Node.js](https://nodejs.org/))
- **Gemini API Key**: Obtain a free key from [Google AI Studio](https://aistudio.google.com/)

---

### 2. Clone the Repository

```bash
git clone https://github.com/EricNicP/doc-assistant.git
cd doc-assistant
```

---

### 3. Install Dependencies

Install all required npm packages:

```bash
npm install
```

---

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# On Linux/macOS
cp .env.example .env.local

# On Windows (PowerShell)
Copy-Item .env.example .env.local
```

Add your Gemini API key to `.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

### 5. Run the Development Server

Start the local Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser to view the application.

---

### 6. Build for Production (Optional)

To create an optimized production build and run it locally:

```bash
npm run build
npm start
```

---

## 📂 Project Structure

```
doc-assistant/
├── public/                 # Static assets & icons
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/       # Grounded Q&A route using Gemini
│   │   │   ├── parse/      # Document parsing (.pdf, .txt, .md)
│   │   │   └── search/     # In-memory TF-IDF semantic vector search
│   │   ├── globals.css     # Global styles & Tailwind directives
│   │   ├── layout.tsx      # App layout wrapper
│   │   └── page.tsx        # Main UI interface
│   └── lib/
│       └── ai.ts           # Gemini client & TF-IDF vector math helpers
├── .env.local              # Local environment variables (ignored by Git)
├── package.json            # Project dependencies & scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

---

## 🧪 Usage Guide

1. **Upload Document**: Drag & drop or browse a `.pdf`, `.txt`, or `.md` file in the top upload area.
2. **Semantic Search**: Enter terms in the **Semantic Vector Search** panel to find top matching chunks ranked by cosine similarity.
3. **Grounded Q&A**: Ask any question in the **Grounded Document Q&A** panel. Answers are strictly synthesized from the uploaded document text.

---

## 🛡️ License

This project is open source and available under the [MIT License](LICENSE).
