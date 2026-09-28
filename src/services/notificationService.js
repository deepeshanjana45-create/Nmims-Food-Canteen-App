import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

// --------------------------------------------------
// Notification behaviour
// --------------------------------------------------

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// --------------------------------------------------
// Register device for push notifications
// --------------------------------------------------

export async function registerForPushNotificationsAsync() {
  // Push notifications require a physical device
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device.");
    return null;
  }

  // Android notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("orders", {
      name: "Order Notifications",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: "default",
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  // ------------------------------------------------
  // Check current permission
  // ------------------------------------------------

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Ask user for permission
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Notification permission was not granted.");
    return null;
  }

  // ------------------------------------------------
  // Get Expo project ID
  // ------------------------------------------------
  // If EAS is not configured, we'll try catching the error or falling back
  let projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ||
    Constants?.easConfig?.projectId;

  // ------------------------------------------------
  // Get Expo push token
  // ------------------------------------------------
  try {
    const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    console.log("Expo Push Token:", token.data);
    return token.data;
  } catch (err) {
    console.error("Error getting push token", err);
    return null;
  }
}
