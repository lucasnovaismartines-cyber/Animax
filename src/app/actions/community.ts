"use server";

import { prisma } from "@/lib/db";
import { verifyAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface ChatMessage {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    plan: string;
  };
}

export async function getMessages(): Promise<ChatMessage[]> {
  try {
    const messages = await prisma.communityMessage.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            plan: true,
          },
        },
      },
    });

    return messages.reverse(); // Mais antigas no topo, novas embaixo
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    return [];
  }
}

export async function sendMessage(content: string) {
  try {
    const session = await verifyAuth();
    if (!session) {
      return { error: "Você precisa estar logado para enviar mensagens." };
    }

    if (!content.trim()) {
      return { error: "Mensagem vazia." };
    }

    if (content.length > 500) {
      return { error: "Mensagem muito longa (máx 500 caracteres)." };
    }

    await prisma.communityMessage.create({
      data: {
        content: content.trim(),
        userId: session.userId,
      },
    });

    revalidatePath("/community");
    return { success: true };
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return { error: "Erro ao enviar mensagem." };
  }
}
