import Link from "next/link";
import { Calendar, Clock, LogOut } from "lucide-react";

export default function EditarReservaPage() {
  return (
    <div className="min-h-screen bg-[#B3D4FC]">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Calendar className="h-8 w-8 text-[#0056D2]" />
            <span className="text-xl font-bold text-black">RESERVAX</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-bold text-gray-700 md:flex">
            <Link href="/home" className="hover:text-black">
              Início
            </Link>
            <Link href="/minhas-reservas" className="hover:text-black">
              Minhas reservas
            </Link>
          </nav>
          <Link
            href="/login"
            className="flex items-center gap-2 text-gray-600 hover:text-black"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 text-sm font-medium text-gray-600">
          <span>Início</span>
          <span className="mx-1">/</span>
          <span>Reservas</span>
          <span className="mx-1">/</span>
          <span className="text-black">Editar reserva</span>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight text-black md:text-4xl">
              Editar reserva
            </h1>
            <p className="mt-2 text-gray-700">
              Ajuste sala, data, horário e observações antes de confirmar.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-xs font-bold text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-600" />
              Confirmada
            </span>
            <button className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
              Excluir
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <section className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-blue-100 lg:col-span-8">
            <h2 className="mb-4 text-lg font-bold text-black">
              Detalhes do agendamento
            </h2>
            <form className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-gray-800">
                  Recurso
                </label>
                <div className="relative">
                  <select className="w-full rounded-lg border border-blue-200 bg-[#E3F2FD] px-4 py-3 text-sm font-medium text-gray-900 outline-none ring-2 ring-transparent focus:border-[#1A73E8] focus:ring-[#1A73E8]/40">
                    <option>Sala de Reunião A (Térreo)</option>
                    <option selected>Sala de Conferência B (2º Andar)</option>
                    <option>Auditório Principal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-800">
                  Data
                </label>
                <div className="relative">
                  <input
                    type="date"
                    defaultValue="2025-10-12"
                    className="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none ring-2 ring-transparent focus:border-[#1A73E8] focus:ring-[#1A73E8]/40"
                  />
                  <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-800">
                  Horário de início
                </label>
                <div className="relative">
                  <input
                    type="time"
                    defaultValue="14:00"
                    className="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none ring-2 ring-transparent focus:border-[#1A73E8] focus:ring-[#1A73E8]/40"
                  />
                  <Clock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-800">
                  Duração
                </label>
                <select className="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none ring-2 ring-transparent focus:border-[#1A73E8] focus:ring-[#1A73E8]/40">
                  <option>30 minutos</option>
                  <option selected>1 hora</option>
                  <option>1h 30min</option>
                  <option>2 horas</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-gray-800">
                  Observações
                </label>
                <textarea
                  rows={4}
                  defaultValue="Necessito de projetor HDMI e quadro branco disponível."
                  className="w-full rounded-lg border border-blue-200 bg-white p-4 text-sm text-gray-900 outline-none ring-2 ring-transparent focus:border-[#1A73E8] focus:ring-[#1A73E8]/40"
                />
              </div>
            </form>
          </section>

          <aside className="space-y-4 lg:col-span-4">
            <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-blue-100">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-600">
                Resumo
              </h2>
              <div className="rounded-xl bg-[#E3F2FD] p-4">
                <p className="text-xs font-semibold uppercase text-gray-600">
                  Sala selecionada
                </p>
                <p className="mt-1 text-base font-bold text-black">
                  Sala de Conferência B
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  Capacidade: 12 pessoas
                </p>
              </div>
              <dl className="mt-4 space-y-2 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <dt>Reservado por</dt>
                  <dd className="font-semibold text-black">Alex Morgan</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Criado em</dt>
                  <dd className="font-semibold text-black">10 Out, 2025</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl bg-[#E3F2FD] p-4 text-sm text-gray-800">
              <p className="font-semibold">
                Dica
              </p>
              <p className="mt-1">
                Caso precise alterar apenas o horário, mantenha a mesma sala para evitar conflitos.
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Link
            href="/minhas-reservas"
            className="rounded-lg border border-blue-200 bg-white px-6 py-2.5 text-sm font-bold text-gray-800 hover:bg-blue-50"
          >
            Cancelar
          </Link>
          <button className="rounded-lg bg-[#5BA4E5] px-6 py-2.5 text-sm font-bold text-black ring-2 ring-[#1A73E8] hover:bg-blue-400">
            Salvar alterações
          </button>
        </div>
      </main>
    </div>
  );
}

