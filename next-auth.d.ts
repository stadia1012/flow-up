// next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      rank: string;
      deptCode: string;
      deptName: string;
      isAdmin?: boolean;
    }
  }
  interface User {
    id: string;
    name: string;
    rank: string;
    deptCode: string;
    deptName: string;
    isAdmin?: boolean;
  }
  interface User extends DefaultUser {

  }
}