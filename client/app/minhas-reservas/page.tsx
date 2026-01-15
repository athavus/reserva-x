"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, LogOut, MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  Reservation,
  Laboratory,
  getMyReservations,
  getLaboratories,
  deleteReservation
} from "../lib/api";

type ReservationStatus = "Confirmada" | "Aguardando" | "Cancelada";

function mapStatus(status: string): ReservationStatus {
  switch (status) {
    case "approved":
      return "Confirmada";
    case "pending":
      return "Aguardando";
    case "rejected":
      return "Cancelada";
    case "cancelled":
      return "Cancelada";
    default:
      return "Aguardando";
  }
}

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
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"proximas" | "historico" | "canceladas">("proximas");

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

  // Get lab name helper
  const getLabName = (labId: number) => {
    const lab = laboratories.find((l) => l.id === labId);
    return lab?.name || "Laboratório";
  };

  // Filter reservations
  const now = new Date();
  const filteredReservations = reservations.filter((r) => {
    const startDate = new Date(r.start_time);
    switch (filter) {
      case "proximas":
        return (r.status !== "rejected" && r.status !== "cancelled") && startDate >= now;
      case "historico":
        return r.status === "approved" && startDate < now;
      case "canceladas":
        return r.status === "rejected" || r.status === "cancelled";
      default:
        return true;
    }
  });

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Format time range
  const formatTimeRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} - ${e.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  };

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
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-black"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
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
          <button
            onClick={() => setFilter("proximas")}
            className={`rounded-full px-4 py-2 ${filter === "proximas" ? "bg-white text-[#0056D2]" : "text-gray-600"
              }`}
          >
            Próximas
          </button>
          <button
            onClick={() => setFilter("historico")}
            className={`rounded-full px-4 py-2 ${filter === "historico" ? "bg-white text-[#0056D2]" : "text-gray-600"
              }`}
          >
            Histórico
          </button>
          <button
            onClick={() => setFilter("canceladas")}
            className={`rounded-full px-4 py-2 ${filter === "canceladas" ? "bg-white text-[#0056D2]" : "text-gray-600"
              }`}
          >
            Canceladas
          </button>
        </div>

        <div className="space-y-5">
          {filteredReservations.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow-md">
              Nenhuma reserva encontrada nesta categoria.
            </div>
          ) : (
            filteredReservations.map((reservation) => {
              const status = mapStatus(reservation.status);
              return (
                <div
                  key={reservation.id}
                  className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-blue-100 md:flex-row"
                >
                  <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                            status
                          )}`}
                        >
                          <span className="h-2 w-2 rounded-full bg-current" />
                          {status}
                        </span>
                        <span className="text-xs font-medium text-gray-500">
                          ID: #RES-{reservation.id}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-black">
                        {reservation.title}
                      </h2>
                      <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {getLabName(reservation.laboratory_id)}
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
                          <p className="font-medium text-black">
                            {formatDate(reservation.start_time)}
                          </p>
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
                            {formatTimeRange(reservation.start_time, reservation.end_time)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:ml-auto">
                        {reservation.status === "pending" && (
                          <Link
                            href={`/editar-reserva?id=${reservation.id}`}
                            className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                          >
                            Editar
                          </Link>
                        )}
                        {(reservation.status === "pending" || reservation.status === "approved") && (
                          <Link
                            href={`/cancelar-reserva?id=${reservation.id}`}
                            className="rounded-lg px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                          >
                            Cancelar
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
