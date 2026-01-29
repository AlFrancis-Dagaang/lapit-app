import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Onboarding() {
  const router = useRouter();

  const handleGetStarted = async () => {
    try {
      // Save onboarding flag
      await AsyncStorage.setItem("hasOnboarded", "true");
      // Navigate to home
      router.replace("/drop-off");
    } catch (e) {
      console.log("Error saving onboarding state:", e);
      Alert.alert("Error", "Failed to save onboarding state. Try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo.png")} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.headline}>Never miss your stop again</Text>

          <Text style={styles.description}>
            We'll alert you when you're getting close to your drop-off so you
            can commute with confidence.
          </Text>

          <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, alignItems: "center", paddingTop: 40, justifyContent: "flex-end" },
  logoContainer: { position: "absolute", top: 195, alignSelf: "center", zIndex: 10 },
  card: {
    width: "100%",
    height: "60%",
    backgroundColor: "#FFE34D",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    justifyContent: "space-around",
  },
  headline: { fontSize: 22, fontWeight: "800", marginBottom: 12, textAlign: "center" },
  description: { fontSize: 14, textAlign: "center", marginBottom: 100, lineHeight: 20 },
  button: { backgroundColor: "#000", paddingVertical: 14, borderRadius: 30, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  logo: { width: 200, height: 200 },
});
