import { useState } from "react";
import { RecipeCardItem } from "../screens/recipeList";
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RecipeModalStyle } from "../styles/recipeModal.style";
import { RecipeCardStyle } from "../styles/recipeCard.style";

interface RecipeModalDetailsProps {
  recipe: RecipeCardItem;
  visible: boolean;
  showLike: boolean;
  closeModalAfterAction: boolean;
  onClose: () => void;
  onLike: (recipe: RecipeCardItem) => void;
}

export const RecipeModalDetails: React.FC<RecipeModalDetailsProps> = ({
  recipe,
  visible,
  showLike,
  closeModalAfterAction,
  onClose,
  onLike,
}) => {
  if (!recipe) {
    return null;
  }

  return (
    <View>
      <Modal
        animationType="slide"
        transparent
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={RecipeModalStyle.overlay}>
          <View style={RecipeModalStyle.modalContent}>
            <TouchableOpacity
              style={RecipeModalStyle.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} />
            </TouchableOpacity>

            <Text style={RecipeModalStyle.title}>
              {recipe?.title || "Recipe Details"}
            </Text>

            <Text style={RecipeModalStyle.subTitle}>
              Duration: {recipe?.time} min
            </Text>

            {showLike && (
              <TouchableOpacity
                onPress={() => {
                  onLike(recipe!);
                  if (closeModalAfterAction) {
                    onClose();
                  }
                }}
                style={RecipeCardStyle.button}
              >
                <Ionicons
                  name={recipe?.preference! > 0 ? "heart" : "heart-outline"}
                  size={28}
                  color="#7b55ed"
                />
              </TouchableOpacity>
            )}

            <Text style={RecipeModalStyle.subTitle}>Ingredients</Text>

            {recipe ? (
              <FlatList
                data={recipe.ingredients}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <Text style={RecipeModalStyle.ingredient}>• {item}</Text>
                )}
              />
            ) : (
              <Text style={RecipeModalStyle.noData}>
                No ingredients available
              </Text>
            )}

            <Text style={RecipeModalStyle.subTitle}>Instructions</Text>

            {recipe?.instructions ? (
              <Text style={RecipeModalStyle.ingredient}>
                • {recipe.instructions}
              </Text>
            ) : (
              <Text style={RecipeModalStyle.noData}>
                No instructions available
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};
