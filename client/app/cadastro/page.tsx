"use client";

import Link from "next/link";
import { Calendar, User, Lock, Lightbulb, Building } from "lucide-react";
import { useState } from "react";

export default function CadastroPage() {
  const [perfil, setPerfil] = useState<"aluno" | "professor">("aluno");

  return (
    <div className="min-h-screen bg-[#B3D4FC] font-sans">
      {/* Header */}
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm md:px-12">
        <div className="flex items-center gap-2">
          <Calendar className="h-8 w-8 text-[#0056D2]" strokeWidth={2.5} />
          <span className="text-xl font-bold tracking-tight text-black">
            RESERVAX
          </span>
        </div>
        <Link
          href="/login"
          className="rounded-lg bg-[#A5C8FF] px-8 py-2 font-bold text-[#0056D2] hover:bg-blue-300 transition-colors"
        >
          Entrar
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg border border-blue-200 md:p-10">
          <h1 className="mb-2 text-3xl font-extrabold text-black">
            Solicitar Cadastro
          </h1>
          <p className="mb-8 text-gray-600 text-lg">
            Preencha seus dados para acessar o sistema de reservas
          </p>

          <form className="space-y-6">
            {/* Perfil Toggle */}
            <div className="space-y-2">
              <label className="block text-base font-bold text-black">
                Selecione seu perfil
              </label>
              <div className="flex rounded-lg border border-gray-300 bg-gray-200 p-1">
                <button
                  type="button"
                  onClick={() => setPerfil("aluno")}
                  className={`w-1/2 rounded-md py-2 text-center font-bold transition-colors ${
                    perfil === "aluno"
                      ? "bg-white text-[#0056D2] shadow-sm border border-gray-200"
                      : "text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  Aluno
                </button>
                <button
                  type="button"
                  onClick={() => setPerfil("professor")}
                  className={`w-1/2 rounded-md py-2 text-center font-bold transition-colors ${
                    perfil === "professor"
                      ? "bg-white text-[#0056D2] shadow-sm border border-gray-200"
                      : "text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  Professor
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-base font-bold text-black">
                E-mail
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-6 w-6 text-black" />
                </div>
                <input
                  type="email"
                  placeholder="exemplo@gmail.com.br"
                  className="block w-full rounded-lg border-2 border-[#1A73E8] bg-[#D9D9D9] p-3 pl-12 text-gray-900 placeholder-gray-600 focus:border-blue-500 focus:ring-blue-500 text-lg"
                />
              </div>
            </div>

            {/* Nome Completo */}
            <div className="space-y-2">
              <label className="block text-base font-bold text-black">
                Nome completo
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-6 w-6 text-black" />
                </div>
                <input
                  type="text"
                  placeholder="Insira seu nome"
                  className="block w-full rounded-lg border-2 border-[#1A73E8] bg-[#D9D9D9] p-3 pl-12 text-gray-900 placeholder-gray-600 focus:border-blue-500 focus:ring-blue-500 text-lg"
                />
              </div>
            </div>

            {/* Campo Condicional: Laboratório/Projeto (Aluno) ou Departamento (Professor) */}
            {perfil === "aluno" ? (
              <div className="space-y-2">
                <label className="block text-base font-bold text-black">
                  Laboratório/Projeto
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lightbulb className="h-6 w-6 text-black" />
                  </div>
                  <input
                    type="text"
                    placeholder="Que projeto você participa?"
                    className="block w-full rounded-lg border-2 border-[#1A73E8] bg-[#D9D9D9] p-3 pl-12 text-gray-900 placeholder-gray-600 focus:border-blue-500 focus:ring-blue-500 text-lg"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-base font-bold text-black">
                  Departamento
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Building className="h-6 w-6 text-black" />
                  </div>
                  <input
                    type="text"
                    placeholder="Qual seu departamento?"
                    className="block w-full rounded-lg border-2 border-[#1A73E8] bg-[#D9D9D9] p-3 pl-12 text-gray-900 placeholder-gray-600 focus:border-blue-500 focus:ring-blue-500 text-lg"
                  />
                </div>
              </div>
            )}

            {/* Botão Submit */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                className="w-48 rounded-xl bg-[#5BA4E5] py-3 text-xl font-bold text-black border-2 border-[#1A73E8] hover:bg-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-md transition-all"
              >
                Solicitar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
