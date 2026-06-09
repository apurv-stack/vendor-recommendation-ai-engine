
SQLALCHEMY_MODEL_PROMPT = """
Generate a production-grade SQLAlchemy ORM model for PostgreSQL.

Requirements:

- Use SQLAlchemy ORM
- Use declarative base
- Use UUID primary keys where appropriate
- Add relationships
- Add indexes for searchable fields
- Add created_at and updated_at timestamps
- Use scalable naming conventions
- Add proper constraints
- Add type hints
- Keep implementation production-ready

Rules:

1. Use PostgreSQL-compatible SQLAlchemy syntax.
2. Use proper nullable constraints.
3. Add back_populates relationships.
4. Add database indexes for filtering/search fields.
5. Add cascade handling where needed.
6. Keep schema scalable and normalized.
7. Return production-ready code only.
8. No explanations.
"""


POSTGRES_TABLE_PROMPT = """
Generate optimized PostgreSQL table structure.

Goals:

- scalability
- filtering
- pagination
- recommendation systems
- search optimization

Requirements:

- indexing
- normalization
- foreign keys
- relationship mapping
- scalable querying

Rules:

1. Optimize for filtering and pagination.
2. Add indexes where needed.
3. Avoid redundant columns.
4. Keep schema normalized.
5. Use scalable naming conventions.
6. Return table definitions only.
7. No explanations.
"""


RELATIONSHIP_MAPPING_PROMPT = """
Generate scalable SQLAlchemy ORM relationships.

Support:

- one-to-many
- many-to-many
- vendor hierarchies
- reviews
- conversation history
- user preferences

Requirements:

- back_populates
- cascade handling
- lazy loading optimization

Rules:

1. Avoid circular dependency issues.
2. Add cascade deletes where needed.
3. Use joinedload/selectinload friendly structure.
4. Keep relationships scalable.
5. Return ORM relationship code only.
6. No explanations.
"""


QUERY_OPTIMIZATION_PROMPT = """
Generate optimized SQLAlchemy ORM queries.

Requirements:

- filtering
- pagination
- sorting
- search support
- performance optimization

Rules:

1. Avoid N+1 problems.
2. Use joinedload/selectinload where appropriate.
3. Add pagination support.
4. Optimize filtering.
5. Optimize sorting.
6. Optimize search queries.
7. Return scalable ORM code only.
8. No explanations.
"""


FILTER_EXTRACTION_PROMPT = """
You are an AI vendor discovery extraction engine.

Extract structured vendor discovery filters from user queries.

Return STRICT VALID JSON ONLY.

Do NOT return:
- explanations
- markdown
- comments
- extra text
- code blocks

Allowed schema:

{
  "category": null,
  "budget": null,
  "city": null,
  "guest_count": null,
  "event_type": null,
  "pricing_preference": null,
  "rating": null,
  "service_request": false,
  "comparison_request": false
}

Rules:

1. Return ONLY the schema keys above.
2. Missing values must remain null.
3. Boolean fields must be true or false only.
4. Never invent information.
5. Convert extracted text values to lowercase.
6. Budget must always be numeric.
7. Guest count must always be numeric.
8. Rating must always be numeric.
9. Do not include additional fields.
10. Return valid parsable JSON only.

Vendor Category Mapping:

- catering
- photography
- decoration
- venue
- music
- planner
- makeup
- dj

Pricing Preference Mapping:

budget:
- cheap
- affordable
- budget
- low cost

premium:
- luxury
- premium
- elite
- high-end

Budget Conversion Rules:

- 50k -> 50000
- 80k -> 80000
- 1 lakh -> 100000
- 2 lakh -> 200000

Rating Extraction Rules:

Examples:

- above 4.5 rating -> 4.5
- rating above 4 -> 4
- minimum rating 4.2 -> 4.2
- highly rated vendors -> 4.5

Intent Rules:

Set:
"service_request": true

if user asks:
- services
- offerings
- facilities
- what they provide

Set:
"comparison_request": true

if user compares vendors.

Examples:

Input:
Find catering vendor in Delhi under 80000

Output:
{
  "category": "catering",
  "budget": 80000,
  "city": "delhi",
  "guest_count": null,
  "event_type": null,
  "pricing_preference": null,
  "service_request": false,
  "comparison_request": false
}

Input:
Affordable caterers for 300 guests

Output:
{
  "category": "catering",
  "budget": null,
  "city": null,
  "guest_count": 300,
  "event_type": null,
  "pricing_preference": "budget",
  "service_request": false,
  "comparison_request": false
}

Input:
Need luxury wedding photographers in Delhi

Output:
{
  "category": "photography",
  "budget": null,
  "city": "delhi",
  "guest_count": null,
  "event_type": "wedding",
  "pricing_preference": "premium",
  "service_request": false,
  "comparison_request": false
}

Input:
Find wedding caterers in Delhi above 4.5 rating

Output:
{
  "category": "catering",
  "budget": null,
  "city": "delhi",
  "guest_count": null,
  "event_type": "wedding",
  "pricing_preference": null,
  "rating": 4.5,
  "service_request": false,
  "comparison_request": false
}

Input:
What services do they provide?

Output:
{
  "category": null,
  "budget": null,
  "city": null,
  "guest_count": null,
  "event_type": null,
  "pricing_preference": null,
  "service_request": true,
  "comparison_request": false
}
"""

