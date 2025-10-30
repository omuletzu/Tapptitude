import { Text } from "react-native";

interface ErrorTextProps {
  message: string;
}

const ErrorText: React.FC<ErrorTextProps> = ({ message }) => {
  if (!message) {
    return null;
  }

  return <Text> {message} </Text>;
};

export default ErrorText;
