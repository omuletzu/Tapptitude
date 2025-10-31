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
    const recipes = Array.isArray(userRecipe.recipes)
      ? userRecipe.recipes
      : userRecipe.recipes
      ? [userRecipe.recipes]
      : [];

    recipes.forEach((recipe: any) => {
      const recipeIngredients = Array.isArray(recipe.recipe_ingredients)
        ? recipe.recipe_ingredients
        : recipe.recipe_ingredients
        ? [recipe.recipe_ingredients]
        : [];

      recipeIngredients.forEach((ri: any) => {
        const ingr = Array.isArray(ri.ingredients)
          ? ri.ingredients
          : ri.ingredients
          ? [ri.ingredients]
          : [];

        ingr.forEach((ingredient: any) => {
          ingredients.push(ingredient.name);
        });
      });
    });
  });

  const uniqueIngredients = [...new Set(ingredients)];

  return uniqueIngredients;
}

async function handleDeleteRecipeDB(userId: string, recipe: RecipeCardItem) {
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

  const { data: riData, error: riErr } = await supabase
    .from("recipe_ingredients")
    .select("ingredient_id")
    .eq("recipe_id", recipe.id);

  if (riErr) {
    console.error(riErr);
  } else {
    const ingredientIds = riData?.map((r: any) => r.ingredient_id) || [];

    const { error: delRiErr } = await supabase
      .from("recipe_ingredients")
      .delete()
      .eq("recipe_id", recipe.id);

    if (delRiErr) {
      console.error(delRiErr);
    } else {
      for (const ingredientId of ingredientIds) {
        const { data: ingRows, error: ingErr } = await supabase
          .from("ingredients")
          .select("id,count")
          .eq("id", ingredientId)
          .maybeSingle();

        if (ingErr) {
          console.error("Failed to select ingredient", ingErr);
          continue;
        }
        if (!ingRows) continue;

        const currentCount = ingRows.count ?? 0;
        const newCount = currentCount - 1;

        if (newCount > 0) {
          const { error: updErr } = await supabase
            .from("ingredients")
            .update({ count: newCount })
            .eq("id", ingredientId);
          if (updErr)
            console.error("Failed to decrement ingredient count", updErr);
        } else {
          const { error: delIngErr } = await supabase
            .from("ingredients")
            .delete()
            .eq("id", ingredientId);
          if (delIngErr)
            console.error("Failed to delete ingredient", delIngErr);
        }
      }
    }
  }
}

async function handleAddRecipeDB(userId: string, recipe: RecipeCardItem) {
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

  const ingredientIds: { name: string; id: string }[] = [];

  for (const ingredient of recipe.ingredients) {
    if (!ingredient) continue;

    const { data: existing, error: selErr } = await supabase
      .from("ingredients")
      .select("id,count")
      .eq("name", ingredient)
      .maybeSingle();

    if (selErr) {
      console.error("Failed to select ingredient by name", selErr);
      continue;
    }

    if (!existing) {
      const { data: insData, error: insErr } = await supabase
        .from("ingredients")
        .insert([{ name: ingredient, count: 1 }])
        .select("id")
        .maybeSingle();

      if (insErr) {
        console.error("Failed to insert ingredient", insErr);
        continue;
      }

      ingredientIds.push({ name: ingredient, id: insData!.id });
    } else {
      const newCount = (existing.count ?? 0) + 1;

      const { error: updErr } = await supabase
        .from("ingredients")
        .update({ count: newCount })
        .eq("id", existing.id);

      if (updErr) {
        console.error("Failed to update ingredient count", updErr);
        continue;
      }

      ingredientIds.push({ name: ingredient, id: existing.id });
    }

    if (ingredientIds.length > 0) {
      const recipeIngredientRows = ingredientIds.map((i) => ({
        recipe_id: recipe.id,
        ingredient_id: i.id,
      }));

      const { error: riUpErr } = await supabase
        .from("recipe_ingredients")
        .upsert(recipeIngredientRows, {
          onConflict: "recipe_id,ingredient_id",
        });

      if (riUpErr)
        console.error("Failed to upsert recipe_ingredients", riUpErr);
    }
  }
}

export async function handlePreferenceRecipeDB(recipe: RecipeCardItem) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    console.error("Undefined user id");
    return;
  }

  if (recipe.preference === 0) {
    await handleDeleteRecipeDB(userId, recipe);

    return;
  }

  await handleAddRecipeDB(userId, recipe);
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
    `http://10.93.118.188:5000/recipes?prompt=${encodeURIComponent(
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
