import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import RecipeCard from "../components/recipeCard";
import { RecipeCardItem } from "./recipeList";
import {
  handleFetchRecipes,
  handlePreferenceRecipeDB,
} from "../services/recipeService";
import { RecipeStyle } from "../styles/recipe.style";
import { useFocusEffect } from "@react-navigation/native";
import { RecipeModalDetails } from "../components/recipeDetailsModal";

export default function RecipesLikedScreen({ navigation }: any) {
  const [likedRecipes, setLikedRecipes] = useState<RecipeCardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentRecipeDetails, setCurrentRecipeDetails] =
    useState<RecipeCardItem>();
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = (recipe: RecipeCardItem) => {
    setCurrentRecipeDetails(recipe);
    setModalVisible(true);
  };

  const onCloseModalCallback = () => {
    setModalVisible(false);
    setCurrentRecipeDetails(undefined);
  };

  const handleRemoveLike = async (recipe: RecipeCardItem) => {
    recipe.preference = 0;
    await handlePreferenceRecipeDB(recipe);
    setLikedRecipes((r) => r.filter((ri) => ri.id !== recipe.id));
  };

  const loadLikedRecipes = async () => {
    setLoading(true);

    const recipes = await handleFetchRecipes(1);
    const preferenceUpdatedRecipes = recipes.map((r: any) => {
      let ingredients = []
      let instructions = ""

      try {
        const parsed = JSON.parse(r.full_recipe)
        ingredients = parsed.ingredients || [];
        instructions = parsed.instructions;
      }
      catch(err) {
        console.error("Cannot parse full recipe")
      }

      return {
        ...r,
        preference: 1,
        ingredients: ingredients,
        instructions: instructions
      }
    });
    setLikedRecipes(preferenceUpdatedRecipes);

    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadLikedRecipes();
    }, [])
  );

  return (
    <View style={RecipeStyle.container}>
      {currentRecipeDetails && (
        <RecipeModalDetails
          recipe={currentRecipeDetails}
          visible={modalVisible}
          showLike={true}
          closeModalAfterAction={true}
          onClose={onCloseModalCallback}
          onLike={handleRemoveLike}
        ></RecipeModalDetails>
      )}

      <Text style={RecipeStyle.title}> Favorites:</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#FF6347"
          style={{ marginTop: 20 }}
        />
      ) : likedRecipes.length === 0 ? (
        <Text style={RecipeStyle.title}>
          {" "}
          No favorite recipes at the moment{" "}
        </Text>
      ) : (
        <FlatList
          style={RecipeStyle.list}
          data={likedRecipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <RecipeCard
              title={item.title}
              time={item.time}
              preference={item.preference}
              onPress={() => handlePress(item)}
              onLike={() => handleRemoveLike(item)}
              likeVisible={true}
              hateVisible={false}
            />
          )}
        />
      )}
    </View>
  );
}
