import { useAchievementNotifications } from "./AchievementNotification";

export function AchievementManager() {
  const { NotificationComponent } = useAchievementNotifications();
  return <NotificationComponent />;
}
