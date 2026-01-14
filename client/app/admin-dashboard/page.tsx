import Link from "next/link";
import {
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  User as UserIcon,
  XCircle,
} from "lucide-react";

const dashboardStats = [
  {
    label: "Cadastros pendentes",
    value: "12",
    helper: "+2 desde ontem",
    icon: CheckCircle,
    bg: "bg-yellow-100",
    text: "text-yellow-800",
  },
  {
    label: "Reservas aguardando",
    value: "5",
    helper: "Para hoje",
    icon: Clock,
    bg: "bg-blue-100",
    text: "text-blue-800",
  },
  {
    label: "Recursos em uso",
    value: "85%",
    helper: "Computadores e salas",
    icon: Calendar,
    bg: "bg-green-100",
    text: "text-green-800",
  },
  {
    label: "Alertas",
    value: "3",
    helper: "Conflitos e falhas",
    icon: XCircle,
    bg: "bg-red-100",
    text: "text-red-800",
  },
];

const recentItems = [
  {
    name: "Maria Silva",
    type: "Cadastro",
    when: "Hoje, 10:23",
    status: "Pendente",
  },
  {
    name: "Lab 03",
    type: "Reserva de computador",
    when: "Hoje, 09:10",
    status: "Aguardando",
  },
  {
    name: "Sala de Reunião B",
    type: "Reserva de sala",
    when: "Ontem, 16:40",
    status: "Confirmado",
  },
];

export default function AdminDashboardHome() {
  return (
    <div className="min-h-screen bg-[#B3D4FC] font-sans">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-2">
            <Calendar className="h-8 w-8 text-[#0056D2]" strokeWidth={2.5} />
            <span className="text-xl font-bold tracking-tight text-black">
              RESERVAX
            </span>
          </div>
          <div className="flex items-center gap-8">
            <nav className="hidden items-center gap-6 text-sm font-bold text-gray-700 md:flex">
              <Link
                href="/admin-dashboard"
                className="text-[#0056D2] underline-offset-4 hover:underline"
              >
                Dashboard
              </Link>
              <Link
                href="/admin"
                className="hover:text-black"
              >
                Solicitações
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <button className="rounded-full p-2 hover:bg-blue-100">
                <Bell className="h-5 w-5 text-black" />
              </button>
              <button className="flex items-center justify-center rounded-full bg-black p-2">
                <UserIcon className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10">
        <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-700">Olá, Admin</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-black md:text-4xl">
              Visão geral de hoje
            </h1>
            <p className="mt-2 max-w-xl text-gray-700">
              Acompanhe rapidamente cadastros pendentes, reservas e utilização dos recursos.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="rounded-xl bg-white px-5 py-2 text-sm font-bold text-[#0056D2] shadow-sm ring-1 ring-blue-200 hover:bg-blue-50"
            >
              Ver solicitações
            </Link>
          </div>
        </section>

        <section className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map((item) => (
            <div
              key={item.label}
              className="flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-blue-100"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-600">
                    {item.label}
                  </p>
                  <p className="mt-3 text-3xl font-extrabold text-black">
                    {item.value}
                  </p>
                </div>
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.bg}`}
                >
                  <item.icon className={`h-6 w-6 ${item.text}`} />
                </div>
              </div>
              <p className="mt-4 text-xs font-medium text-gray-500">
                {item.helper}
              </p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-blue-100 lg:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-black">
                  Ocupação ao longo do dia
                </h2>
                <p className="text-sm text-gray-600">
                  Distribuição aproximada de uso dos recursos por horário.
                </p>
              </div>
              <div className="flex gap-2 text-xs font-medium text-gray-600">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-[#0056D2]">
                  Hoje
                </span>
                <span className="rounded-full px-3 py-1">Semana</span>
              </div>
            </div>
            <div className="mt-2 grid grid-flow-col grid-rows-[1fr_auto] items-end gap-4 px-2">
              {[
                { label: "08h", height: "h-20" },
                { label: "10h", height: "h-32" },
                { label: "12h", height: "h-40" },
                { label: "14h", height: "h-28" },
                { label: "16h", height: "h-16" },
                { label: "18h", height: "h-32" },
              ].map((bar) => (
                <div key={bar.label} className="flex flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className={`${bar.height} w-full rounded-t-md bg-[#5BA4E5]`}
                    />
                  </div>
                  <p className="text-xs font-semibold text-gray-500">
                    {bar.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-blue-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-black">
                Itens recentes
              </h2>
              <span className="text-xs font-medium text-gray-500">
                Últimas movimentações
              </span>
            </div>
            <ul className="space-y-3">
              {recentItems.map((item) => (
                <li
                  key={item.name + item.when}
                  className="flex items-start justify-between gap-3 rounded-xl bg-[#F5F7FF] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-bold text-black">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-600">{item.type}</p>
                    <p className="mt-1 text-xs text-gray-500">{item.when}</p>
                  </div>
                  <span className="mt-1 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0056D2]">
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/admin"
              className="block text-center text-sm font-bold text-[#0056D2] hover:underline"
            >
              Ver todos os detalhes
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

