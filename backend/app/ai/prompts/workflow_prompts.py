CURSOR_AI_ENGINEERING_PROMPT = """
Cursor AI Engineering Standards

Always generate code using:

- modular architecture
- scalable folder structure
- reusable components
- service-repository pattern
- production-grade practices

Never generate monolithic logic.

Rules:

1. Follow clean architecture.

2. Separate responsibilities.

3. Keep implementation scalable.

4. Keep implementation maintainable.

5. Avoid tightly coupled systems.

6. Prefer reusable modules.

Output production-ready implementation only.
"""


BACKEND_WORKFLOW_PROMPT = """
Backend Generation Workflow

Before generating backend code:

1. Identify architecture layer.

2. Separate:

- routes
- services
- repositories
- schemas
- models

3. Add type hints.

4. Add exception handling.

5. Keep business logic inside services.

6. Keep repositories database-focused.

7. Keep routes thin.

8. Follow dependency injection patterns.

Requirements:

- FastAPI
- SQLAlchemy ORM
- PostgreSQL
- scalable architecture
- production-grade implementation

Output modular backend code only.
"""


FRONTEND_WORKFLOW_PROMPT = """
Frontend Generation Workflow

Before generating frontend code:

1. Identify component type.

2. Separate reusable UI components.

3. Use hooks for reusable logic.

4. Keep API logic inside services/api.

5. Use scalable folder structure.

6. Use Tailwind CSS.

7. Keep components responsive.

Requirements:

- reusable architecture
- scalable components
- maintainable state handling

Output production-ready frontend implementation only.
"""


DATABASE_WORKFLOW_PROMPT = """
Database Workflow Standards

Before generating models:

1. Define relationships.

2. Add indexes.

3. Optimize filtering.

4. Optimize pagination.

5. Use scalable naming conventions.

Requirements:

- PostgreSQL
- SQLAlchemy ORM
- scalable schema design

Rules:

- optimize search performance

- optimize filtering

- optimize pagination

- maintain normalization

Output scalable database implementation only.
"""


AI_WORKFLOW_PROMPT = """
AI Workflow Standards

When generating AI services:

1. Keep orchestration modular.

2. Separate ranking logic.

3. Separate recommendation logic.

4. Keep conversational memory isolated.

5. Avoid tightly coupled AI pipelines.

6. Maintain scalability.

Requirements:

- reusable AI services

- modular orchestration

- production-grade architecture

Output scalable AI implementation only.
"""


PROMPT_ENGINEERING_STRATEGY_PROMPT = """
Prompt Engineering Strategy

Always provide:

- project architecture

- expected output

- technology stack

- scalability requirements

- production expectations

before requesting code generation.

Rules:

1. Prioritize maintainability.

2. Prioritize modularity.

3. Prioritize scalability.

4. Prioritize structured outputs.

5. Avoid vague requirements.

Output production-grade prompt engineering workflow only.
"""


AI_VALIDATION_PROMPT = """
AI Validation Workflow

Before accepting generated code:

Validate:

1. Architecture consistency

2. Scalability

3. Formatting

4. Naming conventions

5. Modularity

6. Security considerations

7. Separation of concerns

8. Production readiness

Reject implementation if:

- tightly coupled

- unscalable

- insecure

- poorly structured

Return validation observations only.
"""