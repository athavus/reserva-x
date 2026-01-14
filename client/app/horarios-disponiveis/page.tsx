import Link from "next/link";
import { Calendar, Clock, LogOut, MapPin, Monitor, Users } from "lucide-react";

const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

type BookingStatus = "livre" | "ocupado" | "manutencao";

interface BookingBlock {
  title: string;
  subtitle?: string;
  status: BookingStatus;
  gridClasses: string;
}

interface ResourceRow {
  name: string;
  description: string;
  icon: "room" | "lab" | "pc" | "creative";
  bookings: BookingBlock[];
}

const resources: ResourceRow[] = [
  {
    name: "Sala de Reunião 1",
    description: "8 pessoas",
    icon: "room",
    bookings: [
      {
        title: "Reunião de Vendas",
        subtitle: "09:00 - 10:30",
        status: "ocupado",
        gridClasses: "col-start-2 col-span-2",
      },
      {
        title: "Manutenção",
        subtitle: "14:00 - 15:00",
        status: "manutencao",
        gridClasses: "col-start-7 col-span-1",
      },
    ],
  },
  {
    name: "Laboratório 204",
    description: "20 computadores",
    icon: "lab",
    bookings: [
      {
        title: "Aula de Design UI",
        subtitle: "10:00 - 12:00",
        status: "ocupado",
        gridClasses: "col-start-3 col-span-3",
      },
    ],
  },
  {
    name: "Estação PC-05",
    description: "Alto desempenho",
    icon: "pc",
    bookings: [
      {
        title: "Reservado (Admin)",
        subtitle: "08:00 - 11:30",
        status: "ocupado",
        gridClasses: "col-start-1 col-span-4",
      },
    ],
  },
  {
    name: "Sala Criativa",
    description: "Projetor + quadro",
    icon: "creative",
    bookings: [],
  },
];

function bookingColors(status: BookingStatus) {
  if (status === "ocupado") {
    return "bg-[#E3F2FD] border-l-4 border-[#0056D2] text-[#0B3D91]";
  }
  if (status === "manutencao") {
    return "bg-[#FFF3E0] border-l-4 border-[#FF9F68] text-[#7C2D12]";
  }
  return "bg-gray-100 border-l-4 border-gray-300 text-gray-700";
}

export default function HorariosDisponiveisPage() {
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
              href="/horarios-disponiveis"
              className="text-[#0056D2] underline-offset-4 hover:underline"
            >
              Horários disponíveis
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
        <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-black md:text-4xl">
              Horários disponíveis
            </h1>
            <p className="max-w-2xl text-sm text-gray-700">
              Visualize a disponibilidade das salas e laboratórios ao longo do
              dia. Selecione um bloco para iniciar uma nova reserva.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow">
              <Calendar className="h-4 w-4 text-[#0056D2]" />
              <span>Hoje, 24 Out</span>
            </button>
            <Link
              href="/nova-reserva-sala"
              className="flex items-center gap-2 rounded-xl bg-[#0056D2] px-4 py-2 text-sm font-bold text-white shadow hover:bg-blue-700"
            >
              <Clock className="h-4 w-4" />
              Nova reserva
            </Link>
          </div>
        </section>

        <section className="mb-6 rounded-2xl bg-white p-4 shadow-md">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="w-full lg:w-1/3">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">
                  <MapPin className="h-4 w-4" />
                </span>
                <select className="h-11 w-full rounded-lg border border-blue-200 bg-white pl-9 pr-4 text-sm text-gray-800 shadow-sm focus:border-[#0056D2] focus:outline-none focus:ring-1 focus:ring-[#0056D2]">
                  <option>Campus Central - Bloco A</option>
                  <option>Campus Central - Bloco B</option>
                  <option>Unidade Tecnológica - Andar 2</option>
                </select>
              </div>
            </div>

            <div className="flex w-full gap-2 overflow-x-auto pb-1 text-sm font-medium lg:w-auto">
              <button className="flex items-center gap-2 rounded-full bg-[#E3F2FD] px-4 py-2 text-[#0056D2] ring-1 ring-[#0056D2]/30">
                <Users className="h-4 w-4" />
                Todos
              </button>
              <button className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200">
                <Calendar className="h-4 w-4" />
                Salas
              </button>
              <button className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200">
                <Monitor className="h-4 w-4" />
                Computadores
              </button>
            </div>

            <div className="flex flex-1 flex-wrap items-center gap-4 text-xs font-medium text-gray-600">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-gray-100 ring-1 ring-gray-300" />
                Livre
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#E3F2FD] ring-1 ring-[#90CAF9]" />
                Ocupado
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#FFF3E0] ring-1 ring-[#FFCC80]" />
                Manutenção
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="flex border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <div className="flex w-56 items-center border-r border-gray-100 bg-gray-50 px-4 py-3">
              Recurso
            </div>
            <div className="flex flex-1 overflow-x-auto">
              <div className="flex min-w-full flex-1">
                <div className="grid flex-1 grid-cols-11 gap-px bg-gray-50 px-2 py-3">
                  {timeSlots.map((slot) => (
                    <div
                      key={slot}
                      className="flex items-center justify-center text-[11px] text-gray-600"
                    >
                      {slot}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="max-h-[520px] overflow-y-auto">
            {resources.map((resource) => (
              <div
                key={resource.name}
                className="flex border-t border-gray-100 bg-white hover:bg-gray-50"
              >
                <div className="flex w-56 flex-col justify-center gap-1 border-r border-gray-100 px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E3F2FD] text-[#0056D2]">
                      {resource.icon === "lab" && (
                        <Monitor className="h-4 w-4" />
                      )}
                      {resource.icon === "pc" && (
                        <Monitor className="h-4 w-4" />
                      )}
                      {resource.icon === "room" && (
                        <Users className="h-4 w-4" />
                      )}
                      {resource.icon === "creative" && (
                        <Calendar className="h-4 w-4" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-black">
                      {resource.name}
                    </p>
                  </div>
                  <p className="pl-10 text-xs text-gray-600">
                    {resource.description}
                  </p>
                </div>

                <div className="flex flex-1 overflow-x-auto">
                  <div className="min-w-full flex-1 px-2 py-3">
                    <div className="grid grid-cols-11 gap-1">
                      {timeSlots.map((slot) => (
                        <div
                          key={`${resource.name}-${slot}`}
                          className="h-10 rounded-md bg-gray-50"
                        />
                      ))}

                      {resource.bookings.map((booking) => (
                        <button
                          key={booking.title}
                          type="button"
                          className={`flex h-10 flex-col justify-center overflow-hidden rounded-md px-2 text-left text-[11px] shadow-sm transition hover:shadow-md ${bookingColors(
                            booking.status,
                          )} ${booking.gridClasses}`}
                        >
                          <span className="truncate font-semibold">
                            {booking.title}
                          </span>
                          {booking.subtitle && (
                            <span className="truncate text-[10px] opacity-90">
                              {booking.subtitle}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

