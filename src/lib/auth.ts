import { cookies } from "next/headers";
import { findUserByEmail } from "@/lib/db";

export async function verifyAuth() {
  const cookieStore = await cookies();
  const emailCookie = cookieStore.get("user_email");
  
  if (!emailCookie?.value) {
    return null;
  }

  const user = await findUserByEmail(emailCookie.value);
  if (!user) return null;

  return {
    userId: user.id,
    user: user
  };
}
