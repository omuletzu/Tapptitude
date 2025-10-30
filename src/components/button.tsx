import { TouchableOpacity, ViewStyle, Text } from "react-native";
import { RecipeStyle } from "../styles/recipe.style";

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled: boolean;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({ title, onPress, disabled, style }) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={style}>
      <Text style={RecipeStyle.buttonText}> {title} </Text>
    </TouchableOpacity>
  );
};

export default Button;