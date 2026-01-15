"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, LogOut, MapPin, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  Laboratory,
  getLaboratories,
  createReservation
} from "../lib/api";

export default function NovaReservaSalaPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingLabId, setSubmittingLabId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(60); // minutes
  const [selectedLab, setSelectedLab] = useState<number | null>(null);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      getLaboratories()
        .then(setLaboratories)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleReserve = async (labId: number) => {
    if (!date) {
      setError("Selecione uma data");
      return;
    }

    const lab = laboratories.find((l) => l.id === labId);
    const reservationTitle = title || `Reserva de ${lab?.name || "Sala"}`;

    // Calculate start and end times
    // Calculate start and end times using local date components to avoid timezone shifts
    const [y, m, d] = date.split("-").map(Number);
    const [h, min] = startTime.split(":").map(Number);
    const startDateTime = new Date(y, m - 1, d, h, min, 0);

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + duration);

    setSubmittingLabId(labId);
    setError(null);

    try {
      await createReservation({
        laboratory_id: labId,
        reservation_type: "room",
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        title: reservationTitle,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/minhas-reservas");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar reserva");
    } finally {
      setSubmittingLabId(null);
    }
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
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-black"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
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
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              {(error.toLowerCase().includes("permissão") || error.toLowerCase().includes("negado")) && (
                <Link
                  href="/solicitar-acesso"
                  className="ml-4 rounded-md bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-800 hover:bg-red-200"
                >
                  Solicitar acesso
                </Link>
              )}
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-700 border border-green-200">
            Reserva criada com sucesso! Redirecionando...
          </div>
        )}

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
                    Título (opcional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Reunião de equipe"
                    className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-gray-900 outline-none ring-2 ring-transparent focus:border-[#1A73E8] focus:ring-[#1A73E8]/40"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-gray-700">
                    Data
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-lg border border-blue-200 bg-[#E3F2FD] px-3 py-2 text-gray-900 outline-none ring-2 ring-transparent focus:border-[#1A73E8] focus:ring-[#1A73E8]/40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block font-semibold text-gray-700">
                      Início
                    </label>
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-gray-900 outline-none ring-2 ring-transparent focus:border-[#1A73E8] focus:ring-[#1A73E8]/40"
                    >
                      {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-gray-700">
                      Duração
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-gray-900 outline-none ring-2 ring-transparent focus:border-[#1A73E8] focus:ring-[#1A73E8]/40"
                    >
                      <option value={30}>30 min</option>
                      <option value={60}>1h</option>
                      <option value={90}>1h 30min</option>
                      <option value={120}>2h</option>
                    </select>
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
                  {laboratories.length} laboratórios disponíveis
                </span>
              </p>
            </div>

            <div className="space-y-4">
              {laboratories.map((lab) => (
                <div
                  key={lab.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-5 shadow-md ring-1 ring-blue-100 md:flex-row"
                >
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                        <span className="rounded-full bg-[#E3F2FD] px-2 py-0.5 text-[#0056D2]">
                          LAB-{lab.id.toString().padStart(2, "0")}
                        </span>
                        <span>Até {lab.capacity} pessoas</span>
                      </div>
                    </div>
                    <h2 className="text-lg font-bold text-black">
                      {lab.name}
                    </h2>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {lab.description || "Laboratório disponível para reserva"}
                    </p>
                  </div>

                  <div className="flex items-end justify-between gap-4 md:flex-col md:items-end">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Users className="h-4 w-4 text-[#0056D2]" />
                      <span>{lab.is_active ? "Disponível" : "Indisponível"}</span>
                    </div>
                    <button
                      onClick={() => handleReserve(lab.id)}
                      disabled={submittingLabId !== null || !lab.is_active}
                      className="rounded-lg bg-[#5BA4E5] px-5 py-2 text-sm font-bold text-black ring-2 ring-[#1A73E8] hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingLabId === lab.id ? "Reservando..." : "Reservar"}
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
