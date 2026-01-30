import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Dropoff = {
  id: string;
  latitude: number;
  longitude: number;
  alertDistance: number;
  createdAt: string;
  notificationTypes?: {
    vibration: boolean;
    voice: boolean;
    popup: boolean;
  };
};

export default function DropOff() {
  const router = useRouter();
  const [dropoffs, setDropoffs] = useState<Dropoff[]>([]);

  // Load data whenever page gains focus
  useFocusEffect(
    useCallback(() => {
      loadDropoffs();
    }, [])
  );

  const loadDropoffs = async () => {
    const data = await AsyncStorage.getItem("dropoffs");
    if (data) {
      setDropoffs(JSON.parse(data));
    } else {
      setDropoffs([]);
    }
  };

  const handleCardPress = (item: Dropoff) => {
    // Navigate to alert-config with the dropoff data
    router.push({
      pathname: "/alert-config",
      params: {
        latitude: item.latitude.toString(),
        longitude: item.longitude.toString(),
        alertDistance: item.alertDistance.toString(),
        dropoffId: item.id,
        isEdit: "true",
      },
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Set 1 day ago";
    return `Set ${diffDays} days ago`;
  };

  const renderItem = ({ item }: { item: Dropoff }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleCardPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.iconBox}>
        <Ionicons name="location-outline" size={28} color="#333" />
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardDistance}>{item.alertDistance}km</Text>
        <Text style={styles.cardTime}>{getTimeAgo(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.container}>
        {/* Choose from Map Button */}
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => router.push("/pick-up-location")}
          activeOpacity={0.7}
        >
          <Ionicons name="map-outline" size={20} color="#000" />
          <Text style={styles.mapButtonText}>Choose from Map</Text>
        </TouchableOpacity>

        {/* Recent Drop-off Section */}
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Recent Drop-off</Text>
          
          {dropoffs.length > 0 ? (
            <FlatList
              data={dropoffs}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="location-outline" size={40} color="#ccc" />
              </View>
              <Text style={styles.emptyTitle}>No Recent Drop-offs</Text>
              <Text style={styles.emptySubtitle}>
                Use the button above to set your first drop-off location
              </Text>
            </View>
          )}
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
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF6CC",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },

  mapButtonText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },

  recentSection: {
    flex: 1,
  },

  recentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#FFF6CC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  cardContent: {
    flex: 1,
  },

  cardDistance: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },

  cardTime: {
    fontSize: 13,
    color: "#999",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },

  emptyIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
});