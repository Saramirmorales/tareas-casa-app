"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { dayBoundsLocal } from "@/lib/week";

async function requireMember(houseId: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("No autenticado");
  const m = await prisma.houseMember.findUnique({
    where: { userId_houseId: { userId, houseId } },
  });
  if (!m) throw new Error("No perteneces a esta casa");
  return userId;
}

const taskSchema = z.object({
  title: z.string().trim().min(1).max(120),
  points: z.coerce.number().int().min(0).max(1000),
  type: z
    .string()
    .trim()
    .max(40)
    .transform((s) => (s.length > 0 ? s : "general")),
});

export async function createTask(houseId: string, formData: FormData) {
  await requireMember(houseId);
  const raw = {
    title: formData.get("title"),
    points: formData.get("points"),
    type: formData.get("type") || "general",
  };
  const parsed = taskSchema.safeParse(raw);
  if (!parsed.success) return { error: "Datos de tarea inválidos." };
  await prisma.task.create({
    data: {
      houseId,
      title: parsed.data.title,
      points: parsed.data.points,
      type: parsed.data.type,
    },
  });
  revalidatePath(`/houses/${houseId}`);
  return { ok: true as const };
}

export async function updateTask(taskId: string, houseId: string, formData: FormData) {
  await requireMember(houseId);
  const task = await prisma.task.findFirst({
    where: { id: taskId, houseId },
  });
  if (!task) return { error: "Tarea no encontrada." };
  const raw = {
    title: formData.get("title"),
    points: formData.get("points"),
    type: formData.get("type") || "general",
  };
  const parsed = taskSchema.safeParse(raw);
  if (!parsed.success) return { error: "Datos de tarea inválidos." };
  await prisma.task.update({
    where: { id: taskId },
    data: {
      title: parsed.data.title,
      points: parsed.data.points,
      type: parsed.data.type,
    },
  });
  revalidatePath(`/houses/${houseId}`);
  return { ok: true as const };
}

export async function deleteTask(taskId: string, houseId: string) {
  await requireMember(houseId);
  const task = await prisma.task.findFirst({
    where: { id: taskId, houseId },
  });
  if (!task) return { error: "Tarea no encontrada." };
  await prisma.task.delete({ where: { id: taskId } });
  revalidatePath(`/houses/${houseId}`);
  return { ok: true as const };
}

export async function addCompletion(
  taskId: string,
  houseId: string,
  dayKey: string,
) {
  const userId = await requireMember(houseId);
  const task = await prisma.task.findFirst({
    where: { id: taskId, houseId },
  });
  if (!task) return { error: "Tarea no encontrada." };
  const { start } = dayBoundsLocal(dayKey);
  const completion = await prisma.taskCompletion.create({
    data: {
      taskId,
      userId,
      completedAt: start,
    },
  });
  revalidatePath(`/houses/${houseId}`);
  return { ok: true as const, completionId: completion.id };
}

export async function deleteCompletion(completionId: string, houseId: string) {
  await requireMember(houseId);
  const c = await prisma.taskCompletion.findFirst({
    where: {
      id: completionId,
      task: { houseId },
    },
  });
  if (!c) return { error: "Registro no encontrado." };
  await prisma.taskCompletion.delete({ where: { id: completionId } });
  revalidatePath(`/houses/${houseId}`);
  return { ok: true as const };
}
