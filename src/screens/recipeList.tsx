import { useCallback, useState } from "react";
import { FlatList, View } from "react-native";
import RecipeCard from "../components/recipeCard";
import Button from "../components/button";
import SearchBar from "../components/searchBar";
import { useFocusEffect } from "@react-navigation/native";
import {
  fetchRecipesBE,
  handlePreferenceRecipeDB,
} from "../services/recipeService";

export interface RecipeCardItem {
  id: number;
  title: string;
  time: number;
  ingredients: string[];
  instructions: string;
  preference: number
}

export default function RecipeListScreen({ navigation }: any) {
  const [recipes, setRecipes] = useState<RecipeCardItem[]>([]);
  const [lastPrompt, setLastPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePress = (recipeId: number) => {
    navigation.navigate("RecipeList", { id: recipeId });
  };

  const handleLike = async (recipe: RecipeCardItem) => {
    setLoading(true);

    if(recipe.preference === 1) {
      recipe.preference = 0;
    }
    else {
      recipe.preference = 1;
    }

    await handlePreferenceRecipeDB(recipe);

    setLoading(false);
  };

  const handleHate = async (recipe: RecipeCardItem) => {
    setLoading(true);

    if(recipe.preference === -1) {
      recipe.preference = 0;
    }
    else {
      recipe.preference = -1;
    }

    await handlePreferenceRecipeDB(recipe);

    setLoading(false);
  };

  const handleFetchRecipes = async (prompt: string) => {
    setLoading(true);

    setLastPrompt(prompt);

    try {
      const response = await fetchRecipesBE(prompt);
      const newRecipesList = response.recipes || [];

      setRecipes(newRecipesList);
    } catch (err) {
      console.error(err);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      return () => {};
    }, [])
  );

  return (
    <View>
      <SearchBar
        placeholder="What do you feel like eating?"
        onPress={handleFetchRecipes}
      />

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RecipeCard
            title={item.title}
            time={item.time}
            preference={item.preference}
            onPress={() => handlePress(item.id)}
            onLike={() => handleLike(item)}
            onHate={() => handleHate(item)}
            likeVisible={true}
            hateVisible={true}
          />
        )}
      />

      <Button
        title="I don't like these"
        onPress={() => handleFetchRecipes(lastPrompt)}
        disabled={prompt.length > 0}
      />
    </View>
  );
}
