import Link from "next/link";
import { Calendar, Computer, LogOut } from "lucide-react";

interface ComputerItem {
  id: string;
  label: string;
  system: string;
  status: "Livre" | "Selecionado" | "Ocupado";
}

const computers: ComputerItem[] = [
  {
    id: "PC-01",
    label: "PC-01",
    system: "Windows 11",
    status: "Livre",
  },
  {
    id: "PC-02",
    label: "PC-02",
    system: "Windows 11",
    status: "Livre",
  },
  {
    id: "PC-03",
    label: "PC-03",
    system: "Ocupado",
    status: "Ocupado",
  },
  {
    id: "PC-04",
    label: "PC-04",
    system: "Windows 11",
    status: "Selecionado",
  },
];

export default function NovaReservaComputadorPage() {
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
              href="/nova-reserva-computador"
              className="text-[#0056D2] underline-offset-4 hover:underline"
            >
              Nova reserva
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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 text-sm font-medium text-gray-600">
          <span>Início</span>
          <span className="mx-1">/</span>
          <span>Reservas</span>
          <span className="mx-1">/</span>
          <span className="text-black">Nova reserva de computador</span>
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight text-black md:text-4xl">
              Reservar computador
            </h1>
            <p className="mt-2 text-gray-700">
              Selecione laboratório, horário e o equipamento desejado.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-gray-700 ring-1 ring-blue-100 hover:bg-blue-50">
              Ajuda
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <section className="space-y-6 lg:col-span-4">
            <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-blue-100">
              <h2 className="mb-4 text-sm font-bold text-gray-800">
                Configuração
              </h2>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="mb-1 block font-semibold text-gray-700">
                    Laboratório
                  </label>
                  <select className="w-full rounded-lg border border-blue-200 bg-[#E3F2FD] px-3 py-2 text-gray-900 outline-none ring-2 ring-transparent focus:border-[#1A73E8] focus:ring-[#1A73E8]/40">
                    <option>Lab 01 - Informática Geral</option>
                    <option>Lab 02 - Design Gráfico</option>
                    <option>Lab 03 - Redes</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-gray-700">
                    Tipo de equipamento
                  </label>
                  <select className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-gray-900 outline-none ring-2 ring-transparent focus:border-[#1A73E8] focus:ring-[#1A73E8]/40">
                    <option>Qualquer disponível</option>
                    <option>Workstation</option>
                    <option>PC padrão</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-gray-700">
                    Duração
                  </label>
                  <select className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-gray-900 outline-none ring-2 ring-transparent focus:border-[#1A73E8] focus:ring-[#1A73E8]/40">
                    <option>1 hora</option>
                    <option>2 horas</option>
                    <option>3 horas</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-blue-100">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-800">
                <Calendar className="h-5 w-5 text-[#0056D2]" />
                Data
              </h2>
              <input
                type="date"
                className="w-full rounded-lg border border-blue-200 bg-[#E3F2FD] px-3 py-2 text-gray-900 outline-none ring-2 ring-transparent focus:border-[#1A73E8] focus:ring-[#1A73E8]/40"
              />
              <p className="mt-3 text-xs text-gray-700">
                Selecione a data. Os horários disponíveis serão atualizados conforme o laboratório escolhido.
              </p>
            </div>
          </section>

          <section className="space-y-6 lg:col-span-8">
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-gray-800">
                Horário disponível
              </h2>
              <div className="flex flex-wrap gap-3">
                {["08:00", "09:00", "10:00", "11:00", "14:00", "15:00"].map(
                  (time) => (
                    <button
                      key={time}
                      className={`rounded-full px-5 py-2 text-sm font-semibold ${
                        time === "10:00"
                          ? "bg-[#5BA4E5] text-black ring-2 ring-[#1A73E8]"
                          : "bg-white text-gray-800 ring-1 ring-blue-100 hover:bg-blue-50"
                      }`}
                    >
                      {time}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-700">
                <h2 className="flex items-center gap-2 font-bold text-gray-800">
                  <Computer className="h-5 w-5 text-[#0056D2]" />
                  Selecione o computador
                </h2>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full border border-gray-300 bg-white" />
                    Livre
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full border border-orange-300 bg-orange-100" />
                    Selecionado
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full border border-gray-300 bg-gray-100" />
                    Ocupado
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {computers.map((computer) => {
                  const isSelected = computer.status === "Selecionado";
                  const isBusy = computer.status === "Ocupado";

                  if (isBusy) {
                    return (
                      <button
                        key={computer.id}
                        className="relative flex flex-col items-center justify-center gap-2 rounded-xl bg-gray-100 p-4 text-center text-gray-500 ring-1 ring-gray-300"
                        disabled
                      >
                        <span className="absolute right-2 top-2 text-xs font-semibold text-red-500">
                          Ocupado
                        </span>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                          <Computer className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-bold">{computer.label}</p>
                        <p className="text-xs">{computer.system}</p>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={computer.id}
                      className={`flex flex-col items-center justify-center gap-2 rounded-xl p-4 text-center text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-orange-100 text-orange-700 ring-2 ring-orange-400"
                          : "bg-white text-gray-900 ring-1 ring-blue-100 hover:bg-blue-50"
                      }`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E3F2FD] text-[#0056D2]">
                        <Computer className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold">{computer.label}</p>
                      <p className="text-xs text-gray-600">
                        {computer.system}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link
                href="/minhas-reservas"
                className="rounded-lg border border-blue-200 bg-white px-6 py-2.5 text-sm font-bold text-gray-800 hover:bg-blue-50"
              >
                Cancelar
              </Link>
              <button className="rounded-lg bg-[#5BA4E5] px-6 py-2.5 text-sm font-bold text-black ring-2 ring-[#1A73E8] hover:bg-blue-400">
                Confirmar reserva
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

