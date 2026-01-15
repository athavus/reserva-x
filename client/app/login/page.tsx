"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Lock, User, UserPlus, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }

    setLoading(true);

    try {
      const user = await login(email, password);

      // Redirect based on user role
      if (user.role === "admin") {
        router.push("/admin-dashboard");
      } else {
        router.push("/home");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro ao conectar com o servidor. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Lado Esquerdo - Banner */}
      <div className="hidden w-1/2 flex-col justify-between bg-[#B3D4FC] p-12 md:flex lg:p-16">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Calendar className="h-8 w-8 text-[#0056D2]" strokeWidth={2.5} />
          <span className="text-xl font-bold tracking-tight text-black">
            RESERVAX
          </span>
        </div>

        {/* Texto Principal */}
        <div className="max-w-md">
          <h1 className="mb-6 text-5xl font-extrabold leading-tight text-black">
            Gerencie seus recursos com{" "}
            <span className="text-[#0056D2]">simplicidade.</span>
          </h1>
          <p className="text-lg leading-relaxed text-gray-800">
            A plataforma completa para agendamento de salas e equipamentos.
            Otimize o seu tempo e organize suas demandas através do nosso
            sistema.
          </p>
        </div>

        {/* Espaçador para alinhar layout (opcional) */}
        <div></div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="flex w-full flex-col justify-center bg-white p-8 md:w-1/2 lg:p-24">
        <div className="mx-auto w-full max-w-md">
          <h2 className="mb-2 text-3xl font-bold text-black">
            Bem-vindo(a) de volta
          </h2>
          <p className="mb-8 text-gray-600">
            Insira suas credenciais para acessar o painel
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-bold text-black"
              >
                E-mail
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-black" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="exemplo@gmail.com.br"
                  className="block w-full rounded-lg border-2 border-[#1A73E8] bg-[#D9D9D9] p-3 pl-10 text-gray-900 placeholder-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-bold text-black"
              >
                Senha
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-black" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="insira sua senha"
                  className="block w-full rounded-lg border-2 border-[#1A73E8] bg-[#D9D9D9] p-3 pl-10 text-gray-900 placeholder-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-start">
                <a
                  href="#"
                  className="text-sm font-bold text-[#1A73E8] hover:underline"
                >
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1A73E8] px-5 py-3 text-center text-sm font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LogIn className="h-5 w-5" />
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          {error && (
            <p className="mt-4 text-center text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">Novo por aqui?</span>
            </div>
          </div>

          <div className="rounded-xl bg-[#FFF5EB] p-6 text-center">
            <h3 className="mb-2 text-lg font-bold text-black">
              Não possui acesso?
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Solicite o cadastro a um administrador.
            </p>
            <Link
              href="/cadastro"
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#FF8A80] bg-white px-5 py-3 text-sm font-bold text-[#FF5252] hover:bg-red-50"
            >
              <UserPlus className="h-5 w-5" />
              Solicitar cadastro
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
