"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  FileText,
  Globe2,
  Lock,
  LogOut,
  PlusCircle,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createReservation, getLaboratories, Laboratory } from "../lib/api";
import { useEffect } from "react";

export default function CriarAtividadePage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(60);
  const [isConfidential, setIsConfidential] = useState(false);
  const [selectedLab, setSelectedLab] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      getLaboratories()
        .then((labs) => {
          setLaboratories(labs);
          if (labs.length > 0) setSelectedLab(labs[0].id);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleSubmit = async () => {
    if (!title || !date || !selectedLab) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    // Calculate start and end times using local date components to avoid timezone shifts
    const [y, m, d] = date.split("-").map(Number);
    const [h, min] = startTime.split(":").map(Number);
    const startDateTime = new Date(y, m - 1, d, h, min, 0);

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + duration);

    setSubmitting(true);
    setError(null);

    try {
      await createReservation({
        laboratory_id: selectedLab,
        reservation_type: "room",
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        title,
        description: description || undefined,
        is_confidential: isConfidential,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/minhas-reservas");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar atividade");
    } finally {
      setSubmitting(false);
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
              href="/criar-atividade"
              className="text-[#0056D2] underline-offset-4 hover:underline"
            >
              Nova atividade
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
        <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-black md:text-4xl">
              Nova atividade
            </h1>
            <p className="max-w-xl text-sm text-gray-700">
              Preencha os campos abaixo para criar uma reserva com detalhes de atividade.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Link>
          </div>
        </section>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-700 border border-green-200">
            Atividade criada com sucesso! Redirecionando...
          </div>
        )}

        <section className="rounded-2xl bg-white p-6 shadow-md">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  <FileText className="h-4 w-4 text-[#0056D2]" />
                  <span>Título da atividade</span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex.: Aula de revisão para prova"
                  className="h-11 w-full rounded-lg border border-blue-200 bg-white px-3 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-[#0056D2] focus:outline-none focus:ring-1 focus:ring-[#0056D2]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                <FileText className="h-4 w-4 text-[#0056D2]" />
                <span>Descrição</span>
              </div>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Adicione detalhes, pauta e orientações importantes..."
                className="w-full resize-y rounded-lg border border-blue-200 bg-white p-3 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-[#0056D2] focus:outline-none focus:ring-1 focus:ring-[#0056D2]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                <Calendar className="h-4 w-4 text-[#0056D2]" />
                <span>Laboratório</span>
              </div>
              <select
                value={selectedLab || ""}
                onChange={(e) => setSelectedLab(Number(e.target.value))}
                className="h-11 w-full rounded-lg border border-blue-200 bg-white px-3 text-sm text-gray-800 shadow-sm focus:border-[#0056D2] focus:outline-none focus:ring-1 focus:ring-[#0056D2]"
              >
                {laboratories.map((lab) => (
                  <option key={lab.id} value={lab.id}>
                    {lab.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  <Calendar className="h-4 w-4 text-[#0056D2]" />
                  <span>Data</span>
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="h-11 w-full rounded-lg border border-blue-200 bg-white px-3 text-sm text-gray-800 shadow-sm focus:border-[#0056D2] focus:outline-none focus:ring-1 focus:ring-[#0056D2]"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  <Clock className="h-4 w-4 text-[#0056D2]" />
                  <span>Hora de início</span>
                </div>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-11 w-full rounded-lg border border-blue-200 bg-white px-3 text-sm text-gray-800 shadow-sm focus:border-[#0056D2] focus:outline-none focus:ring-1 focus:ring-[#0056D2]"
                >
                  {["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  <Clock className="h-4 w-4 text-[#0056D2]" />
                  <span>Duração</span>
                </div>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="h-11 w-full rounded-lg border border-blue-200 bg-white px-3 text-sm text-gray-800 shadow-sm focus:border-[#0056D2] focus:outline-none focus:ring-1 focus:ring-[#0056D2]"
                >
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>1 hora</option>
                  <option value={90}>1 hora e 30 minutos</option>
                  <option value={120}>2 horas</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                <Lock className="h-4 w-4 text-[#0056D2]" />
                <span>Visibilidade</span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="visibilidade"
                    checked={!isConfidential}
                    onChange={() => setIsConfidential(false)}
                    className="peer sr-only"
                  />
                  <div className="flex items-center gap-4 rounded-xl border border-blue-200 bg-white p-4 shadow-sm transition peer-checked:border-[#0056D2] peer-checked:ring-1 peer-checked:ring-[#0056D2]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E3F2FD] text-[#0056D2]">
                      <Globe2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Não confidencial
                      </p>
                      <p className="text-xs text-gray-600">
                        Visível para todos os usuários.
                      </p>
                    </div>
                  </div>
                </label>

                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="visibilidade"
                    checked={isConfidential}
                    onChange={() => setIsConfidential(true)}
                    className="peer sr-only"
                  />
                  <div className="flex items-center gap-4 rounded-xl border border-blue-200 bg-white p-4 shadow-sm transition peer-checked:border-[#0056D2] peer-checked:ring-1 peer-checked:ring-[#0056D2]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E3F2FD] text-[#0056D2]">
                      <EyeOff className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Confidencial
                      </p>
                      <p className="text-xs text-gray-600">
                        Visível apenas para você e administradores.
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
              <Link
                href="/home"
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-100"
              >
                Cancelar
              </Link>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#0056D2] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusCircle className="h-4 w-4" />
                {submitting ? "Criando..." : "Criar atividade"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
