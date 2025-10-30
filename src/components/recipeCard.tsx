import { Image, Text, TouchableOpacity, View, ViewBase } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RecipeCardStyle } from "../styles/recipeCard.style";

interface RecipeCardProps {
  title: string;
  time: string | number;
  preference: number;
  imageUrl?: string;
  onPress?: () => void;
  onLike?: () => void;
  onHate?: () => void;
  likeVisible: boolean;
  hateVisible: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  title,
  time,
  preference,
  imageUrl,
  onPress,
  onLike,
  onHate,
  likeVisible,
  hateVisible,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={RecipeCardStyle.card}>
      {imageUrl && (
        <Image source={{ uri: imageUrl }} style={RecipeCardStyle.image} />
      )}
      <View style={RecipeCardStyle.content}>
        <View style={RecipeCardStyle.textContainer}>
          <Text style={RecipeCardStyle.title}>{title}</Text>
          <Text style={RecipeCardStyle.time}>{time} min</Text>
        </View>
        <View style={RecipeCardStyle.buttons}>
          {likeVisible && (
            <TouchableOpacity onPress={onLike} style={RecipeCardStyle.button}>
              <Ionicons
                name={preference > 0 ? "heart" : "heart-outline"}
                size={28}
                color="#7b55ed"
              />
            </TouchableOpacity>
          )}
          {hateVisible && (
            <TouchableOpacity onPress={onHate} style={RecipeCardStyle.button}>
              <Ionicons
                name={preference < 0 ? "thumbs-down" : "thumbs-down-outline"}
                size={28}
                color="#7b55ed"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RecipeCard;
