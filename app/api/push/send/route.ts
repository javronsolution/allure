import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushNotification, type PushPayload } from "@/lib/push";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload: PushPayload = await request.json();

    if (!payload.title) {
      return NextResponse.json(
        { error: "Missing title" },
        { status: 400 }
      );
    }

    // Get all push subscriptions for this user
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to fetch subscriptions:", error);
      return NextResponse.json(
        { error: "Failed to fetch subscriptions" },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: "No subscriptions found" },
        { status: 404 }
      );
    }

    // Send to all subscriptions and clean up expired ones
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSub = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys_p256dh,
            auth: sub.keys_auth,
          },
        };

        const result = await sendPushNotification(pushSub, payload);

        // Remove expired subscriptions
        if (!result.success && result.expired) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("id", sub.id);
        }

        return result;
      })
    );

    const sent = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;

    return NextResponse.json({ success: true, sent, total: subscriptions.length });
  } catch (err) {
    console.error("Send notification error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
