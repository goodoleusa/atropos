import { useAchievementNotifications, AchievementNotification } from "./AchievementNotification";

export function AchievementManager() {
  const { currentAchievement, handleClose } = useAchievementNotifications();
  return <AchievementNotification achievement={currentAchievement} onClose={handleClose} />;
}
