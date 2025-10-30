import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SearchBarStyle } from "../styles/search.style";
import Ionicons from '@expo/vector-icons/Ionicons';

interface SearchBarProps {
  placeholder: string;
  onPress: (text: string) => void;
  onTextChange: (text: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  onPress,
  onTextChange,
}) => {
  const [text, setText] = useState("");

  const handlePress = () => {
    const trimmed = text.trim();

    if (trimmed === "") {
      return;
    }

    onPress(trimmed);
  };

  return (
    <View style={SearchBarStyle.container}>
      <TextInput
        style={SearchBarStyle.input}
        placeholder={placeholder}
        value={text}
        multiline={true}
        numberOfLines={3}
        onChangeText={(x) => {
          setText(x);
          onTextChange(x);
        }}
        onSubmitEditing={handlePress}
        returnKeyType="search"
      />
      <TouchableOpacity style={SearchBarStyle.button} onPress={handlePress}>
        <Ionicons name="search" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;
