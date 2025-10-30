import { Image, Text, TouchableOpacity, View, ViewBase } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';


interface RecipeCardProps {
  title: string;
  time: string | number;
  preference: number,
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
  imageUrl,
  onPress,
  onLike,
  onHate,
  likeVisible,
  hateVisible,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      {imageUrl && <Image source={{ uri: imageUrl }} />}
      <View>
        <Text>{title}</Text>
        <Text>{time} min</Text>
        <View>
          {likeVisible && (
            <TouchableOpacity onPress={onLike}>
              <Icon
                name="heart"
                size={30}
                color="green"
              />
            </TouchableOpacity>
          )}
          {hateVisible && (
            <TouchableOpacity onPress={onLike}>
              <Icon
                name="thumb-down"
                size={30}
                color="green"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RecipeCard;
