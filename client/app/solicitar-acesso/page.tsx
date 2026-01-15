"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, ChevronRight, Info, Lock, LogOut, MapPin, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
    Laboratory,
    getLaboratories,
    requestAccess,
    AccessRequest,
    getAccessRequests
} from "../lib/api";

export default function SolicitarAcessoPage() {
    const router = useRouter();
    const { user, isLoading, logout } = useAuth();
    const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
    const [pendingRequests, setPendingRequests] = useState<AccessRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [submittingLabId, setSubmittingLabId] = useState<number | null>(null);
    const [reason, setReason] = useState("");
    const [showForm, setShowForm] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
            return;
        }

        if (user) {
            // For this page, we might want to see laboratories we DON'T have access to
            // But the API currently returns all laboratories.
            // We also need to check which ones we already requested.
            Promise.all([
                getLaboratories(),
                // We'll filter pending ones in the UI
                getAccessRequests(false).catch(() => [] as AccessRequest[])
            ])
                .then(([labs, reqs]) => {
                    setLaboratories(labs);
                    setPendingRequests(reqs.filter(r => r.user_id === user.id));
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [user, isLoading, router]);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const handleRequest = async (labId: number) => {
        setSubmittingLabId(labId);
        setError(null);
        setSuccess(null);

        try {
            await requestAccess(labId, reason);
            setSuccess("Solicitação enviada com sucesso! Aguarde a análise do administrador.");
            setShowForm(null);
            setReason("");

            // Refresh requests
            const reqs = await getAccessRequests(false);
            setPendingRequests(reqs.filter(r => r.user_id === user?.id));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao enviar solicitação");
        } finally {
            setSubmittingLabId(null);
        }
    };

    const hasPendingRequest = (labId: number) => {
        return pendingRequests.some(r => r.laboratory_id === labId && !r.is_processed);
    };

    const getRequestStatus = (labId: number) => {
        const req = pendingRequests.find(r => r.laboratory_id === labId && !r.is_processed);
        if (req) return "Pendente";

        const processed = [...pendingRequests]
            .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
            .find(r => r.laboratory_id === labId && r.is_processed);

        if (processed) {
            return processed.is_approved ? "Aprovado" : "Rejeitado";
        }

        return null;
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

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold leading-tight text-black md:text-4xl">
                        Permissões de Acesso
                    </h1>
                    <p className="mt-2 text-gray-700">
                        Solicite permissão para reservar laboratórios ou computadores específicos.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 ring-1 ring-red-200">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700 ring-1 ring-green-200">
                        {success}
                    </div>
                )}

                <div className="grid gap-6">
                    {laboratories.map((lab) => {
                        const status = getRequestStatus(lab.id);
                        const isSelectable = !status || status === "Rejeitado";

                        return (
                            <div
                                key={lab.id}
                                className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-blue-100"
                            >
                                <div className="flex flex-col p-6 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E3F2FD] text-[#0056D2]">
                                            {status === "Aprovado" ? <ShieldCheck className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-black">{lab.name}</h3>
                                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                                                <MapPin className="h-4 w-4" />
                                                <span>{lab.description || "Descrição não informada"}</span>
                                            </div>
                                            {status && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${status === "Pendente" ? "bg-yellow-100 text-yellow-800" :
                                                            status === "Aprovado" ? "bg-green-100 text-green-800" :
                                                                "bg-red-100 text-red-800"
                                                        }`}>
                                                        {status}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-end md:mt-0">
                                        {isSelectable ? (
                                            <button
                                                onClick={() => setShowForm(showForm === lab.id ? null : lab.id)}
                                                className="flex items-center gap-2 rounded-lg bg-[#5BA4E5] px-6 py-2.5 text-sm font-bold text-black ring-2 ring-[#1A73E8] hover:bg-blue-400"
                                            >
                                                {status === "Rejeitado" ? "Solicitar novamente" : "Solicitar acesso"}
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Info className="h-5 w-5" />
                                                <span className="text-sm font-medium">Acesso já solicitado</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {showForm === lab.id && (
                                    <div className="border-t border-gray-100 bg-gray-50 p-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="mb-1 block text-sm font-semibold text-gray-800">
                                                    Justificativa (opcional)
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={reason}
                                                    onChange={(e) => setReason(e.target.value)}
                                                    placeholder="Explique por que você precisa de acesso a este laboratório..."
                                                    className="w-full rounded-lg border border-blue-200 bg-white p-3 text-sm text-gray-900 outline-none focus:border-[#0056D2] focus:ring-1 focus:ring-[#0056D2]"
                                                />
                                            </div>
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => setShowForm(null)}
                                                    className="rounded-lg px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={() => handleRequest(lab.id)}
                                                    disabled={submittingLabId !== null}
                                                    className="rounded-lg bg-[#0056D2] px-6 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    {submittingLabId === lab.id ? "Enviando..." : "Confirmar solicitação"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {laboratories.length === 0 && (
                        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-12 shadow-md">
                            <Info className="h-12 w-12 text-gray-300" />
                            <p className="mt-4 text-gray-500">Nenhum laboratório disponível encontrado.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
