import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

interface DropoffData {
  latitude: number;
  longitude: number;
  alertDistance: number;
  notificationTypes: {
    vibration: boolean;
    voice: boolean;
    popup: boolean;
  };
  status: "process" | "done" | "success" | "cancel";
  alertHappened?: boolean;
}

export default function MapPage() {

  const router = useRouter();
  const [dropoff, setDropoff] = useState<DropoffData | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distanceToDropoff, setDistanceToDropoff] = useState<number | null>(null);
  const mapRef = useRef<MapView>(null);

  // Load dropoff data from storage
  useEffect(() => {
    const loadDropoff = async () => {
      const data = await AsyncStorage.getItem("dropoffs"); // load array
      if (data) {
        const list = JSON.parse(data) as DropoffData[];
        // Pick the latest dropoff with status process or done (EXCLUDE cancel and success)
        const latest = list.find(d => d.status === "process" || d.status === "done");
        if (latest) {
          setDropoff(latest);

          // if (!latest.alertHappened) {
          //   setTimeout(() => triggerAlerts(latest), 10000); // optional
          // }
        }
      }
    };
    loadDropoff();
  }, []);


    useEffect(() => {
    if (!dropoff || !userLocation) return;

    // Already happened? skip
    if (dropoff.alertHappened) return;

    // Compute distance (km)
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(dropoff.latitude - userLocation.latitude);
    const dLon = toRad(dropoff.longitude - userLocation.longitude);
    const lat1 = toRad(userLocation.latitude);
    const lat2 = toRad(dropoff.latitude);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    setDistanceToDropoff(distance);

    // Trigger alert if within alertDistance
    if (distance <= dropoff.alertDistance) {
      triggerAlerts(dropoff);
    }
  }, [userLocation, dropoff]);


  // Track user location
  useEffect(() => {
    let subscriber: Location.LocationSubscription;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      subscriber = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Highest, distanceInterval: 1 },
        (loc) => {
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      );
    };

    startTracking();
    return () => subscriber?.remove();
  }, []);

  // Update distance to dropoff
  useEffect(() => {
    if (dropoff && userLocation) {
      const toRad = (v: number) => (v * Math.PI) / 180;
      const R = 6371; // km
      const dLat = toRad(dropoff.latitude - userLocation.latitude);
      const dLon = toRad(dropoff.longitude - userLocation.longitude);
      const lat1 = toRad(userLocation.latitude);
      const lat2 = toRad(dropoff.latitude);

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      setDistanceToDropoff(distance);
    }
  }, [dropoff, userLocation]);

  // Trigger alerts (vibration, popup, voice)
  const triggerAlerts = async (dropoff: DropoffData) => {
    if (!dropoff) return;

    const { vibration, voice, popup } = dropoff.notificationTypes;

    // Vibration: long 5 seconds
    if (vibration) Vibration.vibrate([1000, 500, 1000, 500, 1000], false);

    // Voice
    if (voice) Speech.speak("Drop-off nearby! Please be ready.");

    // Popup
    if (popup) Alert.alert("Drop-off Alert", "You are near your drop-off location!");

    // Save alertHappened = true and mark done
    const updated = { ...dropoff, alertHappened: true, status: "done" as const };
    
    // Update in the dropoffs array
    const data = await AsyncStorage.getItem("dropoffs");
    if (data) {
      const list = JSON.parse(data) as DropoffData[];
      const index = list.findIndex(d => 
        d.latitude === dropoff.latitude && 
        d.longitude === dropoff.longitude &&
        d.alertDistance === dropoff.alertDistance
      );
      if (index !== -1) {
        list[index] = updated;
        await AsyncStorage.setItem("dropoffs", JSON.stringify(list));
      }
    }
    
    await AsyncStorage.setItem("ongoingDropoff", JSON.stringify(updated));
    setDropoff(updated);
  };


  // Cancel dropoff
  const handleCancel = () => {
    Alert.alert(
      "Cancel Drop-off",
      "Are you sure? You are not yet at your drop-off location.",
      [
        { text: "No" },
        {
          text: "Yes",
          onPress: async () => {
            if (dropoff) {
              const updated = { ...dropoff, status: "cancel" as const };
              
              // Update the dropoffs array to mark as cancelled
              const data = await AsyncStorage.getItem("dropoffs");
              if (data) {
                const list = JSON.parse(data) as DropoffData[];
                const index = list.findIndex(d => 
                  d.latitude === dropoff.latitude && 
                  d.longitude === dropoff.longitude &&
                  d.alertDistance === dropoff.alertDistance
                );
                if (index !== -1) {
                  list[index] = updated;
                  await AsyncStorage.setItem("dropoffs", JSON.stringify(list));
                }
              }
              
              await AsyncStorage.setItem("ongoingDropoff", JSON.stringify(updated));
              setDropoff(null); // Clear the dropoff from state so it doesn't show when coming back
              router.push("/home");
            }
          },
        },
      ]
    );
  };

  // Done dropoff
  const handleDone = async () => {
    if (!dropoff) return;

    // Mark as success (not just done)
    const successDropoff = { ...dropoff, status: "success" as const };
    
    // Update in the dropoffs array
    const data = await AsyncStorage.getItem("dropoffs");
    if (data) {
      const list = JSON.parse(data) as DropoffData[];
      const index = list.findIndex(d => 
        d.latitude === dropoff.latitude && 
        d.longitude === dropoff.longitude &&
        d.alertDistance === dropoff.alertDistance
      );
      if (index !== -1) {
        list[index] = successDropoff;
        await AsyncStorage.setItem("dropoffs", JSON.stringify(list));
      }
    }

    // Save a copy as success in completedDropoffs
    try {
      const completedData = await AsyncStorage.getItem("completedDropoffs");
      let completed: DropoffData[] = completedData ? JSON.parse(completedData) : [];
      completed.push(successDropoff);
      await AsyncStorage.setItem("completedDropoffs", JSON.stringify(completed));
    } catch (err) {
      console.log("Error saving completed drop-off", err);
    }

    // Remove ongoing dropoff
    await AsyncStorage.removeItem("ongoingDropoff");
    setDropoff(null);
    router.push("/home");
  };

  const defaultRegion = {
    latitude: 14.6438,
    longitude: 121.0422,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };



// ...

  return (
    <SafeAreaView style={{flex:1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Tracking Drop-off</Text>
          {dropoff ? (
            <>
              <Text style={styles.distanceText}>
                Alert Distance: {dropoff.alertDistance} km
              </Text>
              {distanceToDropoff !== null && (
                <Text style={styles.distanceText}>
                  Distance to Drop-off: {distanceToDropoff.toFixed(2)} km
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.distanceText}>No ongoing drop-off</Text>
          )}
        </View>

        <MapView
          ref={mapRef}
          style={[styles.map, !dropoff && { backgroundColor: "#e0e0e0" }]}
          initialRegion={
            dropoff || userLocation
              ? {
                  latitude: dropoff?.latitude || userLocation?.latitude || 14.6438,
                  longitude: dropoff?.longitude || userLocation?.longitude || 121.0422,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }
              : { latitude: 14.6438, longitude: 121.0422, latitudeDelta: 0.01, longitudeDelta: 0.01 }
          }
          showsUserLocation={!!dropoff}
          scrollEnabled={!!dropoff}
          zoomEnabled={!!dropoff}
        >
          {dropoff && (
            <Marker
              coordinate={{ latitude: dropoff.latitude, longitude: dropoff.longitude }}
              title="Drop-off Location"
            />
          )}
        </MapView>
        </View>
        <TouchableOpacity
          style={[
            styles.bottomCard,
            dropoff?.status === "process"
              ? { backgroundColor: "#FF6B6B" } // red for cancel
              : dropoff?.status === "done"
              ? { backgroundColor: "#4ADE80" } // green for done
              : { backgroundColor: "#FFF6CC" }, // no active drop-off
          ]}
          activeOpacity={0.8}
          onPress={() => {
            if (!dropoff) return;
            if (dropoff.status === "process") handleCancel();
            else if (dropoff.status === "done") handleDone();
          }}
        >
          <Text style={[
            styles.buttonText,
            { color: dropoff ? "#ffffff" : "#555" } // white text for active, gray for no dropoff
          ]}>
            {dropoff
              ? dropoff.status === "process"
                ? "Cancel"
                : "Done"
              : "No Active Drop-off"}
          </Text>
        </TouchableOpacity>





    </SafeAreaView>
  );

}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, backgroundColor: "#FFF6CC", alignItems: "center" },
  headerText: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  distanceText: { fontSize: 14, color: "#555" },
  map: { flex: 1 },
  bottomCard: {
    position: "absolute",   // ⬅️ absolutely position at bottom
    bottom: 0,              // ⬅️ stick to bottom
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,             // ⬅️ on top of map
    paddingBottom: 20,      // ⬅️ optional extra for iPhone home indicator
  },

  cancelButton: { backgroundColor: "#FF6B6B", paddingVertical: 12, paddingHorizontal: 40, borderRadius: 30 },
  doneButton: { backgroundColor: "#4ADE80", paddingVertical: 12, paddingHorizontal: 40, borderRadius: 30 },
  buttonText: { fontWeight: "700", fontSize: 22, color: "#000" },
  noDropoffContainer: { backgroundColor: "#FFF6CC", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30 },
  noDropoffText: { fontWeight: "700", fontSize: 16, color: "#555" },
});