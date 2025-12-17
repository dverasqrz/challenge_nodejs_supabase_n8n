# AI Automation Developer Challenge
## To-Do List App + AI Chatbot (Next.js, Supabase, n8n, Chatwoot)

This project was developed as part of the **AI Automation Developer Challenge**.
It demonstrates the ability to design and implement AI-powered automations that
connect frontend applications, databases, and workflow automation tools.

---

## 🚀 Overview

The solution is composed of:

- **Frontend**: Next.js (App Router) + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Automation**: n8n
- **AI**: Ollama (local LLM)
- **Messaging**: Chatwoot (WhatsApp via Evolution API)

The same automation logic can be triggered from:
- A web-based chatbot
- WhatsApp messages via Chatwoot

---

## 🧩 Part 1 — To-Do List App

### Features
- Create, edit, complete, and delete tasks
- Tasks persist in Supabase (no localStorage)
- Simple user identifier (email or name)
- Clean, minimal UI

### Technology
- Next.js 14 (App Router)
- Supabase JavaScript client
- Tailwind CSS

---

## 🤖 Part 2 — Chatbot Enhancement

### How it works
1. User sends a message containing `#to-do list`
2. Message is sent to an n8n webhook
3. n8n:
   - Extracts the raw task
   - Uses an AI model (Ollama) to improve the task title
   - Generates steps and confidence
4. Task is created in Supabase
5. A confirmation message is returned to the user

### Message Filtering
- Only messages containing `#to-do list` are processed
- All other messages receive an instructional response

---

## 💬 WhatsApp Integration (Bonus)

The same automation is triggered from WhatsApp using:
- Chatwoot (message ingestion)
- Evolution API (WhatsApp provider)

This demonstrates how the automation can scale across channels without duplicating logic.

---

## 🔐 Security & Credentials

- All credentials (Supabase, Ollama, API keys) are stored securely
- No secrets are committed to the repository
- Exported n8n workflows do **not** include credentials

---

## ⚠️ n8n Access Note

Due to **n8n free plan limitations**, project-level sharing is not available.

To address this limitation:
- The full workflow logic is demonstrated in the Loom video

---

## 📂 Repository Structure

/app → Next.js application
/components → UI components
/hooks → Custom React hooks
/lib → Supabase client configuration

---

## 🛠 Running Locally

```bash
npm install
npm run dev

Create a .env.local file with:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

🎥 Demo

A Loom video is provided demonstrating:

Application functionality

n8n workflow architecture

AI prompt logic

WhatsApp and web integrations

✅ Status

✔ Part 1 complete
✔ Part 2 complete
✔ Bonus (WhatsApp integration) implemented
