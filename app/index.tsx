import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

// Haversine formula to calculate distance in km
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Index() {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [dropOffLocation, setDropOffLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 14.5995,
    longitude: 120.9842,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const locationSubscription = useRef<any>(null);

  // Get user permission and start location tracking
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Enable location to use this feature");
        return;
      }
      setHasLocationPermission(true);

      // Get initial location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });
      setRegion({ ...region, latitude, longitude });

      // Track user location continuously
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000, // update every second
          distanceInterval: 1, // update every 1 meter
        },
        (loc) => {
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      );
    })();

    // Cleanup on unmount
    return () => {
      if (locationSubscription.current) locationSubscription.current.remove();
    };
  }, []);

  // Distance calculation
  const distanceRemaining = dropOffLocation && userLocation
    ? getDistance(userLocation.latitude, userLocation.longitude, dropOffLocation.latitude, dropOffLocation.longitude)
    : 0;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        zoomEnabled={true}
        scrollEnabled={true}
        onRegionChangeComplete={(newRegion) => setDropOffLocation({ latitude: newRegion.latitude, longitude: newRegion.longitude })}
        minZoomLevel={5}
        maxZoomLevel={20}
      >
        {/* Drop-off Marker */}
        {dropOffLocation && <Marker coordinate={dropOffLocation} title="Drop-Off" pinColor="red" />}
      </MapView>

      {/* Info Panel */}
      <View style={styles.info}>
        {dropOffLocation ? (
          <>
            <Text>Drop-off Location:</Text>
            <Text>Lat: {dropOffLocation.latitude.toFixed(6)}</Text>
            <Text>Lng: {dropOffLocation.longitude.toFixed(6)}</Text>
            <Text>Distance remaining: {distanceRemaining.toFixed(2)} km</Text>
          </>
        ) : (
          <Text>Pin the drop-off location by moving the map</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  info: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 10,
    borderRadius: 8,
  },
});
