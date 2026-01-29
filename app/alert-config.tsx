import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AlertConfigPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const latitude = params.latitude ? parseFloat(params.latitude as string) : 0;
  const longitude = params.longitude ? parseFloat(params.longitude as string) : 0;

  const [alertDistance, setAlertDistance] = useState("1"); // default 1 km
  const [notificationTypes, setNotificationTypes] = useState({
    vibration: false,
    voice: false,
    popup: false,
  });

  const handleStartTracking = async () => {
    // Validate numeric input
    const distanceNum = parseFloat(alertDistance);
    if (isNaN(distanceNum) || distanceNum <= 0) {
      Alert.alert("Invalid input", "Please enter a valid distance in km.");
      return;
    }

    const dropoffData = {
      latitude,
      longitude,
      alertDistance: distanceNum,
      notificationTypes,
      status: "process" as "process" | "done" | "success" | "cancel",
    };

    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem("ongoingDropoff", JSON.stringify(dropoffData));

      // Navigate to Map tab page
      router.push("/(tabs)/map"); // adjust path according to your tab structure
    } catch (error) {
      console.log("Error saving dropoff data", error);
      Alert.alert("Error", "Failed to save tracking info.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Selected Location */}
      <Text style={styles.sectionTitle}>Selected Location</Text>
      <View style={styles.locationCard}>
        <Text>
          Lat: {latitude.toFixed(6)}{"\n"}
          Lng: {longitude.toFixed(6)}
        </Text>
      </View>

      {/* Alert Distance */}
      <Text style={styles.sectionTitle}>Alert Distance (km)</Text>
      <TextInput
        style={styles.distanceInput}
        value={alertDistance}
        onChangeText={(text) => setAlertDistance(text.replace(/[^0-9.]/g, ""))} // allow only numbers and dot
        keyboardType="numeric"
        placeholder="Enter distance in km"
      />

      {/* Notification Types */}
      <Text style={styles.sectionTitle}>Notification Types</Text>
      {Object.keys(notificationTypes).map((key) => (
        <TouchableOpacity
          key={key}
          style={styles.checkboxContainer}
          onPress={() =>
            setNotificationTypes({
              ...notificationTypes,
              [key]: !notificationTypes[key as keyof typeof notificationTypes],
            })
          }
        >
          <View style={styles.checkbox}>
            {notificationTypes[key as keyof typeof notificationTypes] && (
              <View style={styles.checked} />
            )}
          </View>
          <Text style={styles.checkboxLabel}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}

      <View style={styles.locationCard2}>
        <Text>Tip: Combine multiple alert types for better awareness.</Text>
      </View>

      {/* Start Tracking Button */}
      <TouchableOpacity style={styles.startButton} onPress={handleStartTracking}>
        <Text style={styles.startText}>Start Tracking</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  sectionTitle: { fontWeight: "700", fontSize: 16, marginVertical: 8 },
  locationCard: {
    backgroundColor: "#FFF6CC",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  locationCard2: {
    backgroundColor: "#FFF6CC",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    marginTop: 50,
  },
  distanceInput: {
    borderWidth: 1,
    borderColor: "#666",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 16,
  },
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#666",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checked: { width: 12, height: 12, backgroundColor: "#FACC15" },
  checkboxLabel: { fontSize: 14 },
  startButton: {
    backgroundColor: "#FFE14D",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 50,
  },
  startText: { fontWeight: "700", fontSize: 16 },
});
