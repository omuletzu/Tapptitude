import { StyleSheet } from "react-native";

export const RecipeModalStyle = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 8,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 8,
    color: "#555",
  },
  ingredient: {
    fontSize: 15,
    marginVertical: 3,
    color: "#444",
  },
  noData: {
    marginTop: 10,
    textAlign: "center",
    color: "#777",
  },
});