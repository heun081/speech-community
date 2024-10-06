import { StyleSheet, View, Text, Button } from "react-native";
import * as Haptics from "expo-haptics";

export default function HapticsExample() {
  return (
    <View style={styles.container}>
      <Text style={{}}>Haptics.selectionAsync</Text>
      <View style={styles.buttonContainer}>
        <Button title="Selection" onPress={() => Haptics.selectionAsync()} />
      </View>
      <Text style={{}}>Haptics.notificationAsync</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Success"
          onPress={() =>
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          }
        />
        <Button
          title="Error"
          onPress={() =>
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
          }
        />
        <Button
          title="Warning"
          onPress={() =>
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
          }
        />
      </View>
      <Text style={{}}>Haptics.impactAsync</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Light"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        />
        <Button
          title="Medium"
          onPress={() =>
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          }
        />
        <Button
          title="Heavy"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
        />
        <Button
          title="Rigid"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)}
        />
        <Button
          title="Soft"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: 10,
    marginBottom: 30,
    justifyContent: "space-between",
  },
});
