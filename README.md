# AI Recipe Finder

<p align="center">
  <img src="https://img.shields.io/badge/Expo-React_Native-blue" />
  <img src="https://img.shields.io/badge/Backend-Node.js-green" />
  <img src="https://img.shields.io/badge/Database-Supabase-3FCF8E" />
  <img src="https://img.shields.io/badge/Cache-Redis--Stack-red" />
  <img src="https://img.shields.io/badge/AI-Ollama-black" />
  <img src="https://img.shields.io/badge/Embedding-🔥 mxbai--embed-orange" />
  <img src="https://img.shields.io/badge/LLM-Llama_3.2-lightgrey" />
</p>

## Overview

A mobile app that generates recipes using AI based on user preferences.

Users can sign up, enter a prompt and receive 5 tailored recipes - combining AI-generated recipes with cached recipe retrieval from other users using vector similarity search in Redis-Stack.

The system adapts based on liked or disliked recipes, so it knows for the current user his preffered or hated ingredients and uses them to improve future recipe suggestions.

## System architecture

- The app is a React Native (Expo + Typescript) mobile client that authenticates users with Supabase and sends recipe prompts to a Node.js backend server.
- The backend orchestrates the AI pipeline - it requests embeddings (from mxbai-embed-large model)
and generations (from llama3.2 model) via Ollama REST, uses Redis-Stack + RediSearch vector index to find similar past prompts with cached recipes, and persist durable data to Supabase (users, recipes, ingredients, recipe-ingredients, recipe-user) (with Postgres).
- The backend returns 5 recipes per prompt (prefer cached + personalized matches, then generate the rest) and updates user ingredient preferences when recipes are liked / hated.

## Components

- Mobile App (Expo, TSX):
  - UI for login/register, entering prompt, viewing 5 recipes, saving likes/hates, viewing favorites/hates.
  - Manages Supabase session client-side and sends backend requests.
  - Receives the 5 returned recipes and displays them.
  - Persists favorites, liked/hated recipes, and ingredient preferences directly into Supabase.
  - Lists favorites/hated recipes by querying Supabase
- Node.js Backend (Express):
  - Only handles recipe generation and caching: embedding → Redis KNN → select cached recipes (ordered by their similarity to current prompt and ingredient preferences) → call Ollama to generate missing recipes → return results.
  - Manages Redis prompt hashes and vector index.
  - Persist generated recipes into Redis cache.
- Redis Stack + RediSearch:
  - Stores prompt hashes (text, embedding, cached recipes list).
  - Provides fast vector KNN queries (HNSW) to find the top similar prompts, requested by other users
- Ollama (LLM host):
  - mxbai-embed-large for embeddings (1024-dim float32).
  - llama3.2 for recipe generation.
- Supabase (Postgres + Auth):
  - Manages user accounts (Supabase Auth) and stores user-specific data: favorites, liked/hated relations, ingredient preferences, and optionally recipes (if client liked / hates them).
 
## Request lifecycle

1. Client: POST /api/recipes/generate with { prompt }
2. Backend: Call Ollama embeddings endpoint (mxbai-embed-large) to compute the input embedding (1024-dim float32).
3. Backend: Query Redis vector index for top prompts nearest to the input embedding (KNN).
 <br> Index used `FT.CREATE idx:prompts ON HASH PREFIX 1 "prompt:" SCHEMA text TEXT embedding VECTOR HNSW 6 TYPE FLOAT32 DIM 1024 DISTANCE_METRIC COSINE`
4. Backend: For each matched prompt, load that prompt's cached recipes and score each recipe by user preference:
   - `Prior to number of matching liked ingredients and understate to number of matching hated ingredients`.
   - Select top cached recipes across matched prompts until you reach 2 cached recipes (max).
5. Backend: If cached recipes < 2, call the LLM (Llama 3.2) to generate structured recipes until total = 5 (i.e., typical: 2 cached + 3 generated).
   - When generating, inject user ingredient preferences into the generation prompt to bias results (e.g., `likedIngredients = ['garlic', 'basil'], hatedIngredients = ['shellfish'].`).
