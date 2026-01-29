import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export default function PickUpLocation() {
  const router = useRouter();
  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    })();
  }, []);

  if (!region) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <Ionicons name="location-outline" size={40} color="#FACC15" />
          <Text style={styles.loadingTitle}>Finding your location</Text>
          <Text style={styles.loadingSubtitle}>
            Please wait while we pinpoint you on the map
          </Text>
          <ActivityIndicator size="large" color="#FACC15" style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pickup Location</Text>
      </View>

      {/* Map */}
        <MapView
        style={styles.map}
        initialRegion={region} // only set initial location
        showsUserLocation
        showsMyLocationButton
        onRegionChangeComplete={(r) =>
            setRegion({
            latitude: r.latitude,
            longitude: r.longitude,
            latitudeDelta: r.latitudeDelta,
            longitudeDelta: r.longitudeDelta,
            })
        }
        />


      {/* Center Pin */}
      <View style={styles.pinContainer}>
        <Ionicons name="location-sharp" size={36} color="#FACC15" />
      </View>

      {/* Bottom Info */}
      <View style={styles.bottomCard}>
        <Text style={styles.placeTitle}>Selected Location</Text>
        <Text style={styles.coords}>
          Lat: {region.latitude.toFixed(6)}{"\n"}
          Lng: {region.longitude.toFixed(6)}
        </Text>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={() =>
            router.push(
              `/alert-config?latitude=${region.latitude}&longitude=${region.longitude}`
            )
          }
        >
          <Text style={styles.confirmText}>Choose This Pick</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF6CC",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 12,
  },
  map: {
    flex: 1,
  },
  pinContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -18,
    marginTop: -36,
  },
  bottomCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  placeTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  coords: {
    fontSize: 13,
    color: "#666",
    marginBottom: 16,
  },
  confirmButton: {
    backgroundColor: "#FFE14D",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingCard: {
    backgroundColor: "#FFF6CC",
    paddingVertical: 32,
    paddingHorizontal: 28,
    borderRadius: 20,
    alignItems: "center",
    width: "80%",
  },
  loadingTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  loadingSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#555",
    textAlign: "center",
  },
});
