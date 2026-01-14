import Link from "next/link";
import {
  Calendar,
  Clock,
  LogOut,
  ArrowRight,
  MapPin,
  Monitor,
  Users,
} from "lucide-react";

const weeklyDays = [
  { label: "Seg", day: "23", hasEvent: true, highlight: false },
  { label: "Ter", day: "24", hasEvent: true, highlight: true },
  { label: "Qua", day: "25", hasEvent: true, highlight: false },
  { label: "Qui", day: "26", hasEvent: true, highlight: false },
  { label: "Sex", day: "27", hasEvent: true, highlight: false },
  { label: "Sáb", day: "28", hasEvent: false, highlight: false },
];

const nextAppointments = [
  {
    id: 1,
    label: "Hoje",
    title: "Aula de Estatística",
    location: "Sala 302, Bloco C",
    time: "14:00 - 16:00",
  },
  {
    id: 2,
    label: "Amanhã",
    title: "Laboratório de IA",
    location: "Lab 04, Térreo",
    time: "09:00 - 11:00",
  },
  {
    id: 3,
    label: "Quinta-feira",
    title: "Reunião de Orientação",
    location: "Sala de Reuniões 1",
    time: "16:30 - 17:30",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#B3D4FC]">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Calendar className="h-8 w-8 text-[#0056D2]" />
            <span className="text-xl font-bold text-black">RESERVAX</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-bold text-gray-700 md:flex">
            <Link
              href="/home"
              className="text-[#0056D2] underline-offset-4 hover:underline"
            >
              Início
            </Link>
            <Link href="/minhas-reservas" className="hover:text-black">
              Minhas reservas
            </Link>
            <Link href="/nova-reserva-sala" className="hover:text-black">
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

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-black md:text-4xl">
              Olá, Professor(a)
            </h1>
            <p className="text-sm font-medium text-gray-700">
              Aqui está o resumo dos seus compromissos desta semana.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow">
            <Clock className="h-4 w-4 text-[#0056D2]" />
            <span>24 de Outubro, 2025</span>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-2 rounded-2xl bg-white p-5 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F2FD] text-[#0056D2]">
                  <Calendar className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Reservas do mês
                </span>
              </div>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-3xl font-extrabold text-black">12</p>
            <p className="text-xs font-semibold text-emerald-600">
              +2 esta semana
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl bg-white p-5 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F2FD] text-[#0056D2]">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Horas utilizadas
                </span>
              </div>
            </div>
            <p className="text-3xl font-extrabold text-black">24h</p>
            <p className="text-xs font-medium text-gray-600">
              Ciclo mensal atual
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl bg-white p-5 shadow-md ring-2 ring-[#FF9F68]/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF3E0] text-[#FF9F68]">
                  <Calendar className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Próxima aula
                </span>
              </div>
            </div>
            <p className="text-3xl font-extrabold text-black">Sala 302</p>
            <p className="text-xs font-bold text-[#FF9F68]">Em 2 horas</p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-black">Ações rápidas</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link
                  href="/nova-reserva-sala"
                  className="group relative flex aspect-[2/1] cursor-pointer flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-tr from-[#0056D2] to-[#5BA4E5] p-5 text-white shadow-md"
                >
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold leading-tight">
                        Reservar sala
                      </p>
                      <p className="text-sm text-blue-100">
                        Reuniões ou aulas
                      </p>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white transition-transform group-hover:translate-x-1">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>

                <Link
                  href="/nova-reserva-computador"
                  className="group relative flex aspect-[2/1] cursor-pointer flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-tr from-[#FF9F68] to-[#FFD1A4] p-5 text-white shadow-md"
                >
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                    <Monitor className="h-5 w-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold leading-tight">
                        Reservar computador
                      </p>
                      <p className="text-sm text-orange-100">
                        Laboratório de informática
                      </p>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white transition-transform group-hover:translate-x-1">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-black">
                  Agenda da semana
                </h2>
                <Link
                  href="/horarios-disponiveis"
                  className="text-sm font-semibold text-[#0056D2] hover:underline"
                >
                  Ver horários disponíveis
                </Link>
              </div>

              <div className="overflow-x-auto rounded-2xl bg-white p-4 shadow-md">
                <div className="flex min-w-[480px] justify-between">
                  {weeklyDays.map((day) => (
                    <div
                      key={day.label}
                      className={`flex min-w-[72px] flex-col items-center gap-2 rounded-xl p-2 ${
                        day.highlight
                          ? "bg-[#E3F2FD] text-[#0056D2]"
                          : "text-gray-700"
                      }`}
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-wide">
                        {day.label}
                      </span>
                      <span className="text-lg font-bold">{day.day}</span>
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          day.hasEvent ? "bg-[#0056D2]" : "bg-gray-300"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-black">Próximos horários</h2>
            <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white p-2 shadow-md">
              <div className="flex-1 overflow-y-auto">
                {nextAppointments.map((item) => (
                  <div
                    key={item.id}
                    className="group rounded-xl border-b border-gray-100 p-4 last:border-b-0 hover:bg-gray-50"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="rounded-full bg-[#FFF3E0] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#FF9F68]">
                        {item.label}
                      </span>
                    </div>
                    <h3 className="mb-1 text-lg font-bold text-black">
                      {item.title}
                    </h3>
                    <p className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {item.location}
                    </p>
                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                      <Clock className="h-3 w-3" />
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/minhas-reservas"
                className="mt-2 w-full rounded-xl px-4 py-3 text-center text-sm font-bold text-[#0056D2] hover:bg-[#E3F2FD]"
              >
                Ver todas as reservas
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
