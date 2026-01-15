"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Calendar,
    Clock,
    LogOut,
    MapPin,
    Search,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ChevronLeft,
    User,
    Monitor,
    Users as UsersIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
    Reservation,
    Laboratory,
    getAllReservations,
    getLaboratories,
    approveReservation,
    rejectReservation,
} from "../../lib/api";

export default function AdminReservasPage() {
    const router = useRouter();
    const { user, isLoading, logout } = useAuth();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

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
            fetchData();
        }
    }, [user, isLoading, router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [res, labs] = await Promise.all([
                getAllReservations(),
                getLaboratories(),
            ]);
            setReservations(res);
            setLaboratories(labs);
        } catch (err) {
            console.error(err);
            setError("Erro ao carregar dados");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const handleApprove = async (id: number) => {
        setProcessingId(id);
        setError(null);
        try {
            await approveReservation(id);
            fetchData(); // Refresh data
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao aprovar reserva");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: number) => {
        const reason = prompt("Motivo da rejeição (opcional):");
        if (reason === null) return; // Cancelled prompt

        setProcessingId(id);
        setError(null);
        try {
            await rejectReservation(id, reason || undefined);
            fetchData(); // Refresh data
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao rejeitar reserva");
        } finally {
            setProcessingId(null);
        }
    };

    const getLabName = (labId: number) => {
        const lab = laboratories.find((l) => l.id === labId);
        return lab?.name || "Laboratório";
    };

    const filteredReservations = reservations
        .filter((r) => {
            if (filter !== "all" && r.status !== filter) return false;
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                return (
                    r.title.toLowerCase().includes(search) ||
                    getLabName(r.laboratory_id).toLowerCase().includes(search) ||
                    r.id.toString().includes(search)
                );
            }
            return true;
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
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
                        <Link href="/admin-dashboard" className="hover:text-black">
                            Dashboard
                        </Link>
                        <Link href="/admin" className="hover:text-black">
                            Cadastros
                        </Link>
                        <Link
                            href="/admin/reservas"
                            className="text-[#0056D2] underline-offset-4 hover:underline"
                        >
                            Reservas
                        </Link>
                        <Link href="/admin/acessos" className="hover:text-black">
                            Acessos
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
                <div className="mb-8">
                    <Link
                        href="/admin-dashboard"
                        className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-[#0056D2] hover:underline"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Voltar ao Dashboard
                    </Link>
                    <h1 className="text-3xl font-extrabold tracking-tight text-black md:text-4xl">
                        Gerenciar Reservas
                    </h1>
                    <p className="mt-2 text-gray-700">
                        Aprove ou rejeite solicitações de reserva de laboratórios e computadores.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700 ring-1 ring-red-200">
                        <AlertTriangle className="h-5 w-5" />
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                )}

                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        {[
                            { id: "pending", label: "Pendentes" },
                            { id: "approved", label: "Aprovadas" },
                            { id: "rejected", label: "Rejeitadas" },
                            { id: "all", label: "Todas" },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setFilter(t.id as any)}
                                className={`rounded-full px-4 py-2 text-sm font-bold transition ${filter === t.id
                                        ? "bg-[#0056D2] text-white shadow-md"
                                        : "bg-white text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative max-w-xs w-full">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar reserva..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl border-none bg-white py-2 pl-10 pr-4 text-sm font-medium text-gray-900 shadow-sm focus:ring-2 focus:ring-[#0056D2]"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filteredReservations.length === 0 ? (
                        <div className="rounded-2xl bg-white p-12 text-center shadow-md">
                            <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                            <p className="mt-4 text-gray-500 font-medium">
                                Nenhuma reserva encontrada com os filtros atuais.
                            </p>
                        </div>
                    ) : (
                        filteredReservations.map((res) => (
                            <div
                                key={res.id}
                                className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:shadow-lg ring-1 ring-blue-100"
                            >
                                <div className="flex flex-col md:flex-row">
                                    <div className="flex flex-1 flex-col justify-between p-6">
                                        <div className="mb-4">
                                            <div className="mb-2 flex items-center justify-between">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${res.status === "pending"
                                                            ? "bg-yellow-50 text-yellow-700"
                                                            : res.status === "approved"
                                                                ? "bg-green-50 text-green-700"
                                                                : "bg-red-50 text-red-700"
                                                        }`}
                                                >
                                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                    {res.status === "pending"
                                                        ? "Pendente"
                                                        : res.status === "approved"
                                                            ? "Aprovada"
                                                            : "Rejeitada"}
                                                </span>
                                                <span className="text-xs font-bold text-gray-400">
                                                    ID: #RES-{res.id}
                                                </span>
                                            </div>
                                            <h2 className="text-xl font-bold text-black">{res.title}</h2>
                                            <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-[#0056D2]" />
                                                    <span className="font-medium">{getLabName(res.laboratory_id)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-[#0056D2]" />
                                                    <span className="font-medium">Usuário ID: {res.user_id}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-[#0056D2]" />
                                                    <span className="font-medium">
                                                        {new Date(res.start_time).toLocaleTimeString("pt-BR", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}{" "}
                                                        -{" "}
                                                        {new Date(res.end_time).toLocaleTimeString("pt-BR", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-[#0056D2]" />
                                                    <span className="font-medium">
                                                        {new Date(res.start_time).toLocaleDateString("pt-BR")}
                                                    </span>
                                                </div>
                                            </div>
                                            {res.description && (
                                                <p className="mt-3 text-sm text-gray-500 line-clamp-2 italic">
                                                    "{res.description}"
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                                            <span>Criada em: {formatDate(res.created_at)}</span>
                                            {res.reservation_type === "computer" && (
                                                <span className="flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[#0056D2]">
                                                    <Monitor className="h-3 w-3" />
                                                    Computador #{res.computer_id}
                                                </span>
                                            )}
                                            {res.reservation_type === "room" && (
                                                <span className="flex items-center gap-1 rounded bg-purple-50 px-2 py-0.5 text-purple-700">
                                                    <UsersIcon className="h-3 w-3" />
                                                    Sala Completa
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {res.status === "pending" && (
                                        <div className="flex border-t border-gray-100 bg-gray-50 md:w-48 md:flex-col md:border-l md:border-t-0 p-4 gap-3">
                                            <button
                                                onClick={() => handleApprove(res.id)}
                                                disabled={processingId === res.id}
                                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white shadow-sm ring-1 ring-green-700 hover:bg-green-700 disabled:opacity-50"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                                {processingId === res.id ? "..." : "Aprovar"}
                                            </button>
                                            <button
                                                onClick={() => handleReject(res.id)}
                                                disabled={processingId === res.id}
                                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-red-600 shadow-sm ring-1 ring-red-100 hover:bg-red-50 disabled:opacity-50"
                                            >
                                                <XCircle className="h-4 w-4" />
                                                {processingId === res.id ? "..." : "Rejeitar"}
                                            </button>
                                        </div>
                                    )}

                                    {(res.status === "approved" || res.status === "rejected") && (
                                        <div className="flex items-center justify-center border-t border-gray-100 bg-gray-50 md:w-48 md:flex-col md:border-l md:border-t-0 p-4">
                                            <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400">
                                                Processada por
                                                <br />
                                                Admin #{res.reviewed_by}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
