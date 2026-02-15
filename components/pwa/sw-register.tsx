"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  return null;
}

/**
 * Subscribe the current browser to push notifications.
 * Returns the PushSubscription or null if denied/unsupported.
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;

  // Check for existing subscription
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey,
    });
  }

  // Send subscription to server
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription.toJSON()),
  });

  return subscription;
}

/**
 * Unsubscribe from push notifications.
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    // Remove from server
    await fetch("/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    await subscription.unsubscribe();
  }

  return true;
}

/**
 * Check if the current browser is subscribed to push notifications.
 */
export async function isPushSubscribed(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
}

/**
 * Check if push notifications are supported in this browser.
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Send a test push notification via the API.
 */
export async function sendTestNotification(): Promise<boolean> {
  const res = await fetch("/api/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Allure ✨",
      body: "Push notifications are working!",
      url: "/settings",
      tag: "test-notification",
    }),
  });

  return res.ok;
}
