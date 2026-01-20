"use server";

/**
 * Developed by BLACK GOLD STUDIOS and Lucas Novais Martines
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findUserByEmail, saveUser, updateUserByEmail, User } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const captcha = (formData.get("captcha") as string | null)?.trim();

  const user = await findUserByEmail(email);

  if (user && user.password === password) {
    if (!captcha || captcha.toUpperCase() !== "ANIMAX") {
      return { error: "Captcha incorreto. Digite ANIMAX exatamente como pedido." };
    }
    // Define cookie de sessão
    const cookieStore = await cookies();
    cookieStore.set("session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    
    cookieStore.set("user_name", user.name, { path: "/" });
    cookieStore.set("user_plan", user.plan, { path: "/" });
    cookieStore.set("user_email", user.email, { path: "/" });
    if (typeof user.maxAgeRating === "number") {
      cookieStore.set("user_max_age", String(user.maxAgeRating), { path: "/" });
    }

    redirect("/");
  } else {
    return { error: "Email ou senha incorretos." };
  }
}

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const captcha = (formData.get("captcha") as string | null)?.trim();

  if (!name || !email || !password) {
    return { error: "Todos os campos são obrigatórios." };
  }

  if (!captcha || captcha.toUpperCase() !== "ANIMAX") {
    return { error: "Captcha incorreto. Digite ANIMAX exatamente como pedido." };
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return { error: "Este email já está cadastrado." };
  }

  const newUser: User = {
    id: uuidv4(),
    name,
    email,
    password,
    plan: "basic",
    maxAgeRating: 16,
    emailVerified: true,
  };

  await saveUser(newUser);

  const cookieStore = await cookies();
  cookieStore.set("session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  cookieStore.set("user_name", newUser.name, { path: "/" });
  cookieStore.set("user_plan", newUser.plan, { path: "/" });
  cookieStore.set("user_email", newUser.email, { path: "/" });
  if (typeof newUser.maxAgeRating === "number") {
    cookieStore.set("user_max_age", String(newUser.maxAgeRating), { path: "/" });
  }

  redirect("/assinaturas");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  cookieStore.delete("user_name");
  cookieStore.delete("user_plan");
   cookieStore.delete("user_email");
  redirect("/login");
}

export async function getCurrentUserServer(): Promise<User | null> {
  const cookieStore = await cookies();
  const emailCookie = cookieStore.get("user_email");
  if (!emailCookie?.value) {
    return null;
  }
  const user = await findUserByEmail(emailCookie.value);
  if (!user) {
    return null;
  }
  return user;
}

export async function updateProfile(formData: FormData) {
  const cookieStore = await cookies();
  const emailCookie = cookieStore.get("user_email");
  if (!emailCookie?.value) {
    return { error: "Não autenticado." };
  }

  const name = (formData.get("name") as string | null)?.trim();
  const avatarUrl = (formData.get("avatarUrl") as string | null)?.trim();
  const maxAgeRatingRaw = formData.get("maxAgeRating") as string | null;

  const updates: Partial<User> = {};
  if (name) updates.name = name;
  if (avatarUrl) updates.avatarUrl = avatarUrl;
  if (maxAgeRatingRaw) {
    const value = Number(maxAgeRatingRaw);
    const allowed = [10, 12, 14, 16, 18];
    if (allowed.includes(value)) {
      updates.maxAgeRating = value;
    }
  }

  const updated = await updateUserByEmail(emailCookie.value, updates);
  if (!updated) {
    return { error: "Usuário não encontrado." };
  }

  cookieStore.set("user_name", updated.name, { path: "/" });
  cookieStore.set("user_plan", updated.plan, { path: "/" });
  if (typeof updated.maxAgeRating === "number") {
    cookieStore.set("user_max_age", String(updated.maxAgeRating), { path: "/" });
  }

  return { success: "Perfil atualizado com sucesso." };
}
