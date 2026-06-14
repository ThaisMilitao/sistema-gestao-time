"use client";

import { AlertTriangle, CheckCircle2, Clock, TrendingUp, Users, Zap } from "lucide-react";
import type { DashboardKPIs } from "@/types";
import { formatDate, getInitials, getAvatarColor, PRIORITY_LABELS, PRIORITY_COLORS, isOverdue } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DashboardClientProps {
  kpis: DashboardKPIs;
}

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  alert,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  alert?: boolean;
}) {
  return (
    <div className={cn(
      "bg-white rounded-xl border p-5 flex flex-col gap-3",
      alert ? "border-red-200 ring-1 ring-red-100" : "border-slate-200"
    )}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500 font-medium">{title}</span>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
          <Icon size={15} strokeWidth={2.5} className="text-white" />
        </div>
      </div>
      <div>
        <p className={cn("text-3xl font-bold", alert && Number(value) > 0 ? "text-red-600" : "text-slate-900")}>
          {value}
        </p>
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function MemberAvatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs";
  return (
    <div className={cn("rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0", sizeClass, getAvatarColor(name))}>
      {getInitials(name)}
    </div>
  );
}

export function DashboardClient({ kpis }: DashboardClientProps) {
  const workloadData = kpis.workloadByMember.map((w) => ({
    name: w.member.name.split(" ")[0],
    "A fazer": w.todo,
    "Em andamento": w.inProgress,
    Bloqueado: w.blocked,
    fullName: w.member.name,
    overdue: w.overdue,
    total: w.total,
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Painel do Time</h1>
        <p className="text-slate-500 text-sm mt-1">Visão geral do que está acontecendo agora</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="No prazo"
          value={`${kpis.onTimeRate}%`}
          subtitle="tarefas concluídas dentro do prazo"
          icon={CheckCircle2}
          color="bg-emerald-500"
        />
        <KPICard
          title="Atrasadas agora"
          value={kpis.overdueCount}
          subtitle="tarefas com prazo vencido"
          icon={AlertTriangle}
          color="bg-red-500"
          alert={kpis.overdueCount > 0}
        />
        <KPICard
          title="Velocidade semanal"
          value={kpis.weeklyVelocity}
          subtitle="tarefas concluídas nos últimos 7 dias"
          icon={TrendingUp}
          color="bg-violet-500"
        />
        <KPICard
          title="Vencem em 48h"
          value={kpis.dueSoonTasks.length}
          subtitle="tarefas com prazo próximo"
          icon={Clock}
          color="bg-amber-500"
          alert={kpis.dueSoonTasks.length > 0}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Workload Chart */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Carga por pessoa</h2>
          </div>
          <p className="text-xs text-slate-400 mb-5">Distribuição de tarefas ativas por membro</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={workloadData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelFormatter={(label, payload) => {
                  const item = payload?.[0]?.payload;
                  return item?.fullName ?? label;
                }}
              />
              <Bar dataKey="A fazer" stackId="a" fill="#e2e8f0" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Em andamento" stackId="a" fill="#818cf8" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Bloqueado" stackId="a" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3 justify-center">
            {[
              { label: "A fazer", color: "bg-slate-200" },
              { label: "Em andamento", color: "bg-indigo-400" },
              { label: "Bloqueado", color: "bg-red-400" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={cn("w-2.5 h-2.5 rounded-sm", l.color)} />
                <span className="text-xs text-slate-500">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">Status geral</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: "A fazer", value: kpis.statusBreakdown.todo, color: "bg-slate-300" },
                { label: "Em andamento", value: kpis.statusBreakdown.inProgress, color: "bg-indigo-400" },
                { label: "Concluído", value: kpis.statusBreakdown.done, color: "bg-emerald-400" },
                { label: "Bloqueado", value: kpis.statusBreakdown.blocked, color: "bg-red-400" },
              ].map((item) => {
                const total = Object.values(kpis.statusBreakdown).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="text-slate-400 font-medium">{item.value}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", item.color)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Overdue urgent */}
        <div className="bg-white rounded-xl border border-red-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={15} className="text-red-500" />
            <h2 className="text-sm font-semibold text-slate-900">Atrasadas e importantes</h2>
            {kpis.overdueUrgent.length > 0 && (
              <span className="ml-auto bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                {kpis.overdueUrgent.length}
              </span>
            )}
          </div>
          {kpis.overdueUrgent.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Nenhuma tarefa atrasada</p>
          ) : (
            <div className="space-y-2">
              {kpis.overdueUrgent.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  {task.member && <MemberAvatar name={task.member.name} />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                    <p className="text-xs text-red-500 mt-0.5">
                      Prazo: {formatDate(task.dueDate)} · {task.member?.name.split(" ")[0] ?? "Sem responsável"}
                    </p>
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0", PRIORITY_COLORS[task.priority])}>
                    {PRIORITY_LABELS[task.priority]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Due soon */}
        <div className="bg-white rounded-xl border border-amber-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={15} className="text-amber-500" />
            <h2 className="text-sm font-semibold text-slate-900">Vencem nas próximas 48h</h2>
            {kpis.dueSoonTasks.length > 0 && (
              <span className="ml-auto bg-amber-100 text-amber-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                {kpis.dueSoonTasks.length}
              </span>
            )}
          </div>
          {kpis.dueSoonTasks.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Nenhuma tarefa vence em breve</p>
          ) : (
            <div className="space-y-2">
              {kpis.dueSoonTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  {task.member && <MemberAvatar name={task.member.name} />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      {formatDate(task.dueDate)} · {task.member?.name.split(" ")[0] ?? "Sem responsável"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
