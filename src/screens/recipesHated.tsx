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
import { RecipeModalDetails } from "../components/recipeDetailsModal";

export default function RecipesHatedScreen({ navigation }: any) {
  const [hatedRecipes, setHatedRecipes] = useState<RecipeCardItem[]>([]);
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

  const handleRemoveHate = async (recipe: RecipeCardItem) => {
    recipe.preference = 0;
    await handlePreferenceRecipeDB(recipe);
    setHatedRecipes((r) => r.filter((ri) => ri.id !== recipe.id));
  };

  const loadHatedRecipes = async () => {
    setLoading(true);

    const recipes = await handleFetchRecipes(-1);
    const preferenceUpdatedRecipes = recipes.map((r: any) => {
      let ingredients = [];
      let instructions = "";

      try {
        const parsed = JSON.parse(r.full_recipe);
        ingredients = parsed.ingredients || [];
        instructions = parsed.instructions;
      } catch (err) {
        console.error("Cannot parse full recipe");
      }

      return {
        ...r,
        preference: -1,
        ingredients: ingredients,
        instructions: instructions,
      };
    });
    setHatedRecipes(preferenceUpdatedRecipes);

    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadHatedRecipes();
    }, [])
  );

  return (
    <View style={RecipeStyle.container}>
      {currentRecipeDetails && (
        <RecipeModalDetails
          recipe={currentRecipeDetails}
          visible={modalVisible}
          showLike={false}
          closeModalAfterAction={true}
          onClose={onCloseModalCallback}
          onLike={handleRemoveHate}
        ></RecipeModalDetails>
      )}

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
              onPress={() => handlePress(item)}
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
