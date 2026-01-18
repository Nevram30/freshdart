import { type NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config for middleware
 * This config doesn't include the Prisma adapter to work in Edge runtime
 */
export const authConfigEdge = {
  providers: [],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        token.role = (user as any).role;
      }
      return token;
    },
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
        },
      };
    },
    authorized: ({ auth }) => !!auth,
  },
} satisfies NextAuthConfig;
