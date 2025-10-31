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
  - 
- Node.js Backend (Express):
