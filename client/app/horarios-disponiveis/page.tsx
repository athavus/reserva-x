"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Clock, LogOut, Monitor, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  Laboratory,
  Reservation,
  getLaboratories,
  getAllReservations,
} from "../lib/api";

interface TimeSlot {
  time: string;
  label: string;
}

const timeSlots: TimeSlot[] = [
  { time: "08:00", label: "08:00" },
  { time: "09:00", label: "09:00" },
  { time: "10:00", label: "10:00" },
  { time: "11:00", label: "11:00" },
  { time: "12:00", label: "12:00" },
  { time: "13:00", label: "13:00" },
  { time: "14:00", label: "14:00" },
  { time: "15:00", label: "15:00" },
  { time: "16:00", label: "16:00" },
  { time: "17:00", label: "17:00" },
];

export default function HorariosDisponiveisPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      Promise.all([getLaboratories(), getAllReservations()])
        .then(([labs, res]) => {
          setLaboratories(labs);
          setReservations(res);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Check if a lab is available at a given time
  const getSlotStatus = (labId: number, time: string): "available" | "reserved" | "partial" => {
    const dateStr = selectedDate;
    const [hours] = time.split(":").map(Number);

    const slotStart = new Date(`${dateStr}T${time}:00`);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(slotEnd.getHours() + 1);

    const conflicting = reservations.filter((r) => {
      if (r.laboratory_id !== labId) return false;
      if (r.status === "rejected") return false;

      const resStart = new Date(r.start_time);
      const resEnd = new Date(r.end_time);

      // Check if reservation overlaps with this slot
      return resStart < slotEnd && resEnd > slotStart;
    });

    if (conflicting.length === 0) return "available";
    // Check if room reservation (fully booked)
    if (conflicting.some(r => r.reservation_type === "room")) return "reserved";
    return "partial";
  };

  const getSlotClass = (status: "available" | "reserved" | "partial") => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer";
      case "reserved":
        return "bg-red-100 text-red-700 cursor-not-allowed";
      case "partial":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 cursor-pointer";
    }
  };

  const getSlotLabel = (status: "available" | "reserved" | "partial") => {
    switch (status) {
      case "available": return "Livre";
      case "reserved": return "Ocupado";
      case "partial": return "Parcial";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight text-black md:text-4xl">
              Horários disponíveis
            </h1>
            <p className="mt-2 text-gray-700">
              Visualize a disponibilidade de laboratórios e computadores.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm"
            />
          </div>
        </div>

        <div className="mb-4 flex items-center gap-4 text-sm">
          <span className="text-gray-600">Legenda:</span>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-green-100 border border-green-200" />
            <span>Livre</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-yellow-100 border border-yellow-200" />
            <span>Parcial</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-red-100 border border-red-200" />
            <span>Ocupado</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-white p-4 shadow-md">
          <p className="mb-4 text-sm font-medium text-gray-600">
            {formatDate(selectedDate)}
          </p>

          <table className="w-full min-w-[800px] table-fixed">
            <thead>
              <tr>
                <th className="w-48 bg-gray-50 px-4 py-3 text-left text-sm font-bold text-gray-700">
                  Laboratório
                </th>
                {timeSlots.map((slot) => (
                  <th
                    key={slot.time}
                    className="bg-gray-50 px-2 py-3 text-center text-xs font-semibold text-gray-600"
                  >
                    {slot.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {laboratories.map((lab) => (
                <tr key={lab.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E3F2FD] text-[#0056D2]">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-black">{lab.name}</p>
                        <p className="text-xs text-gray-500">{lab.capacity} lugares</p>
                      </div>
                    </div>
                  </td>
                  {timeSlots.map((slot) => {
                    const status = getSlotStatus(lab.id, slot.time);
                    return (
                      <td key={slot.time} className="px-1 py-2 text-center">
                        <Link
                          href={status !== "reserved" ? `/nova-reserva-sala?lab=${lab.id}&date=${selectedDate}&time=${slot.time}` : "#"}
                          className={`block rounded-lg px-2 py-2 text-xs font-semibold ${getSlotClass(status)}`}
                        >
                          {getSlotLabel(status)}
                        </Link>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/nova-reserva-sala"
            className="inline-flex items-center gap-2 rounded-lg bg-[#5BA4E5] px-6 py-3 text-sm font-bold text-black ring-2 ring-[#1A73E8] hover:bg-blue-400"
          >
            <Users className="h-4 w-4" />
            Reservar sala
          </Link>
          <Link
            href="/nova-reserva-computador"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-gray-800 ring-1 ring-blue-200 hover:bg-blue-50"
          >
            <Monitor className="h-4 w-4" />
            Reservar computador
          </Link>
        </div>
      </main>
    </div>
  );
}
