import { useState } from "react";
import { FlatList, View } from "react-native";
import RecipeCard from "../components/recipeCard";
import { RecipeCardItem } from "./recipeList";
import { handlePreferenceRecipeDB } from "../services/recipeService";

export default function RecipesHatedScreen({ navigation }: any) {
  const [hatedRecipes, setHatedRecipes] = useState<RecipeCardItem[]>([]);

  const handleRemoveHate = async (recipe: RecipeCardItem) => {
    recipe.preference = 0;
    await handlePreferenceRecipeDB(recipe);
  };

  return (
    <View>
      <FlatList
        data={hatedRecipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RecipeCard
            title={item.title}
            time={item.time}
            preference={item.preference}
            onLike={() => handleRemoveHate(item)}
            likeVisible={true}
            hateVisible={false}
          />
        )}
      />
    </View>
  );
}
