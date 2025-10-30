import { StyleSheet } from "react-native";

export const SearchBarStyle = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    minHeight: 55
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f59e0b",
    borderRadius: 8,
    marginLeft: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});