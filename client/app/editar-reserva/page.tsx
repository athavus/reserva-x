"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, Clock, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  Reservation,
  Laboratory,
  getReservation,
  getLaboratories,
  updateReservation,
  deleteReservation
} from "../lib/api";

function EditarReservaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reservationId = searchParams.get("id");

  const { user, isLoading, logout } = useAuth();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(60);

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

          // Initialize form with reservation data
          setTitle(res.title);
          setDescription(res.description || "");

          const start = new Date(res.start_time);
          const end = new Date(res.end_time);
          setDate(start.toISOString().split("T")[0]);
          setStartTime(start.toTimeString().slice(0, 5));
          setDuration(Math.round((end.getTime() - start.getTime()) / (1000 * 60)));
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

  const handleSave = async () => {
    if (!reservation) return;

    // Calculate start and end times using local date components to avoid timezone shifts
    const [y, m, d] = date.split("-").map(Number);
    const [h, min] = startTime.split(":").map(Number);
    const startDateTime = new Date(y, m - 1, d, h, min, 0);

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + duration);

    setSubmitting(true);
    setError(null);

    try {
      await updateReservation(reservation.id, {
        title,
        description: description || undefined,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/minhas-reservas");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar reserva");
    } finally {
      setSubmitting(false);
    }
  };

  // Map status
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
              Ajuste data, horário e observações antes de confirmar.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold ${reservation.status === "approved"
              ? "bg-green-50 text-green-700"
              : reservation.status === "pending"
                ? "bg-yellow-50 text-yellow-700"
                : "bg-red-50 text-red-700"
              }`}>
              <span className="h-2 w-2 rounded-full bg-current" />
              {getStatusLabel(reservation.status)}
            </span>
            <Link
              href={`/cancelar-reserva?id=${reservation.id}`}
              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Excluir
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-700 border border-green-200">
            Reserva atualizada com sucesso! Redirecionando...
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-12">
          <section className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-blue-100 lg:col-span-8">
            <h2 className="mb-4 text-lg font-bold text-black">
              Detalhes do agendamento
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-gray-800">
                  Título
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none ring-2 ring-transparent focus:border-[#1A73E8] focus:ring-[#1A73E8]/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-800">
                  Data
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
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
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none ring-2 ring-transparent focus:border-[#1A73E8] focus:ring-[#1A73E8]/40"
                  />
                  <Clock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-800">
                  Duração
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none ring-2 ring-transparent focus:border-[#1A73E8] focus:ring-[#1A73E8]/40"
                >
                  <option value={30}>30 minutos</option>
                  <option value={60}>1 hora</option>
                  <option value={90}>1h 30min</option>
                  <option value={120}>2 horas</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-gray-800">
                  Observações
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Adicione observações sobre a reserva..."
                  className="w-full rounded-lg border border-blue-200 bg-white p-4 text-sm text-gray-900 outline-none ring-2 ring-transparent focus:border-[#1A73E8] focus:ring-[#1A73E8]/40"
                />
              </div>
            </div>
          </section>

          <aside className="space-y-4 lg:col-span-4">
            <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-blue-100">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-600">
                Resumo
              </h2>
              <div className="rounded-xl bg-[#E3F2FD] p-4">
                <p className="text-xs font-semibold uppercase text-gray-600">
                  Local
                </p>
                <p className="mt-1 text-base font-bold text-black">
                  {getLabName(reservation.laboratory_id)}
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  Tipo: {reservation.reservation_type === "room" ? "Sala" : "Computador"}
                </p>
              </div>
              <dl className="mt-4 space-y-2 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <dt>ID da reserva</dt>
                  <dd className="font-semibold text-black">#RES-{reservation.id}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Criado em</dt>
                  <dd className="font-semibold text-black">
                    {new Date(reservation.created_at).toLocaleDateString("pt-BR")}
                  </dd>
                </div>
              </dl>
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
          <button
            onClick={handleSave}
            disabled={submitting || reservation.status !== "pending"}
            className="rounded-lg bg-[#5BA4E5] px-6 py-2.5 text-sm font-bold text-black ring-2 ring-[#1A73E8] hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function EditarReservaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#B3D4FC] flex items-center justify-center">
        <div className="text-xl font-bold text-gray-700">Carregando...</div>
      </div>
    }>
      <EditarReservaContent />
    </Suspense>
  );
}
