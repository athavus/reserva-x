"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Info,
  LogOut,
  MapPin,
  User,
  XCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  Reservation,
  Laboratory,
  getReservation,
  getLaboratories,
  deleteReservation
} from "../lib/api";

function CancelarReservaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reservationId = searchParams.get("id");

  const { user, isLoading, logout } = useAuth();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (!reservationId) {
      router.push("/minhas-reservas");
      return;
    }

    if (user) {
      Promise.all([
        getReservation(parseInt(reservationId)),
        getLaboratories()
      ])
        .then(([res, labs]) => {
          setReservation(res);
          setLaboratories(labs);
        })
        .catch((err) => {
          setError(err.message || "Reserva não encontrada");
        })
        .finally(() => setLoading(false));
    }
  }, [user, isLoading, router, reservationId]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getLabName = (labId: number) => {
    const lab = laboratories.find((l) => l.id === labId);
    return lab?.name || "Laboratório";
  };

  const handleCancel = async () => {
    if (!reservation) return;

    setSubmitting(true);
    setError(null);

    try {
      await deleteReservation(reservation.id);
      router.push("/minhas-reservas");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cancelar reserva");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTimeRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} - ${e.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved": return "Confirmada";
      case "pending": return "Aguardando";
      case "rejected": return "Cancelada";
      case "cancelled": return "Cancelada";
      default: return status;
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#B3D4FC] flex items-center justify-center">
        <div className="text-xl font-bold text-gray-700">Carregando...</div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-[#B3D4FC] flex items-center justify-center">
        <div className="text-xl font-bold text-red-600">
          {error || "Reserva não encontrada"}
        </div>
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
        <section className="mb-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <Link href="/home" className="hover:underline">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/minhas-reservas" className="hover:underline">
              Minhas reservas
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800">Cancelar</span>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-black md:text-4xl">
                Cancelar reserva
              </h1>
              <p className="mt-1 max-w-xl text-sm text-gray-700">
                Revise os detalhes da reserva antes de confirmar o cancelamento.
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl bg-white shadow-md">
              <div className="relative h-40 bg-gradient-to-tr from-[#0056D2] to-[#5BA4E5]">
                <div className="absolute inset-0 opacity-20" />
                <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0056D2]">
                  {getStatusLabel(reservation.status)}
                </div>
              </div>
              <div className="space-y-3 p-5">
                <h2 className="text-lg font-bold text-black">
                  {reservation.title}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <User className="h-4 w-4 text-[#0056D2]" />
                  <span>Reserva #{reservation.id}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="h-4 w-4 text-[#0056D2]" />
                  <span>{formatDate(reservation.start_time)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock className="h-4 w-4 text-[#0056D2]" />
                  <span>{formatTimeRange(reservation.start_time, reservation.end_time)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="h-4 w-4 text-[#0056D2]" />
                  <span>{getLabName(reservation.laboratory_id)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-[#FFF3E0] p-4 text-sm text-[#7C2D12] shadow-sm ring-1 ring-[#FFCC80]">
              <Info className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold">Atenção</p>
                <p className="mt-1 text-xs text-[#7C2D12]">
                  Ao cancelar esta reserva, o horário ficará disponível para outros usuários.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <h2 className="mb-4 border-b border-gray-100 pb-3 text-lg font-bold text-black">
                Detalhes da reserva
              </h2>
              <div className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    ID da reserva
                  </p>
                  <p className="font-medium text-gray-900">#RES-{reservation.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Data de criação
                  </p>
                  <p className="font-medium text-gray-900">
                    {new Date(reservation.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Tipo de recurso
                  </p>
                  <p className="font-medium text-gray-900">
                    {reservation.reservation_type === "room" ? "Sala" : "Computador"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Local
                  </p>
                  <p className="font-medium text-gray-900">
                    {getLabName(reservation.laboratory_id)}
                  </p>
                </div>
                {reservation.description && (
                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Descrição
                    </p>
                    <p className="font-medium text-gray-900">
                      {reservation.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                <Link
                  href="/minhas-reservas"
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-100"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Link>
                <button
                  onClick={handleCancel}
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#FF9F68] px-6 py-2.5 text-sm font-bold text-[#7C2D12] shadow-sm hover:bg-[#FFB380] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="h-4 w-4" />
                  {submitting ? "Cancelando..." : "Confirmar cancelamento"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function CancelarReservaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#B3D4FC] flex items-center justify-center">
        <div className="text-xl font-bold text-gray-700">Carregando...</div>
      </div>
    }>
      <CancelarReservaContent />
    </Suspense>
  );
}
