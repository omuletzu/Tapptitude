require("dotenv").config();
const express = require("express");
const axios = require("axios");
const Redis = require("ioredis");
const cors = require("cors");
const { generateTemplate } = require("./promptTemplate");

const app = express();
app.use(express.json());
app.use(cors());

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

const OLLAMA_BASE = `http://${process.env.OLLAMA_HOST}:${process.env.OLLAMA_PORT}/api`;

async function getEmbedding(prompt) {
  const res = await axios.post(`${OLLAMA_BASE}/embeddings`, {
    model: "mxbai-embed-large",
    prompt: prompt,
  });

  return res.data.embedding;
}

async function generateRecipe(prompt, likedIngredients, hatedIngredients) {

  const res = await axios.post(`${OLLAMA_BASE}/generate`, {
    model: "llama3.2",
    prompt: generateTemplate(prompt, likedIngredients, hatedIngredients),
    stream: false,
  });

  const recipeObj = JSON.parse(res.data.response);

  return recipeObj;
}

app.post("/embeddings", async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({
        error: "Prompt is null",
      });
    }

    const embedding = await getEmbedding(input);

    res.json(embedding);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Cannot generate embedding",
    });
  }
});

function sortRecipes(recipes, liked, hated) {
  liked = Array.isArray(liked) ? liked : [];
  hated = Array.isArray(hated) ? hated : [];

  return recipes.sort((a, b) => {
    const aLiked = liked.filter((x) => a.ingredients.includes(x)).length;
    const bLiked = liked.filter((x) => b.ingredients.includes(x)).length;

    const aHated = hated.filter((x) => a.ingredients.includes(x)).length;
    const bHated = hated.filter((x) => b.ingredients.includes(x)).length;

    return bLiked - aLiked || aHated - bHated;
  });
}

app.get("/recipes", async (req, res) => {
  try {
    const { prompt, likedIngredients = [], hatedIngredients = [] } = req.query;

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is null",
      });
    }

    const promptEmbedding = new Float32Array(await getEmbedding(prompt));

    const vecBuffer = Buffer.from(promptEmbedding.buffer);

    const rawTopResults = await redis.call(
      "FT.SEARCH",
      "idx:prompts",
      `*=>[KNN 6 @embedding $vec AS score]`,
      "PARAMS",
      2,
      "vec",
      vecBuffer,
      "SORTBY",
      "score",
      "RETURN",
      2,
      "text",
      "score",
      "DIALECT",
      2
    );

    const total = rawTopResults[0];

    const finalRecipes = [];
    const topResultsDocs = [];

    for(let i = 1; i < rawTopResults.length; i += 2) {
      const promptKey = rawTopResults[i];

      const fieldArray = rawTopResults[i + 1];

      const doc = { promptKey }

      for(let j = 0; j < fieldArray.length; j += 2) {
        doc[fieldArray[j]] = fieldArray[j + 1];
      }

      topResultsDocs.push(doc)
    }

    for (const doc of topResultsDocs) {
      const promptKey = doc.promptKey;

      const cachedRecipes = await redis.lrange(`recipes:${promptKey}`, 0, -1);

      const cachedRecipeObjects = cachedRecipes.map((x) => JSON.parse(x));

      const sortedRecipes = sortRecipes(
        cachedRecipeObjects,
        likedIngredients,
        hatedIngredients
      );

      finalRecipes.push(...sortedRecipes.slice(0, 2));

      if (finalRecipes.length >= 2) {
        break;
      }
    }

    const recipesLeftCount = 5 - finalRecipes.length;

    const newRecipes = await Promise.all(
      Array.from({ length: recipesLeftCount }, async () =>
        generateRecipe(prompt, likedIngredients, hatedIngredients)
      )
    );

    const newPromptId = await redis.incr("prompt:id");
    const promptKey = `prompt:${newPromptId}`;

    await Promise.all(
      newRecipes.map((x) => {
        finalRecipes.push(x);

        const recipeKey = `recipes:${promptKey}`;

        redis.rpush(recipeKey, JSON.stringify(x));
        redis.expire(recipeKey, 3 * 60 * 60);
      })
    );

    await redis.hset(promptKey, {
      text: prompt,
      embedding: vecBuffer,
    });

    await redis.expire(promptKey, 3 * 60 * 60);

    return res.status(200).json({
      recipes: finalRecipes,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Cannot generate recipes",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
