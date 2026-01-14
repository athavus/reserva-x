"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, User as UserIcon, Check, X, CheckCircle, XCircle } from "lucide-react";

type UserStatus = "Aprovado" | "Reprovado" | "Pendente";

interface UserRequest {
  id: number;
  name: string;
  email: string;
  role: "Professor" | "Estudante" | "Administrador";
  date: string;
  time: string;
  status: UserStatus;
}

const initialUsers: UserRequest[] = [
  {
    id: 1,
    name: "Maria José",
    email: "mariajose@ee.exemplo.com",
    role: "Professor",
    date: "12 Out, 2025",
    time: "13:00",
    status: "Aprovado",
  },
  {
    id: 2,
    name: "Fulano de Tal",
    email: "fulanodetal@ee.exemplo.com",
    role: "Estudante",
    date: "13 Out, 2025",
    time: "14:00",
    status: "Reprovado",
  },
  {
    id: 3,
    name: "Gustavo Vilar",
    email: "gustavovilar@ee.exemplo.com",
    role: "Professor",
    date: "14 Out, 2025",
    time: "15:00",
    status: "Aprovado",
  },
  {
    id: 4,
    name: "Miguel Ryan",
    email: "miguelryan@ee.exemplo.com",
    role: "Administrador",
    date: "15 Out, 2025",
    time: "16:00",
    status: "Pendente",
  },
  {
    id: 5,
    name: "Denilson de Tal",
    email: "denilsondetal@ee.exemplo.com",
    role: "Administrador",
    date: "16 Out, 2025",
    time: "17:00",
    status: "Pendente",
  },
];

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserRequest[]>(initialUsers);

  const handleApprove = (id: number) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, status: "Aprovado" } : user
    ));
  };

  const handleReject = (id: number) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, status: "Reprovado" } : user
    ));
  };

  const pendingCount = users.filter(u => u.status === "Pendente").length;
  const approvedCount = users.filter(u => u.status === "Aprovado").length;
  const rejectedCount = users.filter(u => u.status === "Reprovado").length;

  return (
    <div className="min-h-screen bg-[#B3D4FC] font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-end gap-6 bg-[#8FB9EE] px-8 py-4 shadow-sm">
        <Link href="#" className="font-bold text-gray-800 hover:text-black">
          Agendamentos
        </Link>
        <Link href="#" className="font-bold text-gray-800 hover:text-black">
          Configurações
        </Link>
        <div className="flex items-center gap-4 border-l border-gray-400 pl-4">
          <button className="rounded-full p-2 hover:bg-blue-300">
            <Bell className="h-6 w-6 text-black" />
          </button>
          <button className="rounded-full p-2 hover:bg-blue-300">
            <UserIcon className="h-8 w-8 text-black" />
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl p-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="mb-2 text-4xl font-extrabold text-black">
            Solicitações de Cadastro
          </h1>
          <p className="text-lg font-medium text-gray-600">
            Gerencie e analise os pedidos de novos usuários pendentes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Pendentes */}
          <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="text-lg font-bold text-gray-700">Pendentes</span>
              <div className="h-6 w-6 rounded-full bg-yellow-200"></div>
            </div>
            <span className="mt-4 text-4xl font-extrabold text-black">
              {pendingCount}+
            </span>
          </div>

          {/* Aprovados */}
          <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="text-lg font-bold text-gray-700">Aprovados</span>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <span className="mt-4 text-4xl font-extrabold text-black">
              {approvedCount}+
            </span>
          </div>

          {/* Reprovados */}
          <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="text-lg font-bold text-gray-700">Reprovados</span>
              <XCircle className="h-6 w-6 text-red-400" />
            </div>
            <span className="mt-4 text-4xl font-extrabold text-black">
              {rejectedCount}
            </span>
          </div>
        </div>

        {/* Table Section */}
        <div className="rounded-3xl bg-white p-8 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="pb-4 pl-4">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="pb-4 text-sm font-bold uppercase text-gray-500">
                    Usuário
                  </th>
                  <th className="pb-4 text-sm font-bold uppercase text-gray-500">
                    Perfil Solicitado
                  </th>
                  <th className="pb-4 text-sm font-bold uppercase text-gray-500">
                    Data
                  </th>
                  <th className="pb-4 text-sm font-bold uppercase text-gray-500">
                    Status
                  </th>
                  <th className="pb-4 text-sm font-bold uppercase text-gray-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="group hover:bg-gray-50">
                    <td className="py-4 pl-4">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black">
                          <UserIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-black">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span
                        className={`rounded-md px-3 py-1 text-xs font-bold ${
                          user.role === "Professor"
                            ? "bg-blue-100 text-blue-700"
                            : user.role === "Estudante"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4">
                      <div>
                        <p className="font-bold text-gray-700">{user.date}</p>
                        <p className="text-xs text-gray-500">{user.time}</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <span
                        className={`rounded-md px-3 py-1 text-xs font-bold ${
                          user.status === "Aprovado"
                            ? "bg-green-100 text-green-700"
                            : user.status === "Reprovado"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4">
                      {user.status === "Pendente" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="flex h-8 w-8 items-center justify-center rounded bg-green-400 text-white hover:bg-green-500 transition-colors"
                            title="Aprovar"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleReject(user.id)}
                            className="flex h-8 w-8 items-center justify-center rounded bg-red-400 text-white hover:bg-red-500 transition-colors"
                            title="Reprovar"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
