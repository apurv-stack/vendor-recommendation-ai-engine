# 🤖 Vendor Recommendation AI Platform

The **Vendor Recommendation AI Platform** is an enterprise-grade solution designed for intelligent, natural language vendor discovery and personalized matching. Driven by a sophisticated multi-agent AI orchestrator, the platform bridges the gap between unstructured procurement requests and verified vendor databases.

---

## 🛡️ Badges

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-v0.136.1-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-v19.2.6-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14%2B-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-AI%20Orchestrator-orange?style=flat-square&logo=langchain&logoColor=white)](https://github.com/langchain-ai/langgraph)
[![Ollama](https://img.shields.io/badge/Ollama-Qwen%202.5-black?style=flat-square)](https://ollama.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 📋 Project Overview

Finding the right vendor is historically a tedious, manual process constrained by rigid keyword searches. This platform resolves this by providing a conversational interface for intelligent vendor discovery and matching. Users query the platform in plain, natural language, asking for specific services, budgets, or locations. By employing a multi-agent workflow powered by LangGraph and a local LLM, the system dynamically interprets user intent, extracts search constraints, retrieves verified vendor records from a PostgreSQL database, and determines a deterministic compatibility rank. AI improves discovery by translating unstructured prompts into structured database queries, learning user preferences over time, and generating clear, contextual explanations for why each vendor fits the request. This bridges the gap between conversational inquiry and reliable enterprise matchmaking.

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
| **Frontend** | React | Component-based UI library for creating the client interface. |
| | Vite | Next-generation frontend tooling and bundler for fast development. |
| | Tailwind CSS | Utility-first CSS framework for custom responsive styling. |
| | Axios | Promise-based HTTP client for API communication. |
| | React Query | Handles declarative data fetching, caching, and server state updates. |
| | Zustand | Lightweight state management for client-side configurations and active sessions. |
| **Backend** | Python | Primary runtime environment for the API and orchestrator. |
| | FastAPI | High-performance Python framework for building REST APIs. |
| | SQLAlchemy | Object-Relational Mapper (ORM) for SQL transaction safety. |
| | Alembic | Lightweight database migration tool for schema version control. |
| | PostgreSQL | Enterprise relational database for robust storage and queries. |
| **AI** | LangGraph | State-driven multi-agent framework for building complex LLM agents. |
| | Ollama | Run LLMs locally to maintain search query privacy. |
| | Qwen 2.5 | Local LLM used for intent analysis and extraction. |
| **Utilities** | JWT | JSON Web Tokens for secure session authentication. |
| | Swagger/OpenAPI | Native API documentation and interactive test panels. |
| | APScheduler | Advanced Python Scheduler for orchestrating recurring database cleanups. |

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

1. **User Query:** The buyer submits a natural language requirement (e.g., "Find me a local software development vendor with a budget under $50k").
2. **Query Processing:** The backend sanitizes inputs and identifies active session parameters.
3. **Intent Detection:** The LLM parses the prompt to determine search intent or general conversational feedback.
4. **Context Retrieval:** Historical chat logs are retrieved from the database to maintain conversational continuity.
5. **Preference Learning:** The agent extracts constraints (e.g., price range, preferred locations) and persists them in the user profile.
6. **Vendor Filtering:** The engine retrieves vendor candidates from PostgreSQL matching extracted categories.
7. **Vendor Ranking:** Candidate vendors are scored based on ratings, pricing models, and preference fit metrics.
8. **LLM Recommendation Generation:** The LLM synthesizes vendor facts and drafts a reasoning response explaining the matches.
9. **Structured Response:** The backend formats the explanation alongside vendor metadata and scores.
10. **Frontend Display:** The React interface parses the payload, presenting the response and interactive vendor cards.

---

## 📁 Project Structure

```
vendor-recommendation-ai-engine/
├── backend/
│   ├── alembic/                  # Database schema migrations
│   ├── app/                      # Backend application source code
│   │   ├── agents/               # LLM prompts and agent templates
│   │   ├── ai/                   # AI services and integration utilities
│   │   ├── api/                  # API routing and schema validations
│   │   ├── core/                 # App configurations, logging, and security
│   │   ├── db/                   # Database engine and session handlers
│   │   ├── graphs/               # LangGraph workflow graphs and states
│   │   ├── integrations/         # Third-party vendor data endpoints
│   │   ├── models/               # SQLAlchemy database models
│   │   ├── repositories/         # Database operations and query layers
│   │   ├── schemas/              # Pydantic schema declarations
│   │   ├── scripts/              # Setup and seeding helper scripts
│   │   ├── services/             # Background tasks and core logic
│   │   ├── tools/                # Query tools bound to AI agents
│   │   ├── utils/                # Helper utilities and custom formatters
│   │   └── main.py               # FastAPI gateway entrypoint
│   ├── docs/                     # Comprehensive system documentation
│   │   ├── assets/               # Architecture and workflow diagrams
│   │   └── pdf_gen/              # Tooling to compile documentation into PDF
│   ├── requirements/             # Backend requirements folder
│   │   └── dev.txt               # Development environment requirements
│   ├── tests/                    # Backend testing suite
│   ├── alembic.ini               # Database migration configurations
│   └── pyproject.toml            # Code linter settings
├── frontend/
│   ├── src/                      # Frontend client source code
│   │   ├── api/                  # API client wrapper files
│   │   ├── assets/               # Client-side style files and icons
│   │   ├── components/           # Reusable client view components
│   │   ├── context/              # Global React context definitions
│   │   ├── hooks/                # Data-fetching custom hooks
│   │   ├── pages/                # Parent routing page views
│   │   ├── routes/               # Navigation guard configs
│   │   ├── services/             # Client service call classes
│   │   ├── App.jsx               # Main React entry component
│   │   ├── index.css             # Client stylesheet configurations
│   │   └── main.jsx              # React bootstrap render file
│   ├── tailwind.config.js        # Tailwind CSS theme layout settings
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
   SECRET_KEY=generate_a_secure_jwt_secret_hash_here
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
- **OpenAPI Specification (`/openapi.json`):** A raw JSON definition containing complete path mappings and endpoint configurations compliant with standard OpenAPI specifications.

---

## 📚 Complete Technical Documentation

The `backend/docs/` directory contains the complete technical handover manuals and reports for the platform. This README serves as a high-level entrypoint, while the dedicated documentation files provide in-depth engineering references.

The [backend/docs/](backend/docs/) folder contains:
- **HTML Documentation:** High-fidelity interactive reference manuals ([AI_Vendor_Discovery_Agent_Documentation.html](backend/docs/AI_Vendor_Discovery_Agent_Documentation.html)).
- **PDF Documentation:** Compilation version of the technical handover documents ([AI_Vendor_Discovery_Agent_Documentation.pdf](backend/docs/AI_Vendor_Discovery_Agent_Documentation.pdf)).
- **Complete Architecture Manual:** In-depth descriptions of systemic logic, class hierarchies, and database mapping logic.
- **API Documentation:** Full endpoints mapping and schema configuration files.
- **AI Workflow Documentation:** Detailed description of the LangGraph node transition rules and prompt configurations.
- **Deployment Guide:** Complete guide to server staging and environment parameters configuration.
- **Technical Handover Manual:** Architectural guidelines and operations checklist.

---

## 🌐 Deployment

- **Backend:** FastAPI Python service exposing REST APIs.
- **Frontend:** React application compiled with Vite.
- **Database:** PostgreSQL database for storing user, chat session, and vendor schemas.
- **AI Model:** Ollama running Qwen 2.5 local inference model.

The deployment strategy can be adapted depending on the hosting environment (such as containerized deployments, cloud VM instances, or platform-as-a-service providers).

---

## 🗺️ Future Roadmap

Planned enhancements for future releases:
- **Multi-model LLM Support:** Toggle dynamically between Ollama, OpenAI, Gemini, and Groq reasoning engines based on performance quotas.
- **Advanced Semantic Retrieval (Vector Search):** Integrate `pgvector` into PostgreSQL to perform semantic vector searches directly within database queries.
- **Infrastructure as Code:** Implement Terraform modules for automated provisioning of cloud services.
- **In-Memory Caching:** Integrate Redis layer for semantic caching and session query log optimization.
- **Containerization & Orchestration:** Add Docker configurations and Kubernetes manifests for deployment.
- **CI/CD & Cloud Hosting:** Setup automated deployment pipelines for platforms such as Vercel, Netlify, or AWS (ECS/Cloud Run/CloudFront).
- **Enhanced Analytics Dashboards:** Build visual dashboards inside the vendor and admin panels showing query trends and matchmaking performance.
- **Advanced Observability:** Real-time logging metrics of agent workflows for performance analysis.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for the full license text.
