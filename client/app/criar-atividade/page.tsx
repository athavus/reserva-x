import Link from "next/link";
import {
  Calendar,
  Clock,
  FileText,
  Globe2,
  Lock,
  LogOut,
  PlusCircle,
  EyeOff,
} from "lucide-react";

export default function CriarAtividadePage() {
  return (
    <div className="min-h-screen bg-[#B3D4FC]">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
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
            <Link
              href="/criar-atividade"
              className="text-[#0056D2] underline-offset-4 hover:underline"
            >
              Nova atividade
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

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-black md:text-4xl">
              Nova atividade
            </h1>
            <p className="max-w-xl text-sm text-gray-700">
              Preencha os campos abaixo para registrar uma nova atividade
              vinculada à sua reserva.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Link>
            <button className="rounded-lg bg-[#0056D2] px-4 py-2 text-sm font-bold text-white shadow hover:bg-blue-700">
              Salvar rascunho
            </button>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-md">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  <FileText className="h-4 w-4 text-[#0056D2]" />
                  <span>Título da atividade</span>
                </div>
                <input
                  type="text"
                  placeholder="Ex.: Aula de revisão para prova"
                  className="h-11 w-full rounded-lg border border-blue-200 bg-white px-3 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-[#0056D2] focus:outline-none focus:ring-1 focus:ring-[#0056D2]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                <FileText className="h-4 w-4 text-[#0056D2]" />
                <span>Descrição</span>
              </div>
              <textarea
                rows={4}
                placeholder="Adicione detalhes, pauta e orientações importantes para os participantes..."
                className="w-full resize-y rounded-lg border border-blue-200 bg-white p-3 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-[#0056D2] focus:outline-none focus:ring-1 focus:ring-[#0056D2]"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  <Calendar className="h-4 w-4 text-[#0056D2]" />
                  <span>Data</span>
                </div>
                <input
                  type="date"
                  className="h-11 w-full rounded-lg border border-blue-200 bg-white px-3 text-sm text-gray-800 shadow-sm focus:border-[#0056D2] focus:outline-none focus:ring-1 focus:ring-[#0056D2]"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  <Clock className="h-4 w-4 text-[#0056D2]" />
                  <span>Hora de início</span>
                </div>
                <input
                  type="time"
                  className="h-11 w-full rounded-lg border border-blue-200 bg-white px-3 text-sm text-gray-800 shadow-sm focus:border-[#0056D2] focus:outline-none focus:ring-1 focus:ring-[#0056D2]"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  <Clock className="h-4 w-4 text-[#0056D2]" />
                  <span>Duração</span>
                </div>
                <select className="h-11 w-full rounded-lg border border-blue-200 bg-white px-3 text-sm text-gray-800 shadow-sm focus:border-[#0056D2] focus:outline-none focus:ring-1 focus:ring-[#0056D2]">
                  <option>30 minutos</option>
                  <option>45 minutos</option>
                  <option>1 hora</option>
                  <option>1 hora e 30 minutos</option>
                  <option>2 horas</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                <Lock className="h-4 w-4 text-[#0056D2]" />
                <span>Visibilidade</span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="visibilidade"
                    defaultChecked
                    className="peer sr-only"
                  />
                  <div className="flex items-center gap-4 rounded-xl border border-blue-200 bg-white p-4 shadow-sm transition peer-checked:border-[#0056D2] peer-checked:ring-1 peer-checked:ring-[#0056D2]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E3F2FD] text-[#0056D2]">
                      <Globe2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Não confidencial
                      </p>
                      <p className="text-xs text-gray-600">
                        Visível para os participantes da turma e administradores.
                      </p>
                    </div>
                  </div>
                </label>

                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="visibilidade"
                    className="peer sr-only"
                  />
                  <div className="flex items-center gap-4 rounded-xl border border-blue-200 bg-white p-4 shadow-sm transition peer-checked:border-[#0056D2] peer-checked:ring-1 peer-checked:ring-[#0056D2]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E3F2FD] text-[#0056D2]">
                      <EyeOff className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Confidencial
                      </p>
                      <p className="text-xs text-gray-600">
                        Visível apenas para você e administradores do sistema.
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
              <p className="text-xs text-gray-600 sm:mr-auto">
                Todos os campos são apenas ilustrativos. Nenhuma informação é
                enviada para o servidor.
              </p>
              <Link
                href="/home"
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-100"
              >
                Cancelar
              </Link>
              <button className="flex items-center justify-center gap-2 rounded-lg bg-[#0056D2] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-blue-700">
                <PlusCircle className="h-4 w-4" />
                Criar atividade
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

