import { useState } from "react";
import { FlatList, View } from "react-native";
import RecipeCard from "../components/recipeCard";
import { RecipeCardItem } from "./recipeList";
import { handlePreferenceRecipeDB } from "../services/recipeService";

export default function RecipesLikedScreen({ navigation }: any) {
  const [likedRecipes, setLikedRecipes] = useState<RecipeCardItem[]>([]);

  const handleRemoveLike = async (recipe: RecipeCardItem) => {
    recipe.preference = 0;
    await handlePreferenceRecipeDB(recipe);
  };

  return (
    <View>
      <FlatList
        data={likedRecipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RecipeCard
            title={item.title}
            time={item.time}
            preference={item.preference}
            onLike={() => handleRemoveLike(item)}
            likeVisible={true}
            hateVisible={false}
          />
        )}
      />
    </View>
  );
}
