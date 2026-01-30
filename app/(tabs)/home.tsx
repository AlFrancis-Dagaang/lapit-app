import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
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

export default function Home() {
  const router = useRouter();
  const [dropoffs, setDropoffs] = useState<Dropoff[]>([]);

  // Load data whenever Home gains focus
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

  const confirmDelete = (id: string) => {
    Alert.alert(
      "Delete Drop-off",
      "Are you sure you want to delete this drop-off?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => deleteDropoff(id),
          style: "destructive",
        },
      ]
    );
  };

  const deleteDropoff = async (id: string) => {
    const updated = dropoffs.filter((d) => d.id !== id);
    setDropoffs(updated);
    await AsyncStorage.setItem("dropoffs", JSON.stringify(updated));
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
        <Text style={styles.cardTitle}>
          Long: {item.longitude.toFixed(4)}, Lat: {item.latitude.toFixed(4)}
        </Text>
        <Text style={styles.cardSub}>{item.alertDistance}km</Text>
        <Text style={styles.cardTime}>
          Set {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation(); // Prevent card press when deleting
          confirmDelete(item.id);
        }}
        activeOpacity={0.6}
      >
        <Ionicons name="trash-outline" size={20} color="#999" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/logo.png")} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.subtitle}>Monitor your drop-offs</Text>
        </View>

        {/* EMPTY STATE */}
        {dropoffs.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.circle}>
              <Ionicons name="location-outline" size={42} color="#8a8a8a" />
            </View>
            <Text style={styles.emptyTitle}>No Recent Drop-offs</Text>
            <Text style={styles.emptySub}>
              Create your first drop-off to get started
            </Text>
          </View>
        )}

        {/* RECENT LIST */}
        {dropoffs.length > 0 && (
          <View style={styles.listContainer}>
            <FlatList
              data={dropoffs}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>
        )}

        {/* ADD BUTTON - Fixed at bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/drop-off")}
            activeOpacity={0.8}
          >
            <Text style={styles.addText}>+ Add New Drop-Off</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  header: {
    paddingTop: 16,
    paddingBottom: 24,
  },

  logoContainer: {
    marginBottom: 4,
  },

  logo: {
    width: 120,
    height: 40,
  },

  subtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
  },

  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FFF6CC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },

  emptySub: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },

  listContainer: {
    flex: 1,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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

  cardTitle: {
    fontWeight: "600",
    fontSize: 13,
    color: "#333",
    marginBottom: 4,
  },

  cardSub: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
    marginBottom: 2,
  },

  cardTime: {
    fontSize: 12,
    color: "#999",
  },

  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  buttonContainer: {
    paddingVertical: 20,
    paddingBottom: 24,
  },

  addButton: {
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

  addText: {
    fontWeight: "700",
    fontSize: 15,
    color: "#000",
  },
});