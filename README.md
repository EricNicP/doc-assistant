# 📄 DocSearch & Grounded Q&A Assistant

A lightweight, zero-vector-database document intelligence web application. Upload any PDF or text document to perform instant in-memory semantic search and ask grounded, hallucination-free questions.

---

## ✨ Features

- **Multi-Format Parsing:** Native document parsing for `.pdf`, `.txt`, and `.md` using `unpdf`.
- **In-Memory Semantic Search:** Computes TF-IDF vector representations and Cosine Similarity scores dynamically in memory with zero external database dependencies.
- **Zero-Hallucination Grounded Q&A:** Uses Google Gemini (`gemini-3.6-flash`) with strict prompt-grounding instructions to ensure answers rely only on document facts.
- **Modern Full-Stack Architecture:** Built on Next.js App Router, Tailwind CSS, Lucide Icons, and TypeScript.

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

### 1. Clone the Repository
```bash
git clone [https://github.com/EricNicP/doc-assistant.git](https://github.com/EricNicP/doc-assistant.git)
cd doc-assistant
