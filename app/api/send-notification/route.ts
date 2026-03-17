import { NextRequest, NextResponse } from "next/server"

// FCM V1 API — uses Google OAuth2 access token from Service Account
async function getAccessToken(): Promise<string> {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!serviceAccount) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON not set")

  const sa = JSON.parse(serviceAccount)

  // Build JWT for Google OAuth2
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: "RS256", typ: "JWT" }
  const payload = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url")

  const unsigned = `${encode(header)}.${encode(payload)}`

  // Sign with RSA private key using Web Crypto
  const pemKey = sa.private_key as string
  const pemBody = pemKey.replace(/-----.*?-----/g, "").replace(/\s/g, "")
  const keyBuffer = Buffer.from(pemBody, "base64")

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    Buffer.from(unsigned)
  )

  const jwt = `${unsigned}.${Buffer.from(signature).toString("base64url")}`

  // Exchange JWT for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  })

  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) throw new Error("Failed to get access token")
  return tokenData.access_token as string
}

export async function POST(req: NextRequest) {
  try {
    const { tokens, title, message } = await req.json()
    if (!tokens?.length) return NextResponse.json({ error: "No tokens" }, { status: 400 })

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    if (!projectId) return NextResponse.json({ error: "Project ID missing" }, { status: 500 })

    const accessToken = await getAccessToken()

    const results = await Promise.allSettled(
      tokens.map((token: string) =>
        fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            message: {
              token,
              notification: { title, body: message },
              webpush: {
                notification: {
                  title,
                  body: message,
                  icon: "/favicon.ico",
                },
              },
            },
          }),
        })
      )
    )

    const failed = results.filter(r => r.status === "rejected").length
    return NextResponse.json({ sent: tokens.length - failed, failed })
  } catch (err) {
    console.error("send-notification error", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
