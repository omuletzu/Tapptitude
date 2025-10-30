import { useState } from "react";
import { Text, View } from "react-native";
import { supabase } from "../api/supabaseClient";
import InputField from "../components/inputField";
import Button from "../components/button";
import ErrorText from "../components/errorText";
import { AuthStyle } from "../styles/auth.style";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [disabledBtn, setDisabledBtn] = useState(false);

  const handleLogin = async () => {
    if (!email) {
      setError("Empty email field");
      return;
    }

    if (!password) {
      setError("Empty password field");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    navigation.replace("RecipeList");
  };

  const handleSwitchPages = () => {
    navigation.replace("Register");
  };

  return (
    <View style={AuthStyle.container}>
      <View style={AuthStyle.card}>
        <Text style={AuthStyle.title}> Login </Text>

        <View style={AuthStyle.inputWrapper}>
          <InputField
            placeHolder="Email"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={AuthStyle.inputWrapper}>
          <InputField
            placeHolder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />
        </View>

        {error ? <Text style={AuthStyle.errorText}> {error} </Text> : null}

        <View style={AuthStyle.buttonWrapper}>
          <Button title="Login" onPress={handleLogin} disabled={disabledBtn} />
        </View>

        <View style={AuthStyle.secondaryButton}>
          <Button
            title="Create an account"
            onPress={handleSwitchPages}
            disabled={false}
          />
        </View>
      </View>
    </View>
  );
}
