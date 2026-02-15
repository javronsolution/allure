import webPush from "web-push";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;

webPush.setVapidDetails(
  "mailto:admin@allure-boutique.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
  actions?: { action: string; title: string }[];
}

export async function sendPushNotification(
  subscription: webPush.PushSubscription,
  payload: PushPayload
) {
  try {
    await webPush.sendNotification(subscription, JSON.stringify(payload));
    return { success: true };
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    // 410 Gone or 404 = subscription expired
    if (statusCode === 410 || statusCode === 404) {
      return { success: false, expired: true };
    }
    console.error("Push notification error:", error);
    return { success: false, expired: false };
  }
}

export { webPush, VAPID_PUBLIC_KEY };
