import { TouchableOpacity, ViewStyle, Text } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled: boolean;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({ title, onPress, disabled, style }) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={style}>
      <Text> {title} </Text>
    </TouchableOpacity>
  );
};

export default Button;