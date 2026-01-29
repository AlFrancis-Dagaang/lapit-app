import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

export default function Splash() {
  const router = useRouter();

    useEffect(() => {
    const checkOnboarding = async () => {
        try {
        const hasOnboarded = await AsyncStorage.getItem("hasOnboarded");
        console.log("Splash hasOnboarded:", hasOnboarded); // debug

        await new Promise((resolve) => setTimeout(resolve, 2000));

        router.replace(hasOnboarded === "true" ? "/home" : "/onboarding");
        } catch (e) {
        console.log("Error reading AsyncStorage:", e);
        router.replace("/onboarding");
        }
    };

    checkOnboarding();
    }, []);

    //For testing the onboarding
//     useEffect(() => {
//   const resetAndCheck = async () => {
//     await AsyncStorage.removeItem("hasOnboarded"); // reset
//     const hasOnboarded = await AsyncStorage.getItem("hasOnboarded");
//     await new Promise((resolve) => setTimeout(resolve, 2000));
//     router.replace(hasOnboarded === "true" ? "/home" : "/onboarding");
//   };
//   resetAndCheck();
// }, []);



  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: 180,
    height: 180,
  },
});
