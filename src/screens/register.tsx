import { useState } from "react";
import { Text, View } from "react-native";
import { supabase } from "../api/supabaseClient";
import InputField from "../components/inputField";
import ErrorText from "../components/errorText";
import Button from "../components/button";
import { AuthStyle } from "../styles/auth.style";

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
    <View style={AuthStyle.container}>
      <View style={AuthStyle.card}>
        <Text style={AuthStyle.title}> Register </Text>

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

        <View style={AuthStyle.inputWrapper}>
          <InputField
            placeHolder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
          />
        </View>

        {error ? <Text style={AuthStyle.errorText}> {error} </Text> : null}

        <View style={AuthStyle.buttonWrapper}>
          <Button title="Register" onPress={handleRegister} disabled={disabledBtn} />
        </View>

        <View style={AuthStyle.secondaryButton}>
          <Button
            title="Already having an account?"
            onPress={handleSwitchPages}
            disabled={false}
          />
        </View>
      </View>
    </View>
  );
}
