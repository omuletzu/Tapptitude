import { useState } from "react";
import { View } from "react-native";
import { supabase } from "../api/supabaseClient";
import InputField from "../components/inputField";
import Button from "../components/button";
import ErrorText from "../components/errorText";
import { LoginStyle } from "../styles/login.style";

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
    <View>
      <InputField placeHolder="Email" value={email} onChangeText={setEmail} />

      <InputField
        placeHolder="Password"
        value={password}
        onChangeText={setPassword}
      />

      {error ? <ErrorText message={error} /> : null}

      <Button title="Login" onPress={handleLogin} disabled={disabledBtn} />

      <Button
        title="Create an account"
        onPress={handleSwitchPages}
        disabled={false}
      />
    </View>
  );
}
