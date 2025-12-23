# Agentic Video Publisher

End-to-end agent that writes short-form scripts, renders videos, and uploads directly to TikTok and YouTube.

## Features

- Guided production brief with tone, runtime, language, CTA, and keyword controls.
- LLM-powered script drafting and storyboard generation (OpenAI Responses API).
- Video rendering via external provider or included fallback asset.
- Automated uploads to TikTok Content Posting API and YouTube Data API v3.
- Real-time execution timeline with preview, narration output, and platform status.

## Tech Stack

- Next.js 14 (App Router) + React 18
- Tailwind CSS with custom UI primitives
- OpenAI SDK, streaming orchestration utilities
- Native fetch-based TikTok & YouTube upload integrations

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to operate the agent.

## Configuration

Copy `.env.example` to `.env` and populate the following secrets:

```
OPENAI_API_KEY=sk-...
VIDEO_GEN_API_URL=https://api.your-provider.com/generate
VIDEO_GEN_API_KEY=provider_secret
TIKTOK_ACCESS_TOKEN=tt_access_token
YOUTUBE_CLIENT_ID=google_client_id
YOUTUBE_CLIENT_SECRET=google_client_secret
YOUTUBE_REFRESH_TOKEN=google_refresh_token
```

- `OPENAI_API_KEY` powers script/storyboard generation.
- `VIDEO_GEN_*` is optional; without it the app uses `public/placeholder.mp4`.
- `TIKTOK_ACCESS_TOKEN` must have the Content Posting scope.
- YouTube credentials must have a refresh token with `https://www.googleapis.com/auth/youtube.upload`.

Restart the dev server after editing environment variables.

## API Contracts

### `POST /api/agent`

Runs the full workflow. Body:

```json
{
  "topic": "How to automate sales follow-up",
  "tone": "Energetic",
  "language": "English",
  "durationSeconds": 75,
  "callToAction": "Follow for more automation playbooks!",
  "keywords": ["automation", "sales", "crm"],
  "includeBroll": true,
  "uploadTargets": ["youtube", "tiktok"],
  "scheduleTime": null,
  "autoPublish": true
}
```

Returns an `AgentJobResult` with timeline, storyboard, base64 video URL, and platform IDs.

## Deployment

```
npm run build
npm run start
```

Deploy to Vercel with:

```
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-852d4130
```

After deployment, verify availability:

```
curl https://agentic-852d4130.vercel.app
```

## Notes

- TikTok upload flow follows their v2 Content Posting endpoints (init upload → PUT binary → publish inbox).
- YouTube uploads use resumable upload sessions; refresh tokens are cached in-memory per server instance.
- Replace the fallback video asset with your rendering pipeline as soon as the external provider is configured.
