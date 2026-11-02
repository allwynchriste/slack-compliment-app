# Slack compliment app

A tiny Slack app with one job: when someone types `/compliment` in a channel, it posts a random compliment where the whole team can see it. Add `@someone` after the command to compliment them instead of yourself.

## How it works

1. Slack sends the slash command to `api/compliment.js` (a Vercel serverless function).
2. The function checks the request signature against the app's signing secret.
3. It replies with `response_type: in_channel`, so Slack posts the compliment in the channel rather than only to the person who typed it.

## Deploy

- Deploy this repo on Vercel. This one lives at `https://slack-compliment-app-theta.vercel.app/api/compliment`.
- In Vercel, add the environment variable `SLACK_SIGNING_SECRET` (from your Slack app's Basic Information page).
- In the Slack app, create a slash command `/compliment` with that endpoint as the Request URL.

## Permissions

The app holds one bot scope, `chat:write`, which is what lets it post in a channel. Slash commands add `commands` automatically. Nothing else.

Built for the Handshake AI Skills Studio.
