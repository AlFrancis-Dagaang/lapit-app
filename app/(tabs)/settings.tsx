import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Settings(){
    return(
    <SafeAreaView style={styles.mainContainer}>
      <Text style={styles.text}>SETTINGS</Text>
      <StatusBar style="dark" />
    </SafeAreaView>

    );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontSize: 24,
    color: 'black',
  },
});