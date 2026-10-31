// Slack slash command handler for /compliment.
// Slack POSTs form-encoded data here; we reply with JSON that Slack posts
// back to the channel for everyone to see.

const crypto = require("crypto");

const COMPLIMENTS = [
  "You make hard problems look easy.",
  "The team moves faster because you're on it.",
  "Your questions make everyone else's thinking sharper.",
  "You ship. That's rarer than it sounds.",
  "People leave conversations with you feeling clearer.",
  "You notice the detail everyone else walked past.",
  "Your calm under pressure is contagious.",
  "You give credit generously and it shows.",
  "Every review you write teaches someone something.",
  "You turn 'we should' into 'we did'.",
];

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data));
  });
}

// Verifies the request really came from Slack, using the app's signing secret.
function verify(raw, req) {
  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret) return true; // Not configured yet; allow during setup.
  const ts = req.headers["x-slack-request-timestamp"];
  const sig = req.headers["x-slack-signature"];
  if (!ts || !sig) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false; // 5-minute replay window
  const base = `v0:${ts}:${raw}`;
  const mine = "v0=" + crypto.createHmac("sha256", secret).update(base).digest("hex");
  return mine.length === sig.length && crypto.timingSafeEqual(Buffer.from(mine), Buffer.from(sig));
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(200).send("Slack compliment app is running. Point a slash command here.");
    return;
  }

  const raw = await readBody(req);
  if (!verify(raw, req)) {
    res.status(401).send("Bad signature");
    return;
  }

  const params = new URLSearchParams(raw);
  const userId = params.get("user_id");
  const text = (params.get("text") || "").trim();

  // "/compliment @someone" compliments that person; plain "/compliment" compliments the caller.
  const mention = text.match(/<@([A-Z0-9]+)(\|[^>]+)?>/);
  const target = mention ? `<@${mention[1]}>` : `<@${userId}>`;
  const line = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];

  res.status(200).json({
    response_type: "in_channel",
    text: `${target} — ${line}`,
  });
};
