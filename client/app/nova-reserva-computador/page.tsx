"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Computer, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  Laboratory,
  Computer as ComputerType,
  getLaboratories,
  getComputers,
  createReservation
} from "../lib/api";

export default function NovaReservaComputadorPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [computers, setComputers] = useState<ComputerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [selectedLab, setSelectedLab] = useState<number | null>(null);
  const [selectedComputer, setSelectedComputer] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [duration, setDuration] = useState(60);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      getLaboratories()
        .then((labs) => {
          setLaboratories(labs);
          if (labs.length > 0) {
            setSelectedLab(labs[0].id);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (selectedLab) {
      getComputers(selectedLab)
        .then(setComputers)
        .catch(console.error);
    }
  }, [selectedLab]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleSubmit = async () => {
    if (!date || !selectedLab || !selectedComputer) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    const computer = computers.find((c) => c.id === selectedComputer);

    // Calculate start and end times using local date components to avoid timezone shifts
    const [y, m, d] = date.split("-").map(Number);
    const [h, min] = selectedTime.split(":").map(Number);
    const startDateTime = new Date(y, m - 1, d, h, min, 0);

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + duration);

    setSubmitting(true);
    setError(null);

    try {
      await createReservation({
        laboratory_id: selectedLab,
        computer_id: selectedComputer,
        reservation_type: "computer",
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        title: `Reserva de ${computer?.name || "Computador"}`,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/minhas-reservas");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar reserva");
    } finally {
      setSubmitting(false);
    }
  };

  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

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
              href="/nova-reserva-computador"
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
          <span className="text-black">Nova reserva de computador</span>
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight text-black md:text-4xl">
              Reservar computador
            </h1>
            <p className="mt-2 text-gray-700">
              Selecione laboratório, horário e o equipamento desejado.
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
              <h2 className="mb-4 text-sm font-bold text-gray-800">
                Configuração
              </h2>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="mb-1 block font-semibold text-gray-700">
                    Laboratório
                  </label>
                  <select
                    value={selectedLab || ""}
                    onChange={(e) => {
                      setSelectedLab(Number(e.target.value));
                      setSelectedComputer(null);
                    }}
                    className="w-full rounded-lg border border-blue-200 bg-[#E3F2FD] px-3 py-2 text-gray-900 outline-none ring-2 ring-transparent focus:border-[#1A73E8] focus:ring-[#1A73E8]/40"
                  >
                    {laboratories.map((lab) => (
                      <option key={lab.id} value={lab.id}>
                        {lab.name}
                      </option>
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
                    <option value={60}>1 hora</option>
                    <option value={120}>2 horas</option>
                    <option value={180}>3 horas</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-blue-100">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-800">
                <Calendar className="h-5 w-5 text-[#0056D2]" />
                Data
              </h2>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-blue-200 bg-[#E3F2FD] px-3 py-2 text-gray-900 outline-none ring-2 ring-transparent focus:border-[#1A73E8] focus:ring-[#1A73E8]/40"
              />
              <p className="mt-3 text-xs text-gray-700">
                Selecione a data. Os horários disponíveis serão atualizados conforme o laboratório escolhido.
              </p>
            </div>
          </section>

          <section className="space-y-6 lg:col-span-8">
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-gray-800">
                Horário disponível
              </h2>
              <div className="flex flex-wrap gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`rounded-full px-5 py-2 text-sm font-semibold ${time === selectedTime
                      ? "bg-[#5BA4E5] text-black ring-2 ring-[#1A73E8]"
                      : "bg-white text-gray-800 ring-1 ring-blue-100 hover:bg-blue-50"
                      }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-700">
                <h2 className="flex items-center gap-2 font-bold text-gray-800">
                  <Computer className="h-5 w-5 text-[#0056D2]" />
                  Selecione o computador
                </h2>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full border border-gray-300 bg-white" />
                    Livre
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full border border-orange-300 bg-orange-100" />
                    Selecionado
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {computers.length === 0 ? (
                  <div className="col-span-full text-center text-gray-500 py-4">
                    Nenhum computador disponível neste laboratório.
                  </div>
                ) : (
                  computers.map((computer) => {
                    const isSelected = computer.id === selectedComputer;

                    return (
                      <button
                        key={computer.id}
                        onClick={() => setSelectedComputer(computer.id)}
                        disabled={!computer.is_active}
                        className={`flex flex-col items-center justify-center gap-2 rounded-xl p-4 text-center text-sm font-medium transition-all ${!computer.is_active
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : isSelected
                            ? "bg-orange-100 text-orange-700 ring-2 ring-orange-400"
                            : "bg-white text-gray-900 ring-1 ring-blue-100 hover:bg-blue-50"
                          }`}
                      >
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${!computer.is_active
                          ? "bg-gray-200"
                          : "bg-[#E3F2FD] text-[#0056D2]"
                          }`}>
                          <Computer className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-bold">{computer.name}</p>
                        <p className="text-xs text-gray-600">
                          {computer.specifications || "PC"}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link
                href="/minhas-reservas"
                className="rounded-lg border border-blue-200 bg-white px-6 py-2.5 text-sm font-bold text-gray-800 hover:bg-blue-50"
              >
                Cancelar
              </Link>
              <button
                onClick={handleSubmit}
                disabled={submitting || !selectedComputer}
                className="rounded-lg bg-[#5BA4E5] px-6 py-2.5 text-sm font-bold text-black ring-2 ring-[#1A73E8] hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Criando..." : "Confirmar reserva"}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
