import { useSendEmail } from "@/hooks/useSendEmail"
import { sendLoginOTP } from "@/server/email"
import { db } from "@/server/db"
import { NextResponse } from "next/server"

export const POST = async (req: Request) => {

  const { name, email, image } = await req.json()
  if (!name || !email) return NextResponse.json({
    success: false,
    message: "Name and email are required",
  })

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const currentTime = new Date()
  const otpDate = new Date(currentTime.getTime() + 5 * 60 * 1000)

  const emailLow = `${email}`.toLowerCase()

  const exist = await db.user.findUnique({
    where: {
      email: emailLow
    }
  })

  if (exist) {
    return NextResponse.json({
      success: false,
      message: "Email Already in Use",
    })
  }

  await db.user.create({
    data: {
      email: emailLow,
      image: image,
      name: name,
      otp: otp,
      otpExpierd: false,
      optDate: otpDate
    }
  })

  await useSendEmail(emailLow, "Your verification code", sendLoginOTP(otp, emailLow))

  return NextResponse.json({
    success: true,
    message: "Registration successful! Check your email to verify your account",
  })
}

export const PUT = async (req: Request) => {

  const { email } = await req.json()
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const currentTime = new Date()
  const otpDate = new Date(currentTime.getTime() + 5 * 60 * 1000)
  const emailLow = `${email}`.toLowerCase()

  if (!email) return NextResponse.json({
    success: false,
    message: "Email is required",
  })

  const exist = await db.user.findUnique({
    where: {
      email: emailLow
    }
  })

  if (!exist) {
    return NextResponse.json({
      success: false,
      message: "Email not found",
    })
  }

  await db.user.update({
    where: {
      email: emailLow,
    },
    data: {
      otp: otp,
      otpExpierd: false,
      optDate: otpDate
    }
  })

  await useSendEmail(emailLow, "Your verification code", sendLoginOTP(otp, emailLow))

  return NextResponse.json({
    success: true,
    message: "Code sent! Please check your email",
  })
}