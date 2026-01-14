import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  Info,
  LogOut,
  MapPin,
  User,
  XCircle,
} from "lucide-react";

export default function CancelarReservaPage() {
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
            <Link
              href="/minhas-reservas"
              className="text-[#0056D2] underline-offset-4 hover:underline"
            >
              Minhas reservas
            </Link>
          </nav>
          <Link
            href="/login"
            className="flex items-center gap-2 text-gray-600 hover:text-black"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <Link href="/home" className="hover:underline">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/minhas-reservas" className="hover:underline">
              Minhas reservas
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800">Cancelar</span>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-black md:text-4xl">
                Cancelar reserva
              </h1>
              <p className="mt-1 max-w-xl text-sm text-gray-700">
                Revise os detalhes da reserva antes de confirmar o cancelamento.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl bg-white shadow-md">
              <div className="relative h-40 bg-gradient-to-tr from-[#0056D2] to-[#5BA4E5]">
                <div className="absolute inset-0 opacity-20" />
                <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0056D2]">
                  Confirmada
                </div>
              </div>
              <div className="space-y-3 p-5">
                <h2 className="text-lg font-bold text-black">
                  Aula de Estatística
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <User className="h-4 w-4 text-[#0056D2]" />
                  <span>Prof. Carlos Silva</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="h-4 w-4 text-[#0056D2]" />
                  <span>24 de outubro, 2025</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock className="h-4 w-4 text-[#0056D2]" />
                  <span>14:00 - 16:00</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="h-4 w-4 text-[#0056D2]" />
                  <span>Sala 302, Bloco C</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-[#FFF3E0] p-4 text-sm text-[#7C2D12] shadow-sm ring-1 ring-[#FFCC80]">
              <Info className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold">Política de cancelamento</p>
                <p className="mt-1 text-xs text-[#7C2D12]">
                  Cancelamentos são gratuitos até 24 horas antes do horário
                  agendado. Após esse período, pode ser aplicada uma restrição
                  de uso do sistema.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <h2 className="mb-4 border-b border-gray-100 pb-3 text-lg font-bold text-black">
                Detalhes da reserva
              </h2>
              <div className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Código da reserva
                  </p>
                  <p className="font-medium text-gray-900">#RES-98234</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Data do pedido
                  </p>
                  <p className="font-medium text-gray-900">10/10/2025</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Tipo de recurso
                  </p>
                  <p className="font-medium text-gray-900">Sala de aula</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Responsável
                  </p>
                  <p className="font-medium text-gray-900">
                    Coordenação de Matemática
                  </p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status de disponibilidade após cancelamento
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-gray-100">
                      <div className="h-full w-full rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-xs font-bold text-emerald-600">
                      Horário liberado para outros usuários
                    </span>
                  </div>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Informações adicionais
                  </p>
                  <div className="flex items-center gap-2 text-gray-700">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span className="text-xs">
                      Esta reserva não possui cobrança financeira associada.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-md">
              <h2 className="mb-4 text-lg font-bold text-black">
                Motivo do cancelamento
              </h2>

              <div className="space-y-4 text-sm">
                <div className="space-y-2">
                  <label
                    htmlFor="motivo"
                    className="text-sm font-medium text-gray-800"
                  >
                    Selecione um motivo (opcional)
                  </label>
                  <div className="relative">
                    <select
                      id="motivo"
                      className="h-11 w-full rounded-lg border border-blue-200 bg-white px-3 pr-8 text-sm text-gray-800 shadow-sm focus:border-[#0056D2] focus:outline-none focus:ring-1 focus:ring-[#0056D2]"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Escolha uma opção...
                      </option>
                      <option value="schedule">Conflito de agenda</option>
                      <option value="health">Problemas pessoais</option>
                      <option value="mistake">
                        Reserva feita por engano
                      </option>
                      <option value="other">Outro motivo</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="comentarios"
                    className="text-sm font-medium text-gray-800"
                  >
                    Comentários adicionais
                  </label>
                  <textarea
                    id="comentarios"
                    rows={4}
                    className="w-full resize-y rounded-lg border border-blue-200 bg-white p-3 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-[#0056D2] focus:outline-none focus:ring-1 focus:ring-[#0056D2]"
                    placeholder="Você pode adicionar detalhes para ajudar na gestão dos recursos..."
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                <Link
                  href="/minhas-reservas"
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-100"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Link>
                <button className="flex items-center justify-center gap-2 rounded-lg bg-[#FF9F68] px-6 py-2.5 text-sm font-bold text-[#7C2D12] shadow-sm hover:bg-[#FFB380]">
                  <XCircle className="h-4 w-4" />
                  Confirmar cancelamento
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

