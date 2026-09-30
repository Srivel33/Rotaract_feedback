import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import prisma from '@/lib/prisma';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      // Check if user is in the allowlist
      const isAllowed = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!isAllowed) {
        // If not in allowlist, deny sign in
        return false;
      }
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
        });
        if (dbUser) {
          (session.user as any).role = dbUser.role;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  session: {
    strategy: 'jwt',
  },
});

export { handler as GET, handler as POST };
