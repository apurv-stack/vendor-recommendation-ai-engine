# 🤖 Vendor Recommendation AI Platform

The **Vendor Recommendation AI Platform** is a state-of-the-art enterprise solution designed for intelligent, natural language vendor discovery and personalized matching. Driven by a sophisticated multi-agent AI orchestrator, the platform enables organizations to find, evaluate, rank, and manage vendors using intuitive conversational interfaces.

By combining the local privacy and reasoning capabilities of LLMs with structured database persistence and automated business logic, the platform bridges the gap between unstructured procurement requests and verified vendor databases.

Built with a modern, high-performance tech stack: **React**, **FastAPI**, **PostgreSQL**, **Ollama (Qwen 2.5)**, and **LangGraph**.

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

### Business Problem
Procurement and vendor selection are historically slow, manual, and prone to cognitive bias. Traditional vendor databases rely on rigid keyword searches and static tag filters that fail to capture nuanced requirements. Buyers often struggle to articulate their needs in exact database fields, leading to suboptimal vendor matching, delayed timelines, and missed operational opportunities.

### Project Objectives
- **Semantic Understanding:** Enable procurement teams to query vendors in plain, natural language.
- **Intelligent Orchestration:** Employ agentic workflows to validate search queries, query database records, and learn user preferences over time.
- **Accurate Ranking:** Implement deterministic ranking logic that weighs compatibility, ratings, and pricing.
- **Data Integrity:** Run background sanitization and synchronization routines to ensure data freshness.

### Platform Capabilities
- **Conversational Matchmaking:** Interact with a context-aware chat assistant that refines queries and explains recommendations.
- **Preference Profiling:** Automatically capture user constraints (budget, location, features) and apply them to subsequent recommendations.
- **Vendor Portal:** Offer self-service capabilities for vendors to manage their profiles, services, media, and pricing.
- **Admin Dashboard:** Provide administrators with overview metrics, synchronization triggers, and audit logs of database cleanups.

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
| | React Query | Handles declarative data fetching, caching, and server state updates. |
| | Zustand | Lightweight state management for client-side configurations and active sessions. |
| | Axios | Promise-based HTTP client for API communication. |
| **Backend** | FastAPI | High-performance Python framework for building REST APIs. |
| | Python | Primary runtime environment for the API and orchestrator. |
| | SQLAlchemy | Object-Relational Mapper (ORM) for SQL transaction safety. |
| | Alembic | Lightweight database migration tool for schema version control. |
| | PostgreSQL | Enterprise relational database for robust storage and queries. |
| **AI** | LangGraph | State-driven multi-agent framework for building complex LLM agents. |
| | Ollama | Run LLMs locally to maintain search query privacy. |
| | Qwen 2.5 (7B) | Local LLM used for intent analysis and extraction. |
| | Prompt Engineering | Standardized templates that steer LLMs to produce structured outputs. |
| | Semantic Search | Custom search logic mapping query tokens to category embeddings. |
| **Utilities** | JWT | JSON Web Tokens for secure session authentication. |
| | APScheduler | Advanced Python Scheduler for orchestrating recurring database cleanups. |
| | Swagger/OpenAPI | Native API documentation and interactive test panels. |

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

## 🧠 AI Workflow Overview

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
3. **Intent Detection:** The LLM parses the prompt to determine if the query is a search request, general feedback, or a follow-up query.
4. **Context Retrieval:** Historical chat logs and profile preferences are retrieved from the database to maintain conversational continuity.
5. **Preference Learning:** The agent extracts constraints (e.g., price range, preferred locations) and persists them in the user profile.
6. **Vendor Filtering:** The engine retrieves vendor candidates from PostgreSQL matching extracted categories and strict criteria.
7. **Vendor Ranking:** Candidate vendors are scored based on review ratings, location matching, pricing models, and preference similarity metrics.
8. **LLM Recommendation Generation:** The LLM synthesizes vendor facts and drafts a reasoning response explaining why each vendor fits the prompt.
9. **Structured Response:** The backend formats the text explanation alongside clean JSON metadata containing vendor IDs and scores.
10. **Frontend Display:** The React interface parses the payload, presenting the conversational response alongside interactive vendor cards.

---

## 📁 Project Structure

```
vendor-recommendation-ai-engine/
├── backend/
│   ├── alembic/                  # Database migrations files and configurations
│   ├── app/                      # Primary application source code
│   │   ├── agents/               # LLM system prompts and agent instructions
│   │   ├── ai/                   # AI services and utility wrapper classes
│   │   ├── api/                  # API routers, routes, and request validation
│   │   │   └── routes/           # REST endpoints (auth, vendor, chat, sync, etc.)
│   │   ├── core/                 # Shared configurations, JWT, logger, and exceptions
│   │   ├── db/                   # Database engine, base model, and session configs
│   │   ├── graphs/               # LangGraph workflow configurations and states
│   │   ├── integrations/         # External APIs and third-party vendor feeds
│   │   ├── models/               # SQLAlchemy database entity definitions
│   │   ├── repositories/         # Database query wrappers and transaction logic
│   │   ├── schemas/              # Pydantic schemas for request/response validation
│   │   ├── scripts/              # Database seed scripts and helper tools
│   │   ├── services/             # Core business logic and background schedulers
│   │   ├── tools/                # Agent tools linked to database queries
│   │   └── utils/                # General helpers, text formatters, and timers
│   │   └── main.py               # FastAPI application entrypoint
│   ├── docs/                     # Handover manuals and reports
│   │   ├── assets/               # Embedded SVG architecture and flow diagrams
│   │   └── pdf_gen/              # PDF generation configuration and tooling
│   ├── tests/                    # Backend unit and integration test suite
│   ├── requirements/             # Segmented requirements files (dev.txt, etc.)
│   ├── alembic.ini               # Alembic configuration parameters
│   └── pyproject.toml            # Python packaging and linter preferences
├── frontend/
│   ├── public/                   # Static assets (images, site manifests)
│   ├── src/                      # Frontend application source code
│   │   ├── api/                  # Axios custom instances and API client methods
│   │   ├── assets/               # Local fonts, styling components, and SVGs
│   │   ├── components/           # Reusable visual components (cards, lists)
│   │   ├── context/              # React Context providers (auth, settings)
│   │   ├── hooks/                # Custom React Query custom hooks
│   │   ├── pages/                # Parent routing page views (dashboard, profiles)
│   │   ├── routes/               # Routing guard conditions and page mappings
│   │   ├── services/             # Endpoint connection layers
│   │   ├── App.jsx               # Root React entry component
│   │   ├── index.css             # Main styling index containing custom tokens
│   │   └── main.jsx              # React DOM mounting bootstrap file
│   ├── postcss.config.js         # CSS compiler plugins configuration
│   ├── tailwind.config.js        # Custom theme extensions and breakpoints
│   └── vite.config.js            # Vite compiler configuration
├── README.md                     # Repository landing page and system overview
├── requirements.txt              # Unified backend python dependency listing
├── frontend-requirements.txt     # Summary of packages installed in frontend
└── LICENSE                       # MIT License statement
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
5. Configure environment variables. Duplicate the sample configuration file and edit the parameters to match your system credentials:
   ```bash
   cp .env.example .env
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

- **Swagger UI (`/docs`):** An interactive sandbox page enabling developers to execute calls directly against the running API server, inspecting responses, and authenticating dynamically.
- **ReDoc (`/redoc`):** A clean, readable, single-page presentation layout documenting schema objects, paths, and response codes.
- **OpenAPI Specification (`/openapi.json`):** A raw JSON definition containing complete path mappings and endpoint configurations compliant with standard OpenAPI specifications.

---

## 🌐 Deployment Overview

Deploying the system to production requires setting up the following resources:

1. **FastAPI Backend:** Typically run inside Docker containers using Gunicorn with Uvicorn workers. Can be deployed to AWS ECS, Heroku, or GCP Cloud Run.
2. **React Frontend:** Compiled into optimized static HTML, JS, and CSS files via Vite (`npm run build`) and hosted on CDN platforms like Netlify, Vercel, or AWS S3 + CloudFront.
3. **PostgreSQL Database:** Managed relational instances (e.g., AWS RDS, Supabase, Neon) initialized and maintained using Alembic migration files.
4. **AI Inference Host:** Production deployments typically call remote LLM providers (configured via `AI_PROVIDER=gemini` or `AI_PROVIDER=groq`) to bypass local compute restrictions. For private network deployments, Ollama instances can run on GPU-enabled VMs.
5. **Environment Configuration:** Secure variables (database URLs, JWT keys, API keys) must be injected into the runtime environment (not committed to code).

---

## 📚 Complete Technical Documentation

This README acts as a high-level overview. Complete developer guides, system manuals, and deep-dive technical reports are maintained within the repository.

Please refer to the following resources:
- **[System Systems Manual (HTML)](backend/docs/AI_Vendor_Discovery_Agent_Documentation.html):** The comprehensive engineering, deployment, API, and architectural handover document.
- **[System Systems Manual (PDF)](backend/docs/AI_Vendor_Discovery_Agent_Documentation.pdf):** A printable PDF copy of the handover documentation.
- **API Documentation:** Interactive documentation is available at `/docs` on the running API instance.
- **AI Workflow Guides:** Full explanations of the LangGraph node logic are available in the Systems Manual.
- **Deployment Guides:** Complete guidelines on cloud configuration are stored in the Systems Manual under Section 49.

---

## 🗺️ Future Roadmap

Planned enhancements for future releases:
- **Multi-model LLM Support:** Toggle dynamically between Ollama, OpenAI, Gemini, and Groq reasoning engines based on performance quotas.
- **Advanced Semantic Retrieval (Vector Search):** Integrate `pgvector` into PostgreSQL to perform semantic vector searches directly within database queries.
- **Cloud Deployment Automation:** Implement Terraform modules for automated provisioning of AWS/GCP services.
- **Performance Optimization:** Introduce Redis layer for semantic caching and session query log optimization.
- **Enhanced Analytics Dashboards:** Build visual dashboards inside the vendor and admin panels showing query trends and matchmaking performance.
- **Advanced Observability:** Real-time logging metrics of agent workflows for performance analysis.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for the full license text.
