import { supabase } from "../api/supabaseClient";
import { RecipeCardItem } from "../screens/recipeList";

type UserRecipe = {
  recipe_id: number;
  recipes: {
    recipe_ingredients: {
      ingredient_id: number;
      ingredients: { name: string }[];
    }[];
  }[];
};

async function fetchIngredients(userId: string, preference: number) {
  const { data, error } = await supabase
    .from("user_recipe_preference")
    .select(
      `
            recipe_id,
            recipes (
                recipe_ingredients (
                    ingredient_id,
                    ingredients (
                        name
                    )
                )
            )  
        `
    )
    .eq("user_id", userId)
    .eq("preference", preference);

  if (error) {
    console.error(error.message);
    return [];
  }

  if (!data) {
    return [];
  }

  const ingredients: string[] = [];

  data?.forEach((userRecipe) => {
    userRecipe.recipes?.forEach((recipe: any) => {
      recipe.recipe_ingredients?.forEach((ri: any) => {
        ri.ingredients?.forEach((ingredient: any) => {
          ingredients.push(ingredient.name);
        });
      });
    });
  });

  const uniqueIngredients = [...new Set(ingredients)];

  return uniqueIngredients;
}

export async function handlePreferenceRecipeDB(
  recipe: RecipeCardItem
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  if (recipe.preference === 0) {
    const { count } = await supabase
      .from("user_recipe_preference")
      .select("*", { count: "exact", head: true })
      .eq("recipe_id", recipe.id);

    if (count === 0) {
      const { error: error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", recipe.id);

      if (error) {
        console.error(error.message);
      }
    }

    const { error } = await supabase
      .from("user_recipe_preference")
      .delete()
      .eq("user_id", userId)
      .eq("recipe_id", recipe.id);

    if (error) {
      console.error(error.message);
    }

    return;
  }

  const { error: insertError } = await supabase.from("recipes").upsert([
    {
      id: recipe.id,
      title: recipe.title,
      time: recipe.time,
      image_url: null,
      full_recipe: JSON.stringify(recipe),
    },
  ]);

  if (insertError) {
    console.error(insertError.message);
  }

  const { data, error } = await supabase.from("user_recipe_preference").upsert(
    [
      {
        user_id: userId,
        recipe_id: recipe.id,
        preference: recipe.preference,
      },
    ],
    { onConflict: "user_id,recipe_id" }
  );

  if (error) {
    console.error(error.message);
  }
}

export async function handleFetchRecipes(preference: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  const { data, error } = await supabase
    .from("user_recipe_preference")
    .select(
      `
      recipe_id,
      recipes (
        id,
        title,
        time,
        image_url,
        full_recipe
      )
    `
    )
    .eq("user_id", userId)
    .eq("preference", preference);

  if (error) {
    console.error(error.message);
    return [];
  }

  return data.map((x: any) => x.recipes).flat();
}

export async function fetchRecipesBE(prompt: string) {
  const {
    data: { user },
    error: err,
  } = await supabase.auth.getUser();

  if (err || !user) {
    console.error("Cannot fetch user ingredients");
  }

  const userId = user?.id;

  const likedIngredients = await fetchIngredients(userId!, 1);
  const hatedIngredients = await fetchIngredients(userId!, -1);

  const response = await fetch(
    `http://localhost:5000/recipes?prompt=${encodeURIComponent(
      prompt
    )}&likedIngredients=${encodeURIComponent(
      JSON.stringify(likedIngredients)
    )}&hatedIngredients=${encodeURIComponent(JSON.stringify(hatedIngredients))}`
  );

  if (!response.ok) {
    console.error("Cannot fetch recipes");
  }

  const data = await response.json();
  return data.recipes;
}
