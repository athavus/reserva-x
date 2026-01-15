"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, LogOut, Check, X, Clock, Mail, Building } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  RegistrationRequest,
  getRegistrationRequests,
  approveRegistrationRequest,
  rejectRegistrationRequest
} from "../lib/api";

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
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
      getRegistrationRequests()
        .then(setRequests)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [user, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleApprove = async (id: number, role: "aluno" | "professor") => {
    setProcessingId(id);
    setError(null);

    try {
      await approveRegistrationRequest(id, role);
      setRequests(requests.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao aprovar");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setProcessingId(id);
    setError(null);

    try {
      await rejectRegistrationRequest(id);
      setRequests(requests.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao rejeitar");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#B3D4FC] flex items-center justify-center">
        <div className="text-xl font-bold text-gray-700">Carregando...</div>
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => !r.is_processed);

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
            <Link
              href="/admin"
              className="text-[#0056D2] underline-offset-4 hover:underline"
            >
              Cadastros
            </Link>
            <Link href="/admin/reservas" className="hover:text-black">
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

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight text-black md:text-4xl">
              Solicitações de cadastro
            </h1>
            <p className="mt-2 text-gray-700">
              Gerencie as solicitações de novos usuários do sistema.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow">
            <Clock className="h-4 w-4 text-[#0056D2]" />
            <span>{pendingRequests.length} pendente(s)</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow-md">
              Nenhuma solicitação de cadastro pendente.
            </div>
          ) : (
            pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-blue-100 md:flex-row"
              >
                <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                        <span className="h-2 w-2 rounded-full bg-current" />
                        Aguardando aprovação
                      </span>
                      <span className="text-xs text-gray-500">
                        ID #{request.id}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail className="h-4 w-4 text-[#0056D2]" />
                        <span className="font-medium">{request.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Building className="h-4 w-4 text-[#0056D2]" />
                        <span>{request.project_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>Solicitado em {formatDate(request.submitted_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                    <span className="text-sm text-gray-600">Aprovar como:</span>
                    <button
                      onClick={() => handleApprove(request.id, "aluno")}
                      disabled={processingId === request.id}
                      className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      Aluno
                    </button>
                    <button
                      onClick={() => handleApprove(request.id, "professor")}
                      disabled={processingId === request.id}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      Professor
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Rejeitar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
