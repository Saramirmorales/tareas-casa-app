"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, clearSession } from "@/lib/session";

const emailSchema = z.string().trim().email();

export async function loginWithEmail(formData: FormData) {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { error: "Introduce un email válido." };
  }
  const email = parsed.data.toLowerCase();
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email } });
  }
  await createSession(user.id);
  return { ok: true as const };
}

export async function logout() {
  await clearSession();
}
