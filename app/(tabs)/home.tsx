import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function Home(){
    const router = useRouter();
    return(
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.viewContainer} >
        <Image
          source={require("./../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.text}>
          Monitor your drop-offs
        </Text>
      </View>

      <View style={styles2.container}>
        
        {/* Circle with icon */}
        <View style={styles2.circle}>
          <Ionicons name="location-outline" size={42} color="#8a8a8a" />
        </View>

        {/* Title */}
        <Text style={styles2.title}>No Recent Drop-offs</Text>

        {/* Subtitle */}
        <Text style={styles2.subtitle}>
          Create your first drop-off to get started
        </Text>
      </View>

      <View style={styles.viewContainer2}>
        <TouchableOpacity style={styles2.button}
        onPress={() => router.push("/drop-off")}>
          <Text style={styles2.buttonText}>+ Add New Drop-Off</Text>
        </TouchableOpacity>    
      </View>
    </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingHorizontal: 5,
    backgroundColor: "#fff",
  },
  viewContainer:{
    width: "100%",
  },
  logo: { 
    width: 100, 
    height:50
  },
  text: {
    fontSize:10,
  },
   circle: {
    width: 120,
    height: 120,
    borderRadius: 60, // half of width/height
    backgroundColor: "#2563eb", // optional
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  viewContainer2: {
    alignItems: "center",
    
  }

});

const styles2 = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#FFF6CC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },

  button: {
    backgroundColor: "#FFE14D",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    width: 250,
    alignItems: "center",
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
