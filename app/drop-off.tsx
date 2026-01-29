import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function DropOff() {
    const router = useRouter();
  return (
    <SafeAreaView style={styles.mainContainer}>
      
      {/* Content */}
      <View style={styles.container}>

        {/* Choose from Map */}
        <TouchableOpacity
        style={styles.mapButton}
        onPress={() => router.push("/pick-up-location")}
        >
          <Ionicons name="map-outline" size={18} color="#000" />
          <Text style={styles.mapButtonText}>Choose from Map</Text>
        </TouchableOpacity>

        {/* Search Location */}
        <Text style={styles.label}>Search Location</Text>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Enter Address or Location"
            placeholderTextColor="#999"
            style={styles.input}
          />

          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={20} color="#000" />
          </TouchableOpacity>
        </View>

      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },

  container: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },

  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF6CC",
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 32,
  },

  mapButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 30,
    paddingLeft: 16,
  },

  input: {
    flex: 1,
    height: 44,
    fontSize: 14,
  },

  searchButton: {
    backgroundColor: "#FFE14D",
    padding: 12,
    borderRadius: 30,
    marginRight: 4,
  },
});
