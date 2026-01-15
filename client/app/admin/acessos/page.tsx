"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Calendar,
    Check,
    Clock,
    LogOut,
    ShieldCheck,
    Users,
    X,
    User as UserIcon,
    MapPin,
    AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
    AccessRequest,
    Laboratory,
    getAccessRequests,
    getLaboratories,
    processAccessRequest,
    getAllReservations, // We can use this to get all users or at least see names if we had a list users endpoint
} from "../../lib/api";

export default function AdminAcessosPage() {
    const router = useRouter();
    const { user, isLoading, logout } = useAuth();
    const [requests, setRequests] = useState<AccessRequest[]>([]);
    const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
    const [loading, setLoading] = useState(true);
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
            Promise.all([
                getAccessRequests(false),
                getLaboratories()
            ])
                .then(([reqs, labs]) => {
                    // Sort pending first
                    setRequests(reqs.sort((a, b) => {
                        if (a.is_processed === b.is_processed) {
                            return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
                        }
                        return a.is_processed ? 1 : -1;
                    }));
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

    const handleProcess = async (id: number, approved: boolean) => {
        setProcessingId(id);
        setError(null);

        try {
            await processAccessRequest(id, approved);

            // Update local state
            setRequests(prev => prev.map(r =>
                r.id === id
                    ? { ...r, is_processed: true, is_approved: approved, processed_at: new Date().toISOString() }
                    : r
            ));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao processar solicitação");
        } finally {
            setProcessingId(null);
        }
    };

    const getLabName = (labId: number) => {
        return laboratories.find(l => l.id === labId)?.name || `Laboratório #${labId}`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
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
                        <span className="text-xl font-bold text-black">RESERVAX | ADMIN</span>
                    </div>
                    <nav className="hidden items-center gap-6 text-sm font-bold text-gray-700 md:flex">
                        <Link href="/admin-dashboard" className="hover:text-black">
                            Dashboard
                        </Link>
                        <Link href="/admin" className="hover:text-black">
                            Cadastros
                        </Link>
                        <Link href="/admin/reservas" className="hover:text-black">
                            Reservas
                        </Link>
                        <Link
                            href="/admin/acessos"
                            className="text-[#0056D2] underline-offset-4 hover:underline"
                        >
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
                    <h1 className="text-3xl font-extrabold leading-tight text-black md:text-4xl">
                        Gerenciar Acessos
                    </h1>
                    <p className="mt-2 text-gray-700">
                        Aprove ou rejeite solicitações de permissão para uso de laboratórios.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 ring-1 ring-red-200">
                        <AlertCircle className="h-5 w-5" />
                        {error}
                    </div>
                )}

                <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-blue-100">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Usuário
                                </th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Laboratório
                                </th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Data
                                </th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Justificativa
                                </th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {requests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                                                <UserIcon className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm font-medium text-black">Usuário #{req.user_id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <MapPin className="h-4 w-4 text-[#0056D2]" />
                                            {getLabName(req.laboratory_id)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatDate(req.submitted_at)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 italic">
                                        {req.reason || "Sem justificativa"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${!req.is_processed ? "bg-yellow-100 text-yellow-800" :
                                            req.is_approved ? "bg-green-100 text-green-800" :
                                                "bg-red-100 text-red-800"
                                            }`}>
                                            {!req.is_processed ? "Pendente" : req.is_approved ? "Aprovado" : "Rejeitado"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {!req.is_processed ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleProcess(req.id, false)}
                                                    disabled={processingId === req.id}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                    title="Rejeitar"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleProcess(req.id, true)}
                                                    disabled={processingId === req.id}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 shadow-sm"
                                                    title="Aprovar"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">
                                                Processado em {formatDate(req.processed_at!)}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {requests.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <ShieldCheck className="h-12 w-12 text-gray-200" />
                            <p className="mt-4 text-gray-500">Nenhuma solicitação de acesso encontrada.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
