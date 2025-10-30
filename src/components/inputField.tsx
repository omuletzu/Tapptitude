import { TextInput, View } from "react-native";

interface InputProps {
    placeHolder: string,
    value: string,
    onChangeText: (text: string) => void,
    secureTextEntry?: boolean
}

const InputField : React.FC<InputProps> = ({ placeHolder, value, onChangeText, secureTextEntry }) => {
    return (
        <View>
            <TextInput 
                placeholder={placeHolder}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                autoCapitalize="none"
            />
        </View>
    );
}

export default InputField;