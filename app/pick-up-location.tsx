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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        setIsLoading(false);
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
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        {/* Back Button */}
        <View style={styles.loadingHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Loading Content */}
        <View style={styles.loadingContent}>
          <View style={styles.loadingCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="location-outline" size={48} color="#FFE14D" />
            </View>
            <Text style={styles.loadingTitle}>Finding your location</Text>
            <Text style={styles.loadingSubtitle}>
              Please wait while we pinpoint you on the map
            </Text>
            <ActivityIndicator size="large" color="#FFE14D" style={{ marginTop: 24 }} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!region) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.loadingContent}>
          <View style={styles.loadingCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="warning-outline" size={48} color="#ef4444" />
            </View>
            <Text style={styles.loadingTitle}>Location not available</Text>
            <Text style={styles.loadingSubtitle}>
              Please enable location permissions and try again
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.retryText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.headerBackButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pickup Location</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={region}
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
        <Ionicons name="location-sharp" size={40} color="#FFE14D" />
      </View>

      {/* Bottom Info */}
      <View style={styles.bottomCard}>
        <Text style={styles.placeTitle}>Selected Location</Text>
        <Text style={styles.coords}>
          Long: {region.longitude.toFixed(6)}, Lat: {region.latitude.toFixed(6)}
        </Text>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={() =>
            router.push(
              `/alert-config?latitude=${region.latitude}&longitude=${region.longitude}`
            )
          }
          activeOpacity={0.8}
        >
          <Text style={styles.confirmText}>Choose This Location</Text>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFF6CC",
  },

  headerBackButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },

  map: {
    flex: 1,
  },

  pinContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -40,
  },

  bottomCard: {
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },

  placeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },

  coords: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },

  confirmButton: {
    backgroundColor: "#FFE14D",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  confirmText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  loadingHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  loadingCard: {
    backgroundColor: "#fff",
    paddingVertical: 40,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },

  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FFF6CC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  loadingTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },

  loadingSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },

  retryButton: {
    backgroundColor: "#FFE14D",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  retryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },
});