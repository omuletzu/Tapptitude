import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import RecipeCard from "../components/recipeCard";
import Button from "../components/button";
import SearchBar from "../components/searchBar";
import { useFocusEffect } from "@react-navigation/native";
import {
  fetchRecipesBE,
  handlePreferenceRecipeDB,
} from "../services/recipeService";
import { RecipeStyle } from "../styles/recipe.style";
import { SafeAreaView } from "react-native-safe-area-context";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { RecipeModalDetails } from "../components/recipeDetailsModal";

export interface RecipeCardItem {
  id: string;
  title: string;
  time: number;
  ingredients: string[];
  instructions: string;
  preference: number;
}

export default function RecipeListScreen({ navigation }: any) {
  const [recipes, setRecipes] = useState<RecipeCardItem[]>([]);
  const [currentRecipeDetails, setCurrentRecipeDetails] =
    useState<RecipeCardItem>();
  const [modalVisible, setModalVisible] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const onTextChange = (text: string) => {
    setPrompt(text);
  };

  const navigateTo = (page: string) => {
    navigation.navigate(page);
  };

  const handlePress = (recipe: RecipeCardItem) => {
    setCurrentRecipeDetails(recipe);
    setModalVisible(true);
  };

  const handleLike = async (recipe: RecipeCardItem) => {
    setLoading(true);

    const updatedRecipe = recipe;
    updatedRecipe.preference = recipe.preference === 1 ? 0 : 1;

    setRecipes((recipes) =>
      recipes
        .filter((r) => r.id !== undefined)
        .map((r) => (r.id === recipe.id ? updatedRecipe : r))
    );

    await handlePreferenceRecipeDB(updatedRecipe);

    setLoading(false);
  };

  const handleHate = async (recipe: RecipeCardItem) => {
    setLoading(true);

    setRecipes((recipes) =>
      recipes.map((r) =>
        r.id === recipe.id
          ? { ...r, preference: r.preference === -1 ? 0 : -1 }
          : r
      )
    );

    await handlePreferenceRecipeDB(recipe);

    setLoading(false);
  };

  const handleFetchRecipes = async (prompt: string) => {
    if (loading || prompt.length === 0) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetchRecipesBE(prompt);
      const newRecipesList = (response || []).map((r: RecipeCardItem) => ({
        ...r,
        preference: 0,
        id: uuidv4(),
      }));

      setRecipes(newRecipesList);
    } catch (err) {
      console.error(err);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const onCloseModalCallback = () => {
    setModalVisible(false);
    setCurrentRecipeDetails(undefined);
  };

  useFocusEffect(
    useCallback(() => {
      return () => {};
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {currentRecipeDetails && (
        <RecipeModalDetails
          recipe={currentRecipeDetails}
          visible={modalVisible}
          onClose={onCloseModalCallback}
          onLike={handleLike}
        ></RecipeModalDetails>
      )}

      <View style={RecipeStyle.buttonsRow}>
        <Button
          title="Favourites"
          onPress={() => navigateTo("RecipesLiked")}
          disabled={false}
        />

        <Button
          title="Hated"
          onPress={() => navigateTo("RecipesHated")}
          disabled={false}
        />
      </View>

      <View style={RecipeStyle.container}>
        <View style={RecipeStyle.searchWrapper}>
          <SearchBar
            placeholder="What do you feel like eating?"
            onPress={handleFetchRecipes}
            onTextChange={onTextChange}
          />
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#FF6347"
            style={{ marginTop: 20 }}
          />
        ) : recipes.length === 0 ? (
          <Text style={RecipeStyle.title}> Try generating some recipes </Text>
        ) : (
          <FlatList
            style={RecipeStyle.list}
            data={recipes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RecipeCard
                title={item.title}
                time={item.time}
                preference={item.preference}
                onPress={() => handlePress(item)}
                onLike={() => handleLike(item)}
                onHate={() => handleHate(item)}
                likeVisible={true}
                hateVisible={true}
              />
            )}
          />
        )}

        <View style={RecipeStyle.buttonWrapper}>
          <Button
            title="I don't like these"
            onPress={() => handleFetchRecipes(prompt)}
            disabled={prompt.length === 0 || loading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
