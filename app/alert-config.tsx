import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
  const isEdit = params.isEdit === "true";
  const dropoffId = params.dropoffId as string;

  const [alertDistance, setAlertDistance] = useState(
    params.alertDistance ? params.alertDistance as string : "0.5"
  );
  const [notificationTypes, setNotificationTypes] = useState({
    vibration: false,
    voice: false,
    popup: false,
  });

  // Load existing notification settings if editing
  useEffect(() => {
    if (isEdit && dropoffId) {
      loadExistingSettings();
    }
  }, [isEdit, dropoffId]);

  const loadExistingSettings = async () => {
    try {
      const existing = await AsyncStorage.getItem("dropoffs");
      if (existing) {
        const list = JSON.parse(existing);
        const dropoff = list.find((d: any) => d.id === dropoffId);
        if (dropoff && dropoff.notificationTypes) {
          setNotificationTypes(dropoff.notificationTypes);
        }
      }
    } catch (error) {
      console.log("Error loading settings", error);
    }
  };

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
      alertHappened: false,
      createdAt: new Date().toISOString(),
    };

    try {
      if (isEdit && dropoffId) {
        // Update existing dropoff
        const existing = await AsyncStorage.getItem("dropoffs");
        const list = existing ? JSON.parse(existing) : [];
        const index = list.findIndex((d: any) => d.id === dropoffId);
        
        if (index !== -1) {
          list[index] = { ...list[index], ...dropoffData };
          await AsyncStorage.setItem("dropoffs", JSON.stringify(list));
          await AsyncStorage.setItem("ongoingDropoff", JSON.stringify(list[index]));
        }
      } else {
        // Create new dropoff
        const existing = await AsyncStorage.getItem("dropoffs");
        const list = existing ? JSON.parse(existing) : [];
        const newDropoff = { id: Date.now().toString(), ...dropoffData };
        list.unshift(newDropoff);
        await AsyncStorage.setItem("dropoffs", JSON.stringify(list));
        await AsyncStorage.setItem("ongoingDropoff", JSON.stringify(newDropoff));
      }

      // Navigate to Map tab page
      router.push("/(tabs)/map");
    } catch (error) {
      console.log("Error saving dropoff data", error);
      Alert.alert("Error", "Failed to save tracking info.");
    }
  };

  const toggleNotification = (key: keyof typeof notificationTypes) => {
    setNotificationTypes({
      ...notificationTypes,
      [key]: !notificationTypes[key],
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Selected Location */}
        <Text style={styles.sectionTitle}>Selected Location</Text>
        <View style={styles.locationCard}>
          <Text style={styles.locationText}>
            Long: {longitude.toFixed(4)}, Lat: {latitude.toFixed(4)}
          </Text>
        </View>

        {/* Alert Distance */}
        <Text style={styles.sectionTitle}>Alert Distance</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.distanceInput}
            value={alertDistance}
            onChangeText={(text) => setAlertDistance(text.replace(/[^0-9.]/g, ""))}
            keyboardType="numeric"
            placeholder="0.5"
          />
          <View style={styles.kmBadge}>
            <Text style={styles.kmText}>km</Text>
          </View>
        </View>

        {/* Notification Types */}
        <Text style={styles.sectionTitle}>Notification types</Text>
        
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => toggleNotification("vibration")}
          activeOpacity={0.7}
        >
          <View style={styles.checkboxWrapper}>
            <View style={[
              styles.checkbox,
              notificationTypes.vibration && styles.checkboxChecked
            ]}>
              {notificationTypes.vibration && (
                <Ionicons name="checkmark" size={14} color="#000" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Vibration</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => toggleNotification("voice")}
          activeOpacity={0.7}
        >
          <View style={styles.checkboxWrapper}>
            <View style={[
              styles.checkbox,
              notificationTypes.voice && styles.checkboxChecked
            ]}>
              {notificationTypes.voice && (
                <Ionicons name="checkmark" size={14} color="#000" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Voice</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => toggleNotification("popup")}
          activeOpacity={0.7}
        >
          <View style={styles.checkboxWrapper}>
            <View style={[
              styles.checkbox,
              notificationTypes.popup && styles.checkboxChecked
            ]}>
              {notificationTypes.popup && (
                <Ionicons name="checkmark" size={14} color="#000" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Pop-up</Text>
          </View>
        </TouchableOpacity>

        {/* Tip Box */}
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>
            Tip: Combine multiple alert types for better awareness.
          </Text>
        </View>

        {/* Start Tracking Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartTracking}
          activeOpacity={0.8}
        >
          <Text style={styles.startText}>
            {isEdit ? "Track Again" : "Start Tracking"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
    marginTop: 8,
  },

  locationCard: {
    backgroundColor: "#FFF6CC",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },

  locationText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    backgroundColor: "#fff",
  },

  distanceInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
    color: "#000",
  },

  kmBadge: {
    backgroundColor: "#FFE14D",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  kmText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },

  checkboxRow: {
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  checkboxWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: "#999",
    borderRadius: 4,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  checkboxChecked: {
    backgroundColor: "#FFE14D",
    borderColor: "#FFE14D",
  },

  checkboxLabel: {
    fontSize: 15,
    color: "#000",
    fontWeight: "500",
  },

  tipBox: {
    backgroundColor: "#FFF6CC",
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 32,
  },

  tipText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },

  startButton: {
    backgroundColor: "#FFE14D",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  startText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#000",
  },
});