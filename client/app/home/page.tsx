import Link from "next/link";
import { Calendar, LogOut } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Calendar className="h-8 w-8 text-[#0056D2]" />
            <span className="text-xl font-bold text-black">RESERVAX</span>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-2 text-gray-600 hover:text-black"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow">
          <h1 className="text-2xl font-bold text-black">Bem-vindo ao Sistema</h1>
          <p className="mt-4 text-gray-600">
            Você está logado. Aqui ficará o calendário e agendamento.
          </p>
        </div>
      </main>
    </div>
  );
}
