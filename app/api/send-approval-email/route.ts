import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    await transporter.sendMail({
      from: `"Family Hub" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your registration has been approved!",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f8fafc; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 48px;">🏠</span>
            <h1 style="color: #1e293b; font-size: 22px; margin: 12px 0 4px;">Family Hub</h1>
          </div>

          <div style="background: white; border-radius: 12px; padding: 28px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
            <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 12px;">Hi ${name || "there"} 👋</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
              Great news! Your registration on <strong>Family Hub</strong> has been approved by the admin.
            </p>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
              You can now log in and access all the features — tasks, expenses, events, chat, and more.
            </p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/login"
              style="display: inline-block; background: #4f46e5; color: white; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 600;">
              Login Now →
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
            Family Hub • Your family, one place.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Email send failed:", err)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
