import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface SearchBarProps {
  placeholder: string;
  onPress: (text: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder, onPress }) => {
  const [text, setText] = useState("");

  const handlePress = () => {
    const trimmed = text.trim();

    if (trimmed === "") {
      return;
    }

    onPress(trimmed);
  };

  return (
    <View>
      <TextInput
        placeholder={placeholder}
        value={text}
        onChangeText={setText}
        onSubmitEditing={handlePress}
        returnKeyType="search"
      />
      <TouchableOpacity onPress={handlePress}>
        <Text>Go</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;
