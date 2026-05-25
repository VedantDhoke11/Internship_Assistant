# AI Assistant Feature Module

This folder governs conversational AI advisors, ATS resume analysis, and skill gap profiling.

## Planned Stack
- OpenAI API / Anthropic SDK
- Pinecone DB (vector storage for RAG context)
- Inngest (long-running resume parsing orchestration)

## Directory Structure
- `/components`: Chat advisor window, resume dropzone, compliance gauges
- `/hooks`: useAdvisorChat, useResumeAnalysis
- `/services`: RAG fetch and LLM parsers
- `/types`: Chat and analysis types
