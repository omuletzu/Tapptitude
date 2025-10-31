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

## Table of Contents

- [Overview](#overview)
- [Screen recording / Screenshots](#screen-recording--screenshots)
- [System architecture](#system-architecture)
- [Components](#components)
- [Request Lifecycle](#request-lifecycle)
- [Data Model](#data-model)
- [Running Locally / Quickstart](#running-locally--quickstart)

## Overview

A mobile app that generates recipes using AI based on user preferences.

Users can sign up, enter a prompt and receive 5 tailored recipes - combining AI-generated recipes with cached recipe retrieval from other users using vector similarity search in Redis-Stack.

The system adapts based on liked or disliked recipes, so it knows for the current user his preffered or hated ingredients and uses them to improve future recipe suggestions.

## Screen recording / Screenshots

AI response sections are sped up — the model ran locally and real inference time is longer due to hardware limitations

https://github.com/user-attachments/assets/368ea5ab-7a62-4ac3-86d9-250a32b2062e

<img src="https://github.com/user-attachments/assets/a97c3853-c22c-40d0-9c24-1e84b17eded1" alt="ss1" width="200"/>
<img src="https://github.com/user-attachments/assets/fc15299c-c400-4200-a80c-9f1af5d3394a" alt="ss2" width="200"/>
<img src="https://github.com/user-attachments/assets/56624b16-4977-4b56-80fd-a9b5cc624556" alt="ss3" width="200"/>
<img src="https://github.com/user-attachments/assets/557bebaf-d7e1-4311-9739-d3c3604a2624" alt="ss11" width="200"/>
<img src="https://github.com/user-attachments/assets/2f7a58bf-0c61-4988-80da-ccbd30ab852c" alt="ss4" width="200"/>
<img src="https://github.com/user-attachments/assets/832c5f2e-9686-4fc4-9dcd-99e760531b32" alt="ss5" width="200"/>
<img src="https://github.com/user-attachments/assets/7becbef1-bfe8-487e-a089-7f8074a9ca6d" alt="ss6" width="200"/>
<img src="https://github.com/user-attachments/assets/2be03df4-0568-4adc-8f61-f66ecdf6e813" alt="ss7" width="200"/>
<img src="https://github.com/user-attachments/assets/f7d86e48-f758-4da6-a907-3c7d884e506a" alt="ss8" width="200"/>
<img src="https://github.com/user-attachments/assets/98163cb3-c39f-42d7-b514-837983b63d37" alt="ss9" width="200"/>
<img src="https://github.com/user-attachments/assets/585c09aa-af03-498a-90ec-8f0f9f51ffd6" alt="ss10" width="200"/>

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
 
## Request Lifecycle

1. Client: GET /api/recipes with { prompt, likedIngredients, hatedIngredients }
2. Backend: Call Ollama embeddings endpoint (mxbai-embed-large) to compute the input embedding (1024-dim float32).
3. Backend: Query Redis vector index for top prompts nearest to the input embedding (KNN).
 <br> Index used `FT.CREATE idx:prompts ON HASH PREFIX 1 "prompt:" SCHEMA text TEXT embedding VECTOR HNSW 6 TYPE FLOAT32 DIM 1024 DISTANCE_METRIC COSINE`
4. Backend: For each matched prompt, load that prompt's cached recipes and score each recipe by user preference:
   - `Prior to number of matching liked ingredients and understate to number of matching hated ingredients`.
   - Select top cached recipes across matched prompts until you reach 2 cached recipes (max).
5. Backend: If cached recipes < 2, call the LLM (Llama 3.2) to generate structured recipes until total = 5 (i.e., typical: 2 cached + 3 generated).
   - When generating, inject user ingredient preferences into the generation prompt to bias results (e.g., `likedIngredients = ['garlic', 'basil'], hatedIngredients = ['shellfish'].`).
   - Each generated recipe contains:
      - `title` -> the name of the recipe
      - `time` -> estimated cooking/prep time in minutes
      - `ingredients` -> array of ingredient objects
      - `instructions` -> step-by-step cooking instructions
6. Backend: Append the newly generated recipes into the current prompt hash in Redis for future use.
7. Backend: Return consolidated list of 5 recipes to client.
8. Client: Displays 5 recipes; user can like / hate any.
9. Client: When liking / hating requests are sent to supabase, to create / delete the recipe, and modify relations based on user's action.

## Data Model

- users:
  - `id` -> UUID
  - `email` -> TEXT
  - `created_at` -> TIMESTAMP

- recipes:
  - `id` -> UUID
  - `title` -> VARCHAR
  - `time` -> INT
  - `image_url` -> TEXT
  - `full_recipe` -> TEXT
  - `likes` -> INT
  - `created_at` -> TIMESTAMP

- ingredients:
  - `id` -> UUID
  - `name` -> TEXT
  - `count` -> INT

- recipe_ingredients:
  - `recipe_id` -> UUID
  - `ingredient_id` -> UUID

- user_recipe_preference:
  - `user_id` -> UUID
  - `recipe_id` -> UUID
  - `preference` -> SMALLINT
  - `updated_at` -> TIMESTAMP
 
## Running Locally / Quickstart

To run the app locally, you need Redis Stack, Ollama, and the Node.js backend running. The recommended order is:

- Redis-Stack:
```bash
docker run -d --name redis-stack -p 6379:6379 redis/redis-stack:latest
```

- Ollama Server:
```
ollama pull mxbai-embed-large
ollama pull llama3.2
ollama serve
```
- Node.js Server:
```
npm install
npm start
```

## Future Improvements

- Deploy the Node.js backend and move to a fully cloud-hosted infrastructure for faster inference
- Container orchestration with Kubernetes for scalability, fault-tolerance, and easier deployments
- Host the AI model in the cloud instead of running locally
- Improve UI/UX
