import { StyleSheet } from "react-native";

export const AuthStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#1f2937",
  },
  inputWrapper: {
    marginBottom: 16,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  buttonWrapper: {
    marginTop: 8,
    backgroundColor: "#e5e900",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButton: {
    marginTop: 8,
    backgroundColor: "#e5e7eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#1f2937",
    fontWeight: "600",
    fontSize: 16,
  },
});
