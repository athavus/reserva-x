"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  LogOut,
  ArrowRight,
  MapPin,
  Monitor,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Reservation, getMyReservations, Laboratory, getLaboratories } from "../lib/api";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      Promise.all([getMyReservations(), getLaboratories()])
        .then(([res, labs]) => {
          setReservations(res);
          setLaboratories(labs);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Calculate stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthReservations = reservations.filter(
    (r) => new Date(r.created_at) >= startOfMonth
  );

  const hoursUsed = reservations
    .filter((r) => r.status === "approved")
    .reduce((acc, r) => {
      const start = new Date(r.start_time);
      const end = new Date(r.end_time);
      return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);

  // Get next approved reservations
  const upcomingReservations = reservations
    .filter((r) => r.status === "approved" && new Date(r.start_time) > now)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 3);

  // Get lab name helper
  const getLabName = (labId: number) => {
    const lab = laboratories.find((l) => l.id === labId);
    return lab?.name || "Laboratório";
  };

  // Format reservation time label
  const getTimeLabel = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Hoje";
    if (date.toDateString() === tomorrow.toDateString()) return "Amanhã";

    return date.toLocaleDateString("pt-BR", { weekday: "long" });
  };

  // Format time range
  const formatTimeRange = (start: string, end: string): string => {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} - ${e.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  };

  // Get current date
  const currentDate = now.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Weekly days
  const weeklyDays = [];
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek + 1); // Monday

  for (let i = 0; i < 6; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const hasEvent = reservations.some((r) => {
      const rd = new Date(r.start_time);
      return rd.toDateString() === d.toDateString();
    });
    weeklyDays.push({
      label: dayLabels[d.getDay()],
      day: d.getDate().toString(),
      hasEvent,
      highlight: d.toDateString() === now.toDateString(),
    });
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#B3D4FC] flex items-center justify-center">
        <div className="text-xl font-bold text-gray-700">Carregando...</div>
      </div>
    );
  }

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
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-black"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-black md:text-4xl">
              Olá, {user?.role === "professor" ? "Professor(a)" : user?.role === "admin" ? "Admin" : "Aluno(a)"}
            </h1>
            <p className="text-sm font-medium text-gray-700">
              Aqui está o resumo dos seus compromissos desta semana.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow">
            <Clock className="h-4 w-4 text-[#0056D2]" />
            <span>{currentDate}</span>
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
            <p className="text-3xl font-extrabold text-black">{monthReservations.length}</p>
            <p className="text-xs font-semibold text-gray-600">
              Total de reservas criadas este mês
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
            <p className="text-3xl font-extrabold text-black">{Math.round(hoursUsed)}h</p>
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
                  Próxima reserva
                </span>
              </div>
            </div>
            <p className="text-3xl font-extrabold text-black">
              {upcomingReservations[0] ? getLabName(upcomingReservations[0].laboratory_id) : "Nenhuma"}
            </p>
            <p className="text-xs font-bold text-[#FF9F68]">
              {upcomingReservations[0]
                ? getTimeLabel(upcomingReservations[0].start_time)
                : "Faça uma reserva"}
            </p>
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
                      key={day.label + day.day}
                      className={`flex min-w-[72px] flex-col items-center gap-2 rounded-xl p-2 ${day.highlight
                          ? "bg-[#E3F2FD] text-[#0056D2]"
                          : "text-gray-700"
                        }`}
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-wide">
                        {day.label}
                      </span>
                      <span className="text-lg font-bold">{day.day}</span>
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${day.hasEvent ? "bg-[#0056D2]" : "bg-gray-300"
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
                {upcomingReservations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Nenhuma reserva futura
                  </div>
                ) : (
                  upcomingReservations.map((item) => (
                    <div
                      key={item.id}
                      className="group rounded-xl border-b border-gray-100 p-4 last:border-b-0 hover:bg-gray-50"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="rounded-full bg-[#FFF3E0] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#FF9F68]">
                          {getTimeLabel(item.start_time)}
                        </span>
                      </div>
                      <h3 className="mb-1 text-lg font-bold text-black">
                        {item.title}
                      </h3>
                      <p className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {getLabName(item.laboratory_id)}
                      </p>
                      <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                        <Clock className="h-3 w-3" />
                        {formatTimeRange(item.start_time, item.end_time)}
                      </div>
                    </div>
                  ))
                )}
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
