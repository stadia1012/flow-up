import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        userId: { label: "userId", type: "text", placeholder: "사용자 ID" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.userId || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          console.log("Attempting to authenticate user:", credentials.userId);
          
          const user = await prisma.cBT_USER.findUnique({
            select: {
              USER_ID: true,
              USER_NAME: true,
              USER_PW: true,
              USER_RANK: true,
              userDept: {
                select: {
                  DEPT_CODE: true,
                  DEPT_NAME: true
                }
              },
              adminUser: {
                select: {
                  IS_ACTIVE: true,
                }
              }
            },
            where: { USER_ID: credentials.userId },
          });

          if (!user) {
            console.log("User not found:", credentials.userId);
            return null;
          }

          console.log("User found, checking password...");
          const isValid = await compare(credentials.password, user.USER_PW || '');
          
          if (!isValid) {
            console.log("Invalid password for user:", credentials.userId);
            return null;
          }
          console.log("User authenticated successfully:", user.USER_ID);

          const userAncestorDeptCodes: string[] = [];
          if (user.userDept?.DEPT_CODE) {
            const userDeptHierarchy = await prisma.cBT_DEPT_CLOSURE.findMany({
              where: {
                descendant: { DEPT_CODE: user.userDept?.DEPT_CODE }
              },
              select: {
                ancestor: {
                  select: { DEPT_CODE: true }
                }
              }
            });
            userAncestorDeptCodes.push(...userDeptHierarchy.map(h => h.ancestor.DEPT_CODE));
          }
          
          return {
            id: user.USER_ID || '',
            name: String(user.USER_NAME) || '[no_name]',
            rank: String(user.USER_RANK) || '[no_rank]',
            deptCode: String(user.userDept?.DEPT_CODE) || '[no_departmentCode]',
            deptName: String(user.userDept?.DEPT_NAME) || '[no_departmentName]',
            isAdmin: (user.adminUser?.IS_ACTIVE === "Y") ? true : false,
            ancestorDepts: userAncestorDeptCodes
          };
        } catch (error) {
          console.error("Database error during authentication:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.rank = user.rank;
        token.deptCode = user.deptCode;
        token.deptName = user.deptName;
        token.isAdmin = user.isAdmin;
        token.ancestorDepts = user.ancestorDepts;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.rank = token.rank as string;
        session.user.deptCode = token.deptCode as string;
        session.user.deptName = token.deptName as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.ancestorDepts = token.ancestorDepts as string[];
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};