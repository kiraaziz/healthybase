import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/server/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const authConfig = {
  adapter: PrismaAdapter(db),
  pages: {
    signIn: "/signin",
    signOut: "/profile",
    // error: "/auth/error",
    verifyRequest: "/otp"
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "email" },
        otp: { label: "otp", type: "password" },
      },

      async authorize(credentials: any) {

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user) {
          throw new Error("User not exist")
        }

        if (user.otpExpierd || user.optDate <= new Date()) {
          throw new Error("OTP code expired")
        }

        if (user.otp !== credentials?.otp) {
          throw new Error("Incorrect OTP code")
        }

        await db.user.update({
          where: {
            id: user.id
          },
          data: {
            otpExpierd: true
          }
        })

        return user
      }
    }),
  ],
  callbacks: {
    session: async ({ session, token }: any) => {
      if (session?.user) {
        session.user.id = token.sub;

        const { activated, name, email, image, onBoarding }: any = await db.user.findUnique({
          where: {
            id: token.sub
          }
        })
        session.user.name = await name;
        session.user.email = await email;
        session.user.image = await image;
        session.user.activated = await activated;
        session.user.onBoarding = await onBoarding;
      }

      return session;
    },
    jwt: async ({ user, token }: any) => {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
} satisfies NextAuthConfig;