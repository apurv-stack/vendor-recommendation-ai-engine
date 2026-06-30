# 🤖 Vendor Recommendation AI Platform

This repository contains the source code for a Vendor Recommendation AI Platform designed to automate vendor discovery and evaluation through a natural language query interface. The system employs a React frontend, a FastAPI backend service, a PostgreSQL relational database, and a LangGraph-powered orchestration framework hosting Ollama (Qwen 2.5) for query analysis and response generation. When a user submits an inquiry, the backend extracts search criteria, retrieves relevant database records, applies a multi-criteria ranking algorithm, and utilizes the local language model to synthesize natural language explanations for each recommended vendor. The architecture integrates session memory, persistent user preference profiles, automated background catalog synchronization tasks, and role-based access control to deliver secure, context-aware procurement recommendations within a modular and extensible codebase.

---

## 🛡️ Badges

[![Python](https://img.shields.io/badge/Python-blue?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-orange?style=flat-square&logo=langchain&logoColor=white)](https://github.com/langchain-ai/langgraph)
[![Ollama](https://img.shields.io/badge/Ollama-black?style=flat-square)](https://ollama.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 📋 Project Overview

Procurement and vendor selection are historically slow, manual, and constrained by rigid keyword searches. This platform resolves this by providing a conversational interface for intelligent vendor discovery and matching. Users query the platform in plain, natural language to search for specific services, budgets, or locations. By employing a multi-agent workflow powered by LangGraph and Ollama (Qwen 2.5), the system interprets user intent, extracts search constraints, retrieves verified database records, and determines compatibility ranking. AI improves discovery by translating unstructured prompts into precise database queries, learning user preferences over time, and generating contextual explanations for recommendations. This bridges the gap between conversational inquiry and reliable database matchmaking.

---

## ✨ Key Features

| Feature Group | Implemented Feature | Description |
| :--- | :--- | :--- |
| **AI & Recommendation** | AI-powered Vendor Recommendation | Computes semantic matches and produces structured LLM explanations. |
| | Natural Language Search | Interprets query intent, extracts filters, and queries vendor data. |
| | LangGraph Workflow | Coordinates query validation, database search, user preference learning, and generation. |
| | Context-Aware Conversation | Retains chat logs and maintains continuous interactive sessions. |
| | Session Memory | Restores chat history dynamically using session identifiers. |
| | User Preference Learning | Extracts and persists buyer constraints (e.g., location, budget) into the database. |
| | Semantic Search | Uses semantic embeddings to discover matches beyond direct keyword terms. |
| | Vendor Ranking Algorithm | Ranks candidates using a combined score of ratings, reviews, and preference fit. |
| | Personalized Recommendations | Adapts recommendation candidate pools based on learned user profiles. |
| **Management & Persistence**| Vendor Management | Allows vendors to edit details, services, pricing models, and media files. |
| | Saved Vendors | Enables users to save shortlist candidates and compare them later. |
| | Recommendation History | Stores previous search inputs and generated recommendations for review. |
| | PostgreSQL Database Persistence| Ensures ACID compliance across all tables (users, sessions, vendors, reviews, etc.). |
| **Security & Integration**  | JWT Authentication | Secures routes with stateless token-based authorization (Access and Refresh tokens). |
| | Role-Based Authorization | Enforces access permissions (Admin, Vendor, Customer) on API endpoints. |
| | REST APIs | Standardizes data exchange via robust, type-safe FastAPI routes. |
| | Swagger/OpenAPI Documentation | Automates live API testing and interface documentation schemas. |
| **System Operations**      | Background Scheduler | Executes periodic data maintenance using `APScheduler`. |
| | Vendor Synchronization | Syncs external catalog feeds periodically into the local database. |

---

## ⚙️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React | Component-based UI library. |
| | Vite | Frontend build tool and dev server. |
| | Tailwind CSS | Utility-first CSS styling framework. |
| | Axios | HTTP client for backend API communication. |
| | React Query | Data fetching and server state caching. |
| | Zustand | Lightweight client-side state management. |
| **Backend** | Python | Primary programming language. |
| | FastAPI | Web framework for high-performance REST APIs. |
| | Pydantic | Request and response validation using FastAPI schemas. |
| | SQLAlchemy | Object-Relational Mapper (ORM) for DB queries. |
| | Alembic | Database migrations version control. |
| | PostgreSQL | Relational database. |
| **AI** | LangGraph | State-driven agent orchestration. |
| | Ollama | Local LLM hosting environment. |
| | Qwen 2.5 | Reasoning LLM for matching. |
| **Utilities** | JWT | Security authentication tokens. |
| | Swagger/OpenAPI | Auto-generated API documentation. |
| | APScheduler | Recurring background task scheduling. |

---

## 📐 High-Level Architecture

The platform follows a layered, decoupled architecture ensuring clear boundaries between frontend state, API routing, database transactions, and the multi-agent AI pipeline.

```
                  ┌───────────────────────┐
                  │     User Browser      │
                  └───────────┬───────────┘
                              │
                              ▼ (HTTP / JSON / JWT)
                  ┌───────────────────────┐
                  │    React Frontend     │ (Vite, Zustand, Tailwind)
                  └───────────┬───────────┘
                              │
                              ▼ (REST API calls)
                  ┌───────────────────────┐
                  │    FastAPI Backend    │ (app/main.py)
                  └───────────┬───────────┘
                              │
             ┌────────────────┴────────────────┐
             ▼ (JWT Validation)                ▼ (AI Recommendations)
   ┌───────────────────┐             ┌───────────────────────────┐
   │  Authentication   │             │ LangGraph AI Orchestrator │ (reasoning_graph.py)
   └───────────────────┘             └─────────────┬─────────────┘
                                                   │
                                     ┌─────────────┴─────────────┐
                                     ▼                           ▼
                        ┌──────────────────────┐   ┌───────────────────────────┐
                        │Recommendation Engine │   │   Vendor Ranking Engine   │
                        └──────────┬───────────┘   └─────────────┬─────────────┘
                                   │                             │
                                   └─────────────┬───────────────┘
                                                 │
                                                 ▼ (SQLAlchemy ORM)
                                     ┌───────────────────────────┐
                                     │    PostgreSQL Database    │
                                     └───────────────────────────┘
```

---

## 🧠 AI Workflow

The AI engine orchestrates vendor recommendations through a structured pipeline managed by a LangGraph workflow. The sequence executes as follows:

```
┌──────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  User Query  ├─────>│ Query Processing ├─────>│ Intent Detection │
└──────────────┘      └──────────────────┘      └────────┬─────────┘
                                                         │
┌──────────────┐      ┌──────────────────┐               ▼
│  Preference  │      │   Conversation   │      ┌──────────────────┐
│   Learning   │<─────┤Context Retrieval │<─────┤  Extract Filters │
└──────┬───────┘      └──────────────────┘      └──────────────────┘
       │
       ▼
┌──────────────┐      ┌──────────────────┐      ┌──────────────────┐
│    Vendor    ├─────>│  Vendor Ranking  ├─────>│LLM Recommendation│
│  Filtering   │      │    Algorithm     │      │    Generation    │
└──────────────┘      └──────────────────┘      └────────┬─────────┘
                                                         │
                                                         ▼
                                                ┌──────────────────┐
                                                │Structured Response│
                                                └──────────────────┘
```

When a user submits a search query, the backend passes it to the LangGraph AI orchestrator, which coordinates the reasoning pipeline. The system detects user intent, extracts filter criteria like budget or location, and retrieves conversation history and stored user preferences. It then queries the PostgreSQL database to filter matching vendors and ranks them using ratings and constraint alignment. Finally, the local Qwen 2.5 model generates a conversational recommendation explaining the suitability of each match. This structured response, containing both explanatory text and vendor metadata, is sent back to the frontend for interactive display.

---

## 📁 Project Structure

```
vendor-recommendation-ai-engine/
├── backend/
│   ├── app/                      # Backend application source code
│   ├── docs/                     # Comprehensive system documentation
│   ├── alembic/                  # Database schema migrations
│   └── tests/                    # Backend testing suite
├── frontend/
│   ├── src/                      # Frontend client source code
│   ├── public/                   # Static client assets
│   └── vite.config.js            # Vite compiler configuration script
├── README.md                     # Landing page and project summary
├── requirements.txt              # Primary backend Python dependencies
├── frontend-requirements.txt     # Frontend package manifest reference
└── LICENSE                       # Repository MIT License
```

---

## 🚀 Installation

Follow these steps to deploy a local instance of the Vendor Recommendation AI Platform.

### Prerequisites
- **Python 3.10+**
- **Node.js v16+**
- **PostgreSQL Database**
- **Ollama**

### 1. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows (PowerShell):**
     ```powershell
     .\venv\Scripts\activate
     ```
   - **Linux / macOS:**
     ```bash
     source venv/bin/activate
     ```
4. Install backend dependencies:
   ```bash
   pip install -r ../requirements.txt
   ```
5. Configure environment variables by creating a `.env` file in the `backend/` folder:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vendor_ai
   SECRET_KEY=<your-secret-key>
   AI_PROVIDER=ollama
   AI_MODEL=qwen2.5:7b
   OLLAMA_BASE_URL=http://localhost:11434/v1
   ```
6. Run database migrations to construct tables:
   ```bash
   alembic upgrade head
   ```
7. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```

### 3. AI Model Setup
1. Install and start the Ollama service on your local machine.
2. Pull the required language model:
   ```bash
   ollama pull qwen2.5:7b
   ```

---

## 📝 API Documentation

FastAPI automatically parses source code type annotations to serve structured API documentation at startup:

- **Swagger UI (`/docs`):** An interactive sandbox page enabling developers to execute calls directly against the running API server.
- **ReDoc (`/redoc`):** A clean, readable, single-page presentation layout documenting schema objects and paths.
- **OpenAPI Specification (`/openapi.json`):** A raw JSON definition containing complete path mappings and configurations.

---

## 📚 Complete Technical Documentation

The `backend/docs/` directory contains the complete technical handover manuals and reports for the platform. This README serves as a high-level entrypoint, while the dedicated documentation files provide in-depth engineering references.

The [backend/docs/](backend/docs/) folder contains:
- **Interactive Technical Documentation (HTML)** ([AI_Vendor_Discovery_Agent_Documentation.html](backend/docs/AI_Vendor_Discovery_Agent_Documentation.html))
- **Printable Technical Documentation (PDF)** ([AI_Vendor_Discovery_Agent_Documentation.pdf](backend/docs/AI_Vendor_Discovery_Agent_Documentation.pdf))
- **Complete System Architecture**
- **API Documentation**
- **AI Workflow Documentation**
- **Deployment Documentation**
- **Project Handover Manual**

---

## 🌐 Deployment

The React frontend serves the client application, while FastAPI exposes REST APIs. PostgreSQL stores application data, and Ollama hosts the local LLM. Deployment requires environment configuration and database initialization.

---

## 🗺️ Future Roadmap

Planned enhancements for future releases:
- **Multi-model LLM Support:** Toggle dynamically between Ollama, OpenAI, Gemini, and Groq reasoning engines.
- **Vector Search:** Integrate `pgvector` into PostgreSQL to perform semantic similarity matches.
- **Containerized Deployment (Docker):** Containerize backend and frontend services.
- **CI/CD Integration:** Automate deployment pipelines for hosting providers.
- **Performance Optimization:** Introduce Redis layer for semantic caching.
- **Analytics Dashboard:** Build visual overview tools inside the vendor and admin panels.
- **Monitoring & Observability:** Setup real-time logging and tracing metrics of agent workflows.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for the full license text.
