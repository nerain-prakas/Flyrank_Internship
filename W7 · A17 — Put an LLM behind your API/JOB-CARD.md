# Job card

**What it does:** Enriches a scraped book record with a closed category, a short summary, and quality flags.

**Input:** A W5 book record with `title`, `description`, `price_gbp`, `availability_text`, and `rating_text`.

**Output:** `{ "category": "fiction|non-fiction|children|other", "summary": "one sentence", "quality_flags": ["missing_description|low_rating|expensive|none"], "confidence": 0.0-1.0 }`

**It must never:** invent a category outside the list, add fields, return raw model text, or provide advice.

**When unsure it should:** use category `other` with confidence below `0.5` and explain the uncertainty in the summary.
