import crypto from "crypto";
import type { AgentConfig } from "../schemas";
import { env } from "../env";

export interface TikTokUploadResult {
  videoId: string;
  shareUrl?: string;
}

async function ensureToken() {
  if (!env.TIKTOK_ACCESS_TOKEN) {
    throw new Error("TIKTOK_ACCESS_TOKEN not configured");
  }
  return env.TIKTOK_ACCESS_TOKEN;
}

export async function uploadToTikTok(
  videoBuffer: Uint8Array,
  config: AgentConfig,
  title: string
): Promise<TikTokUploadResult> {
  const accessToken = await ensureToken();
  const contentLength = videoBuffer.byteLength;
  const binaryBody = videoBuffer.slice().buffer;
  const hash = crypto.createHash("sha256").update(videoBuffer).digest("hex");

  const uploadInit = await fetch("https://open.tiktokapis.com/v2/media/upload/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      media_type: "VIDEO",
      video: {
        sha256: hash,
        size: contentLength
      }
    })
  });

  if (!uploadInit.ok) {
    const text = await uploadInit.text();
    throw new Error(`TikTok upload init failed: ${text}`);
  }

  const initPayload = await uploadInit.json();
  const uploadUrl: string | undefined = initPayload.data?.upload_url;
  const videoId: string | undefined = initPayload.data?.video?.video_id;

  if (!uploadUrl || !videoId) {
    throw new Error("TikTok upload response missing upload URL");
  }

  const uploadBinary = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": contentLength.toString()
    },
    body: binaryBody
  });

  if (!uploadBinary.ok) {
    const text = await uploadBinary.text();
    throw new Error(`TikTok binary upload failed: ${text}`);
  }

  const publish = await fetch(
    "https://open.tiktokapis.com/v2/post/publish/inbox/video/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        video_id: videoId,
        text: `${title}\n\n${config.callToAction}\n\n${config.keywords
          .map((keyword) => `#${keyword.replace(/\s+/g, "")}`)
          .join(" ")}`
      })
    }
  );

  if (!publish.ok) {
    const text = await publish.text();
    throw new Error(`TikTok publish failed: ${text}`);
  }

  const publishPayload = await publish.json();
  return {
    videoId,
    shareUrl: publishPayload.data?.share_url
  };
}
