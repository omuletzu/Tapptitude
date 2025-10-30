import { useState } from "react";
import { Text, View } from "react-native";
import { supabase } from "../api/supabaseClient";
import InputField from "../components/inputField";
import ErrorText from "../components/errorText";
import Button from "../components/button";

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [disabledBtn, setDisabledBtn] = useState(false);

  const createUserDB = async () => {
    const { data } = await supabase.auth.getUser();

    if (!data) {
      return;
    }

    const currentUser = data.user;

    const { error } = await supabase
      .from("users")
      .insert([{ id: currentUser?.id, email: currentUser?.email }]);

    if (error) {
      console.log(error);
      setError("Error registering user");
    }
  };

  const handleRegister = async () => {
    if (!email) {
      setError("Empty email field");
      return;
    }

    if (!password) {
      setError("Empty password field");
      return;
    }

    if (!confirmPassword) {
      setError("Empty confirmation password field");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    await createUserDB();

    navigation.replace("RecipeList");
  };

  const handleSwitchPages = () => {
    navigation.replace("Login");
  };

  return (
    <View>
      <InputField placeHolder="Email" value={email} onChangeText={setEmail} />

      <InputField
        placeHolder="Password"
        value={password}
        onChangeText={setPassword}
      />

      <InputField
        placeHolder="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {error ? <ErrorText message={error} /> : null}

      <Button
        title="Register"
        onPress={handleRegister}
        disabled={disabledBtn}
      />

      <Button
        title="Already having an account?"
        onPress={handleSwitchPages}
        disabled={false}
      />
    </View>
  );
}
