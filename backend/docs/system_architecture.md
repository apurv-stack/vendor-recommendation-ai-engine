# System Architecture & Technical Documentation
## AI Vendor Discovery Agent Backend

**Version:** 1.0.0  
**Document Classification:** Technical Architecture Design  
**Target Audience:** Engineering Team & Stakeholders  

---

## 1. Executive Summary & System Overview

The **AI Vendor Discovery Agent** is an intelligent assistant designed to streamline vendor matching for event planners. Rather than relying on rigid keyword search bars, the platform employs a conversational, multi-turn AI Agent that decodes natural language user queries, validates details, logs state, and queries database entities using an automated parsing pipeline.

### Core Goals
1. **Conversational discovery**: Translate loose descriptions ("luxury decorator in Delhi under 50k") into precise, structured search filters.
2. **Multi-turn slot filling**: Automatically prompt users for missing details (such as budget constraints, cities, or guest counts) dynamically.
3. **Implicit personalization**: Track user preferences over time to bootstrap search parameters when undefined in the immediate chat context.
4. **Resilient execution**: Maintain low latencies with cache controls and graceful fallbacks when LLM endpoints experience rate limits or failures.

---

## 2. Layered Architecture Design

The backend conforms to a **Layered Architecture** pattern, enforcing a strict separation of concerns across five core layers:

```mermaid
graph TD
    %% Clients
    Client[Web Frontend / API Client]

    %% API Layer
    subgraph API_Layer ["1. API Layer (FastAPI)"]
        main_py["main.py (App Init & Config)"]
        auth_route["auth.py (Auth endpoints)"]
        chat_route["chat.py (Chat endpoints)"]
        query_route["query.py (AI Direct Diagnostic endpoints)"]
        vendor_route["vendor.py (Vendor CRUD)"]
        session_route["session.py (Session control)"]
        pydantic_schemas["Pydantic Schemas (app/schemas/)"]
    end

    %% Auth & Middleware
    subgraph Middleware_Layer ["Middleware & Guards"]
        logging_mid["RequestLoggingMiddleware"]
        cors_mid["CORSMiddleware"]
        exceptions["Custom Exception Handlers"]
        get_db["get_db (Session Generator)"]
        get_user["get_current_user (JWT Resolver)"]
    end

    %% Service Layer
    subgraph Service_Layer ["2. Service Layer (Business Logic)"]
        chat_svc["ChatService"]
        auth_svc["AuthService"]
        vendor_svc["VendorService"]
        session_svc["ChatSessionService"]
        pref_svc["UserPreferenceService"]
        conv_svc["ConversationService"]
        rec_hist_svc["RecommendationHistoryService"]
    end

    %% AI Layer
    subgraph AI_Layer ["3. AI Agent Layer (LLM Logic)"]
        ai_svc["AIService"]
        llm_fact["LLMFactory (Gemini, Groq, Ollama)"]
        prompt_loader["PromptLoader"]
        cache_handler["CacheHandler (In-Memory Cache)"]
        preprocessor["QueryPreprocessor"]
        parser["QueryParser (Regex extraction)"]
        intent_extractor["IntentExtractor"]
        prompt_chain["PromptChain"]
        validator["QueryValidator & FilterValidator"]
        transformer["QueryTransformer"]
        data_orch["DataOrchestrator"]
        rec_engine["RecommendationEngine"]
    end

    %% Repository Layer
    subgraph Repo_Layer ["4. Repository Layer (SQLAlchemy ORM)"]
        vendor_repo["vendor_repository.py"]
        category_repo["category_repository.py"]
    end

    %% DB Layer
    subgraph DB_Layer ["5. Database Layer"]
        db_session["session.py & database.py"]
        base_model["Base Model (base.py)"]
        db_models["SQLAlchemy Models (app/models/*)"]
        postgres["PostgreSQL / SQLite Database"]
    end

    %% Flow Arrows
    Client -->|HTTP / JSON| main_py
    main_py --> logging_mid
    main_py --> cors_mid
    main_py --> exceptions
    main_py --> auth_route & chat_route & query_route & vendor_route & session_route
    
    chat_route -->|Depends| get_db & get_user
    chat_route --> chat_svc
    
    chat_svc --> ai_svc
    chat_svc --> data_orch
    chat_svc --> session_svc & pref_svc & conv_svc & rec_hist_svc
    
    ai_svc --> llm_fact & cache_handler & prompt_loader
    ai_svc --> preprocessor & parser & intent_extractor & prompt_chain & validator & transformer
    
    data_orch --> rec_engine
    data_orch --> vendor_repo & category_repo
    session_svc & pref_svc & conv_svc & rec_hist_svc --> vendor_repo & category_repo
    
    vendor_repo & category_repo --> db_models
    db_models --> postgres
    db_session --> postgres
```

### Architectural Layer Responsibilities
* **API Layer**: Exposes endpoints via FastAPI routers. Serializes, validates incoming JSON using Pydantic models, and processes token-based authentication dependencies.
* **Service Layer**: Evaluates business invariants, governs session state transitions (e.g. active vs completed chat sessions), and logs execution metrics.
* **AI Agent Layer**: Normalizes human messages, extracts filters using rule-based/regex models paired with prompt execution chains, validates slot logic, and scores/ranks vendor profiles.
* **Repository Layer**: Encapsulates SQL data querying rules. Houses complex multi-table joins, queries, and filters using the SQLAlchemy ORM.
* **Database Layer**: Sets up ORM base models, maintains database engine pool configurations, and tracks raw data storage files or connections.

---

## 3. Request Flow & Middleware Architecture

When a request targets `/chat/message`, it transitions through several validation, logging, and processing nodes before executing code block logic:

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Main as app/main.py
    participant Route as app/api/routes/chat.py
    participant AuthDep as auth_dependency.py
    participant Service as app/services/chat_service.py
    participant AIService as app/ai/ai_service.py
    participant Orch as app/ai/data_orchestrator.py
    participant Repo as app/repositories/vendor_repository.py
    participant DB as Database (SQLAlchemy)

    Client->>Main: POST /chat/message with Payload
    activate Main
    Main->>Main: RequestLoggingMiddleware logs request
    Main->>Route: Route chat endpoint triggered
    activate Route
    
    Note over Route, AuthDep: Dependency Injection Resolvers
    Route->>AuthDep: get_current_user(token)
    activate AuthDep
    AuthDep->>DB: Query User profile
    DB-->>AuthDep: User Instance
    AuthDep-->>Route: Return Current User
    deactivate AuthDep
    
    Route->>Route: get_db yields DB Session
    Route->>Service: process_message(payload, user)
    activate Service

    Service->>AIService: build_structured_response(msg, context)
    activate AIService
    AIService->>AIService: Extract filters, Intent, and Validation
    AIService-->>Service: Structured JSON result
    deactivate AIService

    alt Context completes Required Slots
        Service->>Orch: fetch_context(intent, filters)
        activate Orch
        Orch->>Repo: search_vendors_ai(filters)
        activate Repo
        Repo->>DB: SELECT JOIN statements (Vendors, Reviews)
        DB-->>Repo: List of ORM Model objects
        Repo-->>Orch: Raw matching vendors
        deactivate Repo
        Orch->>Orch: Rank vendors via RecommendationEngine
        Orch-->>Service: Ranked Vendor Recommendations
        deactivate Orch
        Service->>AIService: build_recommendation_response(msg, existence, filters)
        activate AIService
        AIService-->>Service: LLM-phrased natural response
        deactivate AIService
    else Slots are Missing
        Service->>Service: Generate follow-up questions
    end

    Service->>DB: Save ChatSession & Conversation history
    Service-->>Route: Return success payload
    deactivate Service
    Route-->>Main: Format JSON output (ChatResponse schema)
    deactivate Route
    Main-->>Client: 200 OK Response
    deactivate Main
```

---

## 4. Database Schema & Entity Relationships

The relational design models multiple tables linking users to vendors, tracking chat history, logging recommendation histories, and storing service definitions.

```mermaid
erDiagram
    users ||--o| vendors : "user_id (1:1)"
    users ||--o{ reviews : "submits"
    users ||--o{ viewed_vendors : "views"
    users ||--o{ vendor_follows : "follows"
    users ||--o{ saved_vendors : "saves"
    users ||--o| user_preferences : "defines (1:1)"
    users ||--o{ conversations : "participates"
    users ||--o{ chat_sessions : "creates"
    users ||--o{ recommendation_history : "receives"

    vendors ||--o| recommendation_metadata : "has (1:1)"
    vendors ||--o| semantic_embedding : "has (1:1)"
    vendors ||--o{ reviews : "has"
    vendors ||--o{ pricing_models : "offers"
    vendors ||--o{ vendor_media : "attaches"
    vendors ||--o{ viewed_vendors : "viewed_by"
    vendors ||--o{ vendor_follows : "followed_by"
    vendors ||--o{ saved_vendors : "saved_by"
    vendors ||--o{ notifications : "triggers"
    vendors ||--o{ services : "defines (Category Vendor level)"
    vendors ||--o{ vendor_services : "maps (Vendor level)"
    vendors }|--o| categories : "belongs_to (category_id)"
    vendors ||--o{ vendors : "managed_teams (Self-Join)"

    users {
        uuid user_id PK
        string full_name
        string username UNIQUE
        string email UNIQUE
        string phone_number
        string role
        string password_hash
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    vendors {
        uuid vendor_id PK
        uuid user_id FK
        uuid parent_vendor_id FK "Self join"
        uuid category_id FK
        string name
        string slug UNIQUE
        string description
        string city
        string address
        string business_email UNIQUE
        string contact_phone
        int price_min
        int price_max
        float avg_rating
        int review_count
        boolean is_available
        boolean is_verified
        boolean is_active
        int followers_count
        int profile_views
        float engagement_score
    }

    categories {
        uuid category_id PK
        string name UNIQUE
        string slug UNIQUE
        string description
        boolean is_active
    }

    services {
        uuid service_id PK
        uuid category_vendor_id FK
        string service_name
    }

    pricing_models {
        uuid pricing_id PK
        uuid vendor_id FK
        string title
        string description
        int price
        string currency
        enum pricing_type
        boolean is_active
    }

    reviews {
        uuid review_id PK
        uuid user_id FK
        uuid vendor_id FK
        float rating
        text comment
        datetime created_at
    }

    chat_sessions {
        uuid session_id PK
        uuid user_id FK
        string status "ACTIVE | COMPLETED"
        string detected_intent
        text current_question
        jsonb context_data "Merged filter slots"
        jsonb missing_fields
        datetime created_at
        datetime updated_at
    }

    conversations {
        uuid conversation_id PK
        uuid session_id
        uuid user_id FK
        text user_message
        text ai_response
        string detected_intent
        text applied_filters
        boolean is_follow_up
        text context_summary
        datetime created_at
    }

    user_preferences {
        uuid preference_id PK
        uuid user_id FK
        string preferred_category
        string preferred_city
        string preferred_event_type
        float preferred_min_rating
        datetime created_at
    }

    recommendation_history {
        uuid history_id PK
        uuid user_id FK
        uuid session_id FK
        uuid vendor_id FK
        jsonb filters_snapshot
        text recommendation_reason
        datetime recommended_at
    }
```

---

## 5. AI Agent & Natural Language Parsing Pipeline

Understanding natural language is split between deterministic keyword/regex extraction and generative LLM models to maximize precision and response reliability.

```mermaid
graph TD
    Input[Raw User Message] --> Pre[QueryPreprocessor: Normalize casing & characters]
    Pre --> Parse[QueryParser: Regex-based keyword extraction of City/Category/Cuisine]
    Parse --> Chain[PromptChain: Generates processing steps dynamically based on query style]
    
    subgraph PromptExecution ["LLM Execution Pipeline"]
        Chain -->|If filter_extraction stage| LLMExtract[AIService._extract_llm_filters: Invokes LLM Prompt for JSON slots]
        Chain -->|If intent extraction stage| LLMIntent[IntentExtractor: Matches intent from LLM prompt]
    end

    LLMExtract --> Merge[Merge Filters: Overlays parser_filters with llm_filters]
    LLMIntent --> Merge
    
    Merge --> Val[QueryValidator: Cross-checks logic e.g., prices, date ranges]
    Merge --> Trans[QueryTransformer: Converts filters to a DB Search Payload]
    
    Val --> Struct[StructuredResponseBuilder: Packages details, flags clarification requirements]
    Trans --> Struct
    Struct --> Out[Enriched Structured Response]
```

---

## 6. Vendor Scoring & Recommendation Mechanics

When filters match database entries, a multi-dimensional ranking algorithm is executed by the `RecommendationEngine` to score candidates and return the top matching options.

```mermaid
graph TD
    Start[Get Query Filters] --> SQLJoin[Query vendor_repository.search_vendors_ai]
    SQLJoin --> Fetch[SQL JOIN Category, Services, Reviews with city & category filters]
    Fetch --> MemoryFilter[Pricing Preference Filter applied in repository]
    
    subgraph PriceMatching ["Dynamic Pricing Keywords Check"]
        MemoryFilter -->|If 'budget'| KeepBudget[Filter for description keywords: budget, cheap, affordable]
        MemoryFilter -->|If 'luxury'| KeepPremium[Filter for description keywords: premium, luxury]
    end
    
    KeepBudget & KeepPremium --> RankEngine[RecommendationEngine.rank_vendors]
    
    subgraph ScoringFormula ["Ranking Score Calculation"]
        RankEngine --> ScoreRating[Base Score = avg_rating * 10]
        RankEngine --> ScoreReviews[Add min review_count, 20]
        RankEngine --> ScoreBudget[Add 20 if price_min <= budget]
        RankEngine --> ScoreCity[Add 10 if vendor city matches filter]
        RankEngine --> ScoreCategory[Add 10 if category matches filter]
    end
    
    ScoreRating & ScoreReviews & ScoreBudget & ScoreCity & ScoreCategory --> Sort[Sort by score descending]
    Sort --> Limit[Slice to top MAX_RESULTS e.g. 5]
    Limit --> End[Format Recommendations via RecommendationFormatter]
```

### Ranking Score Formula
$$\text{Score} = (\text{avg\_rating} \times 10) + \min(\text{review\_count}, 20) + P_{\text{budget}} + C_{\text{city}} + C_{\text{category}}$$

Where:
* $P_{\text{budget}} = 20$ if vendor's minimum price $\le$ user's budget, else $0$.
* $C_{\text{city}} = 10$ if the vendor's city matches the target query city, else $0$.
* $C_{\text{category}} = 10$ if the vendor's category matches the target query category, else $0$.

---

## 7. Conversational Dialog & Session State Machine

The conversation tracks session state across multiple turns. Missing slot configuration rules (such as mandatory cities or budgets) dictate whether the agent generates follow-up clarifying questions or final recommendations.

```mermaid
flowchart TD
    In[Received ChatRequest] --> SessionCheck{Is session_id provided & active?}
    SessionCheck -->|No| CreateSession[Create ChatSession record in DB with ACTIVE status]
    SessionCheck -->|Yes| LoadSession[Fetch filters and memory state from ChatSession]

    CreateSession & LoadSession --> QuickCheck{Is user message a static Quick Reply e.g., 'hi'?}
    QuickCheck -->|Yes| QuickOut[Return predefined response without invoking LLM/DB]
    QuickCheck -->|No| AIParse[Invoke AIService.build_structured_response]

    AIParse --> MergeState[Merge newly extracted filters with previous session filters]
    MergeState --> PreferenceCheck{Does user have saved preferences in DB?}
    PreferenceCheck -->|Yes| ApplyPreference[Use preferences to autofill missing filters like city/category]
    PreferenceCheck -->|No| CheckMissing{Are required slots missing?}
    ApplyPreference --> CheckMissing

    CheckMissing -->|Yes| FollowupFlow[Create clarifying question, save current filter state, return followup status]
    CheckMissing -->|No| RecFlow[DataOrchestrator fetches matching vendors, marks session COMPLETED]
    
    RecFlow --> LearnPref[Save extracted slots to UserPreference database schema]
    LearnPref --> Finalize[Generate LLM recommendation message, log history records, return vendors list]
```

---

## 8. Technical Debt & Refactoring Roadmap

To transition the codebase into a production-ready framework, the following development roadmap should be followed:

### Phase 1: Database Setup & Configuration Consolidation
* **Action**: Eliminate the duplicate database session logic. Remove `app/db/database.py` and unify connection pooling within [app/db/session.py](file:///C:/Users/kashish/Desktop/Intern/ai_vendor/backend/app/db/session.py).
* **Action**: Remove the automatic schema creation hooks (`create_all()`) from [app/main.py](file:///C:/Users/kashish/Desktop/Intern/ai_vendor/backend/app/main.py#L138). Ensure all tables are initialized strictly via Alembic migrations.

### Phase 2: Decouple Service & Chat Pipelines
* **Action**: Refactor the monolithic `ChatService.process_message` method. Break it down into modular, single-responsibility step handlers (e.g., `QuickReplyResolver`, `PreferenceBootstrapper`, `RecommendationBuilder`).
* **Action**: Move hardcoded slots (e.g., the rules checking for guest count and budgets if catering) into an external configuration schema (`category_rules.json` or database tables) to conform to the Open-Closed Principle.

### Phase 3: AI Pipeline Improvements
* **Action**: Implement native async LLM clients. Reconfigure `LLMFactory` and `AIService` to run async completions instead of wrapping synchronous thread threads using `asyncio.to_thread`.
* **Action**: Swap the class-variable cache storage in [CacheHandler](file:///C:/Users/kashish/Desktop/Intern/ai_vendor/backend/app/ai/cache_handler.py) for a persistent Redis or Disk-backed SQLite store.
