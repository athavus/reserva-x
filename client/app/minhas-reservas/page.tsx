import Link from "next/link";
import { Calendar, Clock, LogOut, MapPin } from "lucide-react";

type ReservationStatus = "Confirmada" | "Aguardando" | "Cancelada";

interface Reservation {
  id: string;
  title: string;
  location: string;
  date: string;
  timeRange: string;
  status: ReservationStatus;
}

const reservations: Reservation[] = [
  {
    id: "#RES-8921",
    title: "Sala de Reunião Executiva 01",
    location: "2º Andar, Bloco B",
    date: "15 de Outubro, 2025",
    timeRange: "14:00 - 15:00",
    status: "Confirmada",
  },
  {
    id: "#RES-8934",
    title: "Estação de Trabalho Fixa 12",
    location: "1º Andar, Espaço Aberto",
    date: "18 de Outubro, 2025",
    timeRange: "09:00 - 18:00",
    status: "Aguardando",
  },
  {
    id: "#RES-8950",
    title: "Cabine de Videochamada 03",
    location: "2º Andar, Corredor Sul",
    date: "20 de Outubro, 2025",
    timeRange: "10:00 - 11:30",
    status: "Confirmada",
  },
];

function statusClasses(status: ReservationStatus) {
  if (status === "Confirmada") {
    return "bg-green-50 text-green-700";
  }
  if (status === "Aguardando") {
    return "bg-yellow-50 text-yellow-700";
  }
  return "bg-red-50 text-red-700";
}

export default function MinhasReservasPage() {
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
            <Link
              href="/minhas-reservas"
              className="text-[#0056D2] underline-offset-4 hover:underline"
            >
              Minhas reservas
            </Link>
            <Link
              href="/nova-reserva-sala"
              className="hover:text-black"
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

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight text-black md:text-4xl">
              Minhas reservas
            </h1>
            <p className="mt-2 text-gray-700">
              Visualize suas reservas confirmadas, pendentes e o histórico recente.
            </p>
          </div>
          <Link
            href="/nova-reserva-sala"
            className="inline-flex items-center justify-center rounded-xl bg-[#5BA4E5] px-5 py-3 text-sm font-bold text-black ring-2 ring-[#1A73E8] hover:bg-blue-400"
          >
            Nova reserva
          </Link>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-blue-200 pb-3 text-sm font-bold">
          <span className="rounded-full bg-white px-4 py-2 text-[#0056D2]">
            Próximas
          </span>
          <span className="rounded-full px-4 py-2 text-gray-600">
            Histórico
          </span>
          <span className="rounded-full px-4 py-2 text-gray-600">
            Canceladas
          </span>
        </div>

        <div className="mb-6 flex flex-wrap gap-3 text-sm">
          <button className="rounded-full bg-white px-4 py-2 font-medium text-gray-700 ring-1 ring-blue-200 hover:bg-blue-50">
            Data
          </button>
          <button className="rounded-full bg-white px-4 py-2 font-medium text-gray-700 ring-1 ring-blue-200 hover:bg-blue-50">
            Tipo de recurso
          </button>
          <button className="rounded-full bg-white px-4 py-2 font-medium text-gray-700 ring-1 ring-blue-200 hover:bg-blue-50">
            Status
          </button>
        </div>

        <div className="space-y-5">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-blue-100 md:flex-row"
            >
              <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                        reservation.status,
                      )}`}
                    >
                      <span className="h-2 w-2 rounded-full bg-current" />
                      {reservation.status}
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      ID: {reservation.id}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-black">
                    {reservation.title}
                  </h2>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {reservation.location}
                  </p>
                </div>

                <div className="mt-3 flex flex-col gap-4 border-t border-gray-100 pt-4 text-sm text-gray-700 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E3F2FD] text-[#0056D2]">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-500">
                        Data
                      </p>
                      <p className="font-medium text-black">{reservation.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E3F2FD] text-[#0056D2]">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-500">
                        Horário
                      </p>
                      <p className="font-medium text-black">
                        {reservation.timeRange}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:ml-auto">
                    <Link
                      href="/editar-reserva"
                      className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      Editar
                    </Link>
                    <button className="rounded-lg px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

