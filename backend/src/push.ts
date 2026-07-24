const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export async function sendPushNotification(
  pushToken: string | null | undefined,
  title: string,
  body: string
) {
  if (!pushToken) return;
  try {
    await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to: pushToken, title, body, sound: "default" }),
    });
  } catch (err) {
    console.error("Failed to send push notification:", err);
  }
}

export const ORDER_STATUS_PUSH_MESSAGES: Record<string, string> = {
  ACCEPTED: "The restaurant accepted your order.",
  PREPARING: "Your order is being prepared.",
  READY_FOR_PICKUP: "Your order is ready and waiting for a rider.",
  OUT_FOR_DELIVERY: "Your order is out for delivery!",
  DELIVERED: "Your order has been delivered. Enjoy!",
  CANCELLED: "Your order was cancelled.",
};
