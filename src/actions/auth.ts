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

const inviteLoginSchema = z.object({
  email: z.string().trim().email(),
  inviteCode: z.string().trim().min(1),
});

export async function loginWithEmailAndInvite(formData: FormData) {
  const parsed = inviteLoginSchema.safeParse({
    email: formData.get("email"),
    inviteCode: formData.get("inviteCode"),
  });
  if (!parsed.success) {
    return { error: "Datos inválidos." };
  }

  const email = parsed.data.email.toLowerCase();
  const house = await prisma.house.findUnique({
    where: { inviteCode: parsed.data.inviteCode },
    select: { id: true },
  });
  if (!house) {
    return { error: "La invitación no es válida o ha caducado." };
  }

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email } });
  }

  await prisma.houseMember.upsert({
    where: { userId_houseId: { userId: user.id, houseId: house.id } },
    create: { userId: user.id, houseId: house.id },
    update: {},
  });

  await createSession(user.id);
  return { ok: true as const, houseId: house.id };
}

export async function logout() {
  await clearSession();
}
