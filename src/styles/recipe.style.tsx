import { StyleSheet } from "react-native";

export const RecipeStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 32,
    paddingVertical: 45,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#1f2937",
  },
  searchWrapper: {
    marginBottom: 16,
  },
  list: {
    flex: 1,
    marginBottom: 16,
  },
  buttonWrapper: {
    marginTop: 8,
    backgroundColor: "#7b55edff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#1f2937",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginVertical: 10,
  },
});
