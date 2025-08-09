import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    return reg;
  } catch (e) {
    console.error("SW registration failed", e);
    return null;
  }
}

export async function initPushNotifications(userId: string) {
  try {
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const reg = await registerServiceWorker();
    if (!reg) return;

    // Get VAPID key from Edge Function
    const { data, error } = await supabase.functions.invoke("get-vapid");
    if (error || !data?.publicKey) {
      console.error("Failed to get VAPID public key", error);
      return;
    }

    // Check existing subscription
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      });
    }

    const json = sub.toJSON() as any;

    // Save in Supabase (upsert by endpoint)
    const { error: upsertError } = await supabase
      .from("push_subscriptions")
      .upsert(
        [{
          user_id: userId,
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
          user_agent: navigator.userAgent,
          device_type: "web",
        }],
        { onConflict: "endpoint" as any }
      );

    if (upsertError) {
      console.error("Failed to save push subscription", upsertError);
    }
  } catch (e) {
    console.error("initPushNotifications error", e);
  }
}

export function setupInAppPushListener() {
  if (!("serviceWorker" in navigator)) return;

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
      o.start();
      o.stop(ctx.currentTime + 0.15);
      g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.15);
    } catch (e) {
      // ignore
    }
  };

  navigator.serviceWorker.addEventListener("message", (event: MessageEvent) => {
    const msg = (event.data || {}) as { type?: string; payload?: any };
    if (msg.type === "PUSH_MESSAGE") {
      const p = msg.payload || {};
      playBeep();
      if (p.title) {
        toast(p.title, { description: p.body });
      }
    }
  });
}
