// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/auth";

const handler = NextAuth(authOptions);

// App Router에서는 GET, POST 모두 export
export { handler as GET, handler as POST };