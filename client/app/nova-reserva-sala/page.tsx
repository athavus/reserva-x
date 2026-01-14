import Link from "next/link";
import { Calendar, LogOut, MapPin, Users } from "lucide-react";

interface Room {
  id: string;
  name: string;
  capacity: string;
  location: string;
  features: string[];
}

const rooms: Room[] = [
  {
    id: "SALA-01",
    name: "Sala de Reunião Principal",
    capacity: "Até 12 pessoas",
    location: "Térreo, Bloco A",
    features: ["TV", "Videochamada", "Quadro branco"],
  },
  {
    id: "SALA-02",
    name: "Sala Colaborativa",
    capacity: "Até 8 pessoas",
    location: "1º Andar, Bloco B",
    features: ["Monitor", "Wi-Fi", "Ar-condicionado"],
  },
  {
    id: "AUD-01",
    name: "Auditório Principal",
    capacity: "Até 60 pessoas",
    location: "2º Andar, Bloco C",
    features: ["Projetor", "Som", "Microfone"],
  },
];

export default function NovaReservaSalaPage() {
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
              href="/nova-reserva-sala"
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
          <span className="text-black">Nova reserva de sala</span>
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight text-black md:text-4xl">
              Reservar sala
            </h1>
            <p className="mt-2 text-gray-700">
              Escolha a data, horário e o espaço ideal para sua reunião.
            </p>
          </div>
          <div className="flex gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white px-4 py-2 text-gray-700">
              Lista
            </span>
            <span className="rounded-full px-4 py-2 text-gray-600">
              Calendário
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <section className="space-y-6 lg:col-span-4">
            <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-blue-100">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-800">
                <Calendar className="h-5 w-5 text-[#0056D2]" />
                Agendamento
              </h2>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="mb-1 block font-semibold text-gray-700">
                    Data
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-blue-200 bg-[#E3F2FD] px-3 py-2 text-gray-900 outline-none ring-2 ring-transparent focus:border-[#1A73E8] focus:ring-[#1A73E8]/40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block font-semibold text-gray-700">
                      Início
                    </label>
                    <select className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-gray-900 outline-none ring-2 ring-transparent focus:border-[#1A73E8] focus:ring-[#1A73E8]/40">
                      <option>09:00</option>
                      <option>09:30</option>
                      <option>10:00</option>
                      <option>10:30</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-gray-700">
                      Duração
                    </label>
                    <select className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-gray-900 outline-none ring-2 ring-transparent focus:border-[#1A73E8] focus:ring-[#1A73E8]/40">
                      <option>30 min</option>
                      <option selected>1h</option>
                      <option>1h 30min</option>
                      <option>2h</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-blue-100">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800">
                  Preferências
                </h2>
                <button className="text-xs font-semibold text-[#0056D2] hover:underline">
                  Limpar
                </button>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="mb-1 block font-semibold text-gray-700">
                    Capacidade mínima
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={50}
                      defaultValue={8}
                      className="w-full accent-[#1A73E8]"
                    />
                    <span className="w-10 text-center text-sm font-bold text-gray-800">
                      8
                    </span>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-gray-700">
                    Tipo de sala
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded border-blue-200 text-[#1A73E8]"
                      />
                      Sala de reunião
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-blue-200 text-[#1A73E8]"
                      />
                      Auditório
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4 lg:col-span-8">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <p>
                Mostrando{" "}
                <span className="font-bold text-black">
                  {rooms.length} salas disponíveis
                </span>
              </p>
              <div className="flex items-center gap-2">
                <span>Ordenar por:</span>
                <select className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/40">
                  <option>Recomendadas</option>
                  <option>Capacidade</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-5 shadow-md ring-1 ring-blue-100 md:flex-row"
                >
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                        <span className="rounded-full bg-[#E3F2FD] px-2 py-0.5 text-[#0056D2]">
                          {room.id}
                        </span>
                        <span>{room.capacity}</span>
                      </div>
                    </div>
                    <h2 className="text-lg font-bold text-black">
                      {room.name}
                    </h2>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {room.location}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-gray-700">
                      {room.features.map((feature) => (
                        <span
                          key={feature}
                          className="rounded-full bg-[#E3F2FD] px-3 py-1"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-4 md:flex-col md:items-end">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Users className="h-4 w-4 text-[#0056D2]" />
                      <span>Disponível no horário escolhido</span>
                    </div>
                    <button className="rounded-lg bg-[#5BA4E5] px-5 py-2 text-sm font-bold text-black ring-2 ring-[#1A73E8] hover:bg-blue-400">
                      Reservar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

