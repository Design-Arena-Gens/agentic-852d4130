import type { AgentConfig } from "../schemas";
import { env } from "../env";

interface YoutubeAccessToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

let cachedToken: { token: YoutubeAccessToken; expiresAt: number } | null = null;

async function fetchAccessToken(): Promise<YoutubeAccessToken> {
  if (
    !env.YOUTUBE_CLIENT_ID ||
    !env.YOUTUBE_CLIENT_SECRET ||
    !env.YOUTUBE_REFRESH_TOKEN
  ) {
    throw new Error("YouTube OAuth credentials are not configured");
  }

  const params = new URLSearchParams({
    client_id: env.YOUTUBE_CLIENT_ID,
    client_secret: env.YOUTUBE_CLIENT_SECRET,
    refresh_token: env.YOUTUBE_REFRESH_TOKEN,
    grant_type: "refresh_token"
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to refresh YouTube access token: ${text}`);
  }

  return res.json();
}

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.token.access_token;
  }

  const token = await fetchAccessToken();
  cachedToken = {
    token,
    expiresAt: now + token.expires_in * 1000
  };
  return token.access_token;
}

export interface YoutubeUploadResult {
  videoId: string;
}

export async function uploadToYoutube(
  videoBuffer: Uint8Array,
  config: AgentConfig,
  title: string,
  description: string
): Promise<YoutubeUploadResult> {
  const accessToken = await getAccessToken();
  const contentLength = videoBuffer.byteLength;
  const binaryBody = videoBuffer.slice().buffer;

  const initiate = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Length": contentLength.toString(),
        "X-Upload-Content-Type": "video/mp4"
      },
      body: JSON.stringify({
        snippet: {
          title,
          description,
          tags: config.keywords,
          defaultLanguage: config.language,
          defaultAudioLanguage: config.language
        },
        status: {
          privacyStatus: config.autoPublish ? "public" : "private",
          selfDeclaredMadeForKids: false
        }
      })
    }
  );

  if (!initiate.ok) {
    const text = await initiate.text();
    throw new Error(`YouTube upload init failed: ${text}`);
  }

  const uploadUrl = initiate.headers.get("location");
  if (!uploadUrl) {
    throw new Error("YouTube upload URL missing");
  }

  const upload = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Length": contentLength.toString(),
      "Content-Type": "video/mp4"
    },
    body: binaryBody
  });

  if (!upload.ok) {
    const text = await upload.text();
    throw new Error(`YouTube upload failed: ${text}`);
  }

  const payload = await upload.json();
  return {
    videoId: payload.id
  };
}
