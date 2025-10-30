import { useCallback, useState } from "react";
import { FlatList, Text, View } from "react-native";
import RecipeCard from "../components/recipeCard";
import { RecipeCardItem } from "./recipeList";
import {
  handleFetchRecipes,
  handlePreferenceRecipeDB,
} from "../services/recipeService";
import { RecipeStyle } from "../styles/recipe.style";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator } from "react-native";

export default function RecipesHatedScreen({ navigation }: any) {
  const [hatedRecipes, setHatedRecipes] = useState<RecipeCardItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRemoveHate = async (recipe: RecipeCardItem) => {
    recipe.preference = 0;
    await handlePreferenceRecipeDB(recipe);
    setHatedRecipes((r) => r.filter((ri) => ri.id !== recipe.id));
  };

  const loadLikedRecipes = async () => {
    setLoading(true);

    const recipes = await handleFetchRecipes(-1);
    const preferenceUpdatedRecipes = recipes.map((r: RecipeCardItem) => ({
      ...r,
      preference: -1,
    }));
    setHatedRecipes(preferenceUpdatedRecipes);

    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadLikedRecipes();
    }, [])
  );

  return (
    <View style={RecipeStyle.container}>
      <Text style={RecipeStyle.title}> Hated:</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#FF6347"
          style={{ marginTop: 20 }}
        />
      ) : hatedRecipes.length === 0 ? (
        <Text style={RecipeStyle.title}>
          {" "}
          No disliked recipes at the moment{" "}
        </Text>
      ) : (
        <FlatList
          style={RecipeStyle.list}
          data={hatedRecipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <RecipeCard
              title={item.title}
              time={item.time}
              preference={item.preference}
              onHate={() => handleRemoveHate(item)}
              likeVisible={false}
              hateVisible={true}
            />
          )}
        />
      )}
    </View>
  );
}
