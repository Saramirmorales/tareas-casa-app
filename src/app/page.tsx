import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getSessionUserId } from "@/lib/session";

export default async function Home() {
  const id = await getSessionUserId();
  if (id) redirect("/houses");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
          Tareas en casa
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Entra con tu email para gestionar casas, tareas y puntos.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
