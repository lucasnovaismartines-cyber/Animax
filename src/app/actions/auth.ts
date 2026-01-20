"use server";

/**
 * Developed by BLACK GOLD STUDIOS and Lucas Novais Martines
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findUserByEmail, saveUser, updateUserByEmail, User } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/lib/email";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const captcha = (formData.get("captcha") as string | null)?.trim();

  const user = await findUserByEmail(email);

  if (user && user.password === password) {
    if (user.emailVerified === false) {
      // Se não verificado, podemos reenviar o código ou pedir para verificar
      // Por simplificação, vamos pedir para criar conta novamente ou verificar
      // Mas o ideal seria redirecionar para uma tela de verificação.
      // Vamos retornar um erro específico.
      return { error: "Email não verificado. Verifique seu email para ativar a conta.", requireVerification: true, email: user.email };
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

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return { error: "Este email já está cadastrado." };
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  const newUser: User = {
    id: uuidv4(),
    name,
    email,
    password,
    plan: "basic",
    maxAgeRating: 16,
    emailVerified: false,
    verificationCode: code,
    verificationCodeExpires: expires,
  };

  await saveUser(newUser);
  await sendVerificationEmail(email, code);

  return { success: true, requireVerification: true, email: email };
}

export async function requestPasswordReset(email: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    // Security: don't reveal if user exists
    return { success: true, message: "Se o email existir, um código será enviado." };
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  await updateUserByEmail(email, {
    verificationCode: code,
    verificationCodeExpires: expires,
  });

  await sendVerificationEmail(email, code);

  return { success: true, message: "Código enviado para seu email." };
}

export async function resetPassword(email: string, code: string, newPassword: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    return { error: "Email inválido." };
  }

  if (user.verificationCode !== code) {
    return { error: "Código inválido." };
  }

  if (user.verificationCodeExpires && new Date() > user.verificationCodeExpires) {
    return { error: "Código expirado. Solicite um novo." };
  }

  // Update password and clear verification code
  // Note: Password should be hashed in a real app, but based on register function:
  // "const newUser: User = { ... password, ... }" it seems hashing might be happening in saveUser or not at all yet?
  // Checking register function again:
  // const newUser: User = { ... password, ... }; await saveUser(newUser);
  // It seems the current implementation stores plain text or expects saveUser to handle it.
  // Wait, I see "password: user.password" in saveUser in db.ts. 
  // If the project uses plain text passwords (bad practice but based on existing code), I will follow suit.
  // If I see bcrypt usage, I will use it.
  // Checking imports... no bcrypt import in auth.ts.
  // So I will just save the new password as is, assuming current codebase style.
  
  await updateUserByEmail(email, {
    password: newPassword,
    verificationCode: null,
    verificationCodeExpires: null,
  });

  return { success: true };
}
  export async function verifyEmail(email: string, code: string) {
  const user = await findUserByEmail(email);
  if (!user) return { error: "Usuário não encontrado." };

  if (user.emailVerified) {
    // Already verified, just log in
    await createSession(user);
    return { success: true };
  }

  if (!user.verificationCode || user.verificationCode !== code) {
    return { error: "Código inválido." };
  }

  if (user.verificationCodeExpires && new Date() > user.verificationCodeExpires) {
    return { error: "Código expirado. Solicite um novo." };
  }

  const updatedUser = await updateUserByEmail(email, {
    emailVerified: true,
    verificationCode: null,
    verificationCodeExpires: null
  });

  if (updatedUser) {
    await createSession(updatedUser);
    return { success: true };
  }
  
  return { error: "Erro ao verificar email." };
}

export async function resendVerificationCode(email: string) {
  const user = await findUserByEmail(email);
  if (!user) return { error: "Usuário não encontrado." };
  
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  await updateUserByEmail(email, {
    verificationCode: code,
    verificationCodeExpires: expires
  });

  await sendVerificationEmail(email, code);
  return { success: true, message: "Código reenviado." };
}

async function createSession(user: User) {
  const cookieStore = await cookies();
  cookieStore.set("session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  cookieStore.set("user_name", user.name, { path: "/" });
  cookieStore.set("user_plan", user.plan, { path: "/" });
  cookieStore.set("user_email", user.email, { path: "/" });
  if (typeof user.maxAgeRating === "number") {
    cookieStore.set("user_max_age", String(user.maxAgeRating), { path: "/" });
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  cookieStore.delete("user_name");
  cookieStore.delete("user_plan");
  cookieStore.delete("user_email");
  cookieStore.delete("user_max_age");
  redirect("/login");
}

export async function getCurrentUserServer() {
  const cookieStore = await cookies();
  const emailCookie = cookieStore.get("user_email");
  if (!emailCookie?.value) return null;
  return findUserByEmail(emailCookie.value);
}

import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const cookieStore = await cookies();
  const emailCookie = cookieStore.get("user_email");
  if (!emailCookie?.value) {
    return { error: "Não autenticado." };
  }

  const name = (formData.get("name") as string | null)?.trim();
  const avatarUrl = (formData.get("avatarUrl") as string | null)?.trim();
  const maxAgeRatingRaw = formData.get("maxAgeRating") as string | null;
  const verificationCode = (formData.get("verificationCode") as string | null)?.trim();

  const updates: Partial<User> = {};
  if (name) updates.name = name;
  if (avatarUrl) updates.avatarUrl = avatarUrl;
  
  if (maxAgeRatingRaw) {
    const value = Number(maxAgeRatingRaw);
    const allowed = [10, 12, 14, 16, 18];
    
    // Check if age is actually changing
    const currentUser = await findUserByEmail(emailCookie.value);
    if (currentUser && currentUser.maxAgeRating !== value) {
       // Age change requires verification
       if (!verificationCode) {
          // If no code provided, generate and send one
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          const expires = new Date(Date.now() + 15 * 60 * 1000);
          
          await updateUserByEmail(emailCookie.value, {
            verificationCode: code,
            verificationCodeExpires: expires
          });
          
          await sendVerificationEmail(emailCookie.value, code);
          return { error: "verification_required", message: "Código enviado para o email para confirmar alteração de idade." };
       } else {
          // Verify code
          if (currentUser.verificationCode !== verificationCode) {
            return { error: "Código de verificação inválido." };
          }
          if (currentUser.verificationCodeExpires && new Date() > currentUser.verificationCodeExpires) {
            return { error: "Código expirado." };
          }
          // Valid code, clear it and allow update
          updates.verificationCode = null;
          updates.verificationCodeExpires = null;
          if (allowed.includes(value)) {
            updates.maxAgeRating = value;
          }
       }
    } else if (allowed.includes(value)) {
       // No change or same value
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

  revalidatePath("/", "layout");
  return { success: "Perfil atualizado com sucesso." };
}
