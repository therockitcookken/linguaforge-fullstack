# Data ingestion rules

Never generate the production dictionary/dialogue corpus by free-form LLM completion. Every record must carry `source`, license/provenance metadata, normalized term, language, level/topic tags, translation status and review status.

Recommended flow: source -> parse -> normalize -> language-specific validation -> semantic/orthographic dedupe -> human/automated QA -> publish.

Chinese 2-character rule: enforce `len(term)==2` for the dedicated two-Hanzi vocabulary collection, while keeping a separate general dictionary collection for legitimate 1/3/4+ character lexical items. This avoids corrupting the language just to satisfy a UI collection constraint.
