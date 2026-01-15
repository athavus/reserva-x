"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  LogOut,
  Users,
  Clock,
  Monitor,
  AlertTriangle,
  FileText,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  RegistrationRequest,
  Reservation,
  Laboratory,
  getRegistrationRequests,
  getAllReservations,
  getLaboratories,
  getAccessRequests,
} from "../lib/api";

interface DashboardStats {
  pendingRegistrations: number;
  pendingReservations: number;
  pendingAccessRequests: number;
  totalLabs: number;
  activeLabs: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    pendingRegistrations: 0,
    pendingReservations: 0,
    pendingAccessRequests: 0,
    totalLabs: 0,
    activeLabs: 0,
  });
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (!isLoading && user && user.role !== "admin") {
      router.push("/home");
      return;
    }

    if (user && user.role === "admin") {
      Promise.all([
        getRegistrationRequests(),
        getAllReservations(),
        getLaboratories(),
        getAccessRequests(true),
      ])
        .then(([requests, reservations, labs, accessReqs]) => {
          const pendingReqs = requests.filter((r: RegistrationRequest) => !r.is_processed);
          const pendingRes = reservations.filter((r: Reservation) => r.status === "pending");

          setStats({
            pendingRegistrations: pendingReqs.length,
            pendingReservations: pendingRes.length,
            pendingAccessRequests: accessReqs.length,
            totalLabs: labs.length,
            activeLabs: labs.filter((l: Laboratory) => l.is_active).length,
          });

          // Get recent reservations
          const sorted = [...reservations].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setRecentReservations(sorted.slice(0, 5));
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

  const getLabName = (labId: number) => {
    const lab = laboratories.find((l) => l.id === labId);
    return lab?.name || "Laboratório";
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Se a diferença for negativa (futuro ou offset de timezone)
    if (diff < 0) {
      const absDiff = Math.abs(diff);
      if (absDiff < 1000 * 60 * 5) return "agora";
      return "em breve";
    }

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `há ${minutes}min`;
    if (hours < 24) return `há ${hours}h`;
    return `há ${days}d`;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved": return "Aprovada";
      case "pending": return "Pendente";
      case "rejected": return "Rejeitada";
      case "cancelled": return "Cancelada";
      default: return status;
    }
  };

  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#B3D4FC] flex items-center justify-center">
        <div className="text-xl font-bold text-gray-700">Carregando...</div>
      </div>
    );
  }

  const dashboardCards = [
    {
      title: "Cadastros pendentes",
      value: stats.pendingRegistrations,
      icon: Users,
      color: "text-[#FF9F68]",
      bgColor: "bg-[#FFF3E0]",
      link: "/admin",
    },
    {
      title: "Reservas aguardando",
      value: stats.pendingReservations,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      link: "/admin/reservas",
    },
    {
      title: "Laboratórios ativos",
      value: `${stats.activeLabs}/${stats.totalLabs}`,
      icon: Monitor,
      color: "text-green-600",
      bgColor: "bg-green-50",
      link: null,
    },
    {
      title: "Atividade recente",
      value: recentReservations.length,
      icon: FileText,
      color: "text-[#0056D2]",
      bgColor: "bg-[#E3F2FD]",
      link: null,
    },
    {
      title: "Acessos pendentes",
      value: stats.pendingAccessRequests,
      icon: ShieldCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      link: "/admin/acessos",
    },
  ];

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
              href="/admin-dashboard"
              className="text-[#0056D2] underline-offset-4 hover:underline"
            >
              Dashboard
            </Link>
            <Link href="/admin" className="hover:text-black">
              Solicitações
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
        <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-black md:text-4xl">
              Dashboard Administrativo
            </h1>
            <p className="text-sm font-medium text-gray-700">
              Visão geral do sistema de reservas
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow">
            <Clock className="h-4 w-4 text-[#0056D2]" />
            <span>{currentDate}</span>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dashboardCards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bgColor}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                {card.link && (
                  <Link
                    href={card.link}
                    className="text-xs font-semibold text-[#0056D2] hover:underline"
                  >
                    Ver
                  </Link>
                )}
              </div>
              <div>
                <p className="text-2xl font-extrabold text-black">{card.value}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  {card.title}
                </p>
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-black">
                  Reservas recentes
                </h2>
              </div>
              <div className="space-y-3">
                {recentReservations.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    Nenhuma reserva recente
                  </p>
                ) : (
                  recentReservations.map((res) => (
                    <div
                      key={res.id}
                      className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${res.status === "pending"
                          ? "bg-yellow-50 text-yellow-600"
                          : res.status === "approved"
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-600"
                          }`}>
                          {res.reservation_type === "room" ? (
                            <Users className="h-5 w-5" />
                          ) : (
                            <Monitor className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-black">
                            {res.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            {getLabName(res.laboratory_id)} • {getStatusLabel(res.status)}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTime(res.created_at)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {stats.pendingRegistrations > 0 && (
              <div className="rounded-2xl bg-[#FFF3E0] p-5 shadow-md ring-1 ring-[#FFCC80]">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-[#FF9F68]" />
                  <div className="flex-1">
                    <p className="font-bold text-[#7C2D12]">
                      {stats.pendingRegistrations} solicitação(ões) pendente(s)
                    </p>
                    <p className="mt-1 text-xs text-[#7C2D12]">
                      Há usuários aguardando aprovação de cadastro.
                    </p>
                    <Link
                      href="/admin"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#FF9F68] hover:underline"
                    >
                      Revisar agora
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-white p-5 shadow-md">
              <h2 className="mb-4 text-sm font-bold text-gray-800">
                Laboratórios
              </h2>
              <div className="space-y-3">
                {laboratories.slice(0, 4).map((lab) => (
                  <div
                    key={lab.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${lab.is_active ? "bg-green-500" : "bg-gray-400"
                        }`} />
                      <span className="text-sm font-medium text-gray-900">
                        {lab.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {lab.capacity} lugares
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
