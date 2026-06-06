import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const STOP_ACTION_ID = "STOP";

export const SOUND_OPTIONS = [
  { key: "default", label: "Default" },
  { key: "alarm", label: "Alarm" },
];

const DEFAULT_CHANNEL = "task-reminders-default";
const ALARM_CHANNEL = "task-reminders-alarm";

let handlerSet = false;

function ensureHandler() {
  if (handlerSet) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    handlerSet = true;
  } catch (_) {}
}

export async function requestPermissions() {
  ensureHandler();
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") return false;
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL, {
        name: "Task Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
      });
      await Notifications.setNotificationChannelAsync(ALARM_CHANNEL, {
        name: "Task Alarms",
        importance: Notifications.AndroidImportance.MAX,
        sound: "default",
      });
    }
    await Notifications.setNotificationCategoryAsync("task-reminder", [
      {
        identifier: STOP_ACTION_ID,
        buttonTitle: "Stop",
        options: { opensAppToForeground: false },
      },
    ]);
    return true;
  } catch (_) {
    return false;
  }
}

export async function scheduleTaskReminder(task) {
  ensureHandler();
  try {
    const triggerDate = new Date(task.reminderAt);
    if (triggerDate <= new Date()) return null;
    const channelId = Platform.OS === "android" && task.soundName === "alarm" ? ALARM_CHANNEL : DEFAULT_CHANNEL;
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Task Reminder",
        body: `"${task.title}" is due soon`,
        data: { taskId: task.id },
        sound: "default",
        ...(Platform.OS === "android" ? { channelId } : {}),
      },
      trigger: {
        date: triggerDate,
        type: Notifications.SchedulableTriggerInputTypes.DATE,
      },
    });
    return id;
  } catch (_) {
    return null;
  }
}

export async function cancelTaskReminder(notificationId) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (_) {}
}

export function addNotificationResponseListener(callback) {
  ensureHandler();
  try {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      const actionId = response.actionIdentifier;
      const notificationId = response.notification.request.identifier;
      callback({ ...data, actionId, notificationId });
    });
    return () => subscription.remove();
  } catch (_) {
    return () => {};
  }
}

export function isStopAction(actionId) {
  return actionId === STOP_ACTION_ID;
}

export async function dismissNotification(notificationId) {
  if (!notificationId) return;
  try {
    await Notifications.dismissNotificationAsync(notificationId);
  } catch (_) {}
}
