"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireUser() {
  const id = await getSessionUserId();
  if (!id) throw new Error("No autenticado");
  return id;
}

const nameSchema = z.string().trim().min(1).max(80);

export async function createHouse(
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const userId = await requireUser();
  const name = nameSchema.safeParse(formData.get("name"));
  if (!name.success) return { error: "Nombre inválido." };
  const house = await prisma.house.create({
    data: {
      name: name.data,
      members: { create: { userId } },
    },
  });
  revalidatePath("/houses");
  redirect(`/houses/${house.id}`);
}

export async function addHouseMember(houseId: string, formData: FormData) {
  await requireUser();
  const email = z.string().trim().email().safeParse(formData.get("email"));
  if (!email.success) return { error: "Email inválido." };
  const normalized = email.data.toLowerCase();
  const member = await prisma.user.upsert({
    where: { email: normalized },
    create: { email: normalized },
    update: {},
  });
  await prisma.houseMember.upsert({
    where: { userId_houseId: { userId: member.id, houseId } },
    create: { userId: member.id, houseId },
    update: {},
  });
  revalidatePath("/houses");
  revalidatePath(`/houses/${houseId}`);
  return { ok: true as const };
}
