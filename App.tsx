import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/screens/login";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import RegisterScreen from "./src/screens/register";
import RecipeListScreen from "./src/screens/recipeList";
import RecipesLikedScreen from "./src/screens/recipedLiked";
import RecipesHatedScreen from "./src/screens/recipesHated";
import { SafeAreaProvider } from "react-native-safe-area-context";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="RecipeList" component={RecipeListScreen} />
            <Stack.Screen name="RecipesLiked" component={RecipesLikedScreen} />
            <Stack.Screen name="RecipesHated" component={RecipesHatedScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
