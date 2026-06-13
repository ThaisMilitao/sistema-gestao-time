"use client";

import { useState } from "react";
import { Plus, Users, CheckCircle2, Clock, AlertTriangle, X } from "lucide-react";
import type { Member, Task } from "@/types";
import { cn, getInitials, getAvatarColor, isOverdue } from "@/lib/utils";

interface MemberWithTasks extends Member {
  tasks: Task[];
}

interface MembersClientProps {
  initialMembers: MemberWithTasks[];
}

function MemberAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  return (
    <div className={cn("rounded-full flex items-center justify-center text-white font-bold flex-shrink-0", sizes[size], getAvatarColor(name))}>
      {getInitials(name)}
    </div>
  );
}

function AddMemberModal({ onSave, onClose }: { onSave: (data: any) => Promise<void>; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) return;
    setSaving(true);
    setError("");
    try {
      await onSave({ name, email, role });
    } catch (e: any) {
      setError(e.message || "Erro ao salvar");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Adicionar membro</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nome *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
              autoFocus
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@empresa.com"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Cargo / Função</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ex: Designer, Desenvolvedor..."
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !email.trim() || saving}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {saving ? "Adicionando..." : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MembersClient({ initialMembers }: MembersClientProps) {
  const [members, setMembers] = useState<MemberWithTasks[]>(initialMembers);
  const [showModal, setShowModal] = useState(false);

  const handleAddMember = async (data: { name: string; email: string; role: string }) => {
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erro ao criar membro");
    }
    const created = await res.json();
    setMembers((prev) => [...prev, { ...created, tasks: [] }]);
    setShowModal(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Time</h1>
          <p className="text-slate-500 text-sm mt-1">{members.length} membros</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} />
          Adicionar membro
        </button>
      </div>

      {/* Members grid */}
      <div className="grid grid-cols-2 gap-4">
        {members.map((member) => {
          const activeTasks = member.tasks.filter((t) => t.status !== "DONE");
          const doneTasks = member.tasks.filter((t) => t.status === "DONE");
          const overdueTasks = member.tasks.filter((t) => isOverdue(t.dueDate, t.status));
          const inProgressTasks = member.tasks.filter((t) => t.status === "IN_PROGRESS");

          return (
            <div key={member.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <MemberAvatar name={member.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{member.name}</p>
                  <p className="text-sm text-slate-500 truncate">{member.role}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{member.email}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-blue-600">{inProgressTasks.length}</p>
                  <p className="text-[10px] text-blue-500 font-medium leading-tight">Em andamento</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-emerald-600">{doneTasks.length}</p>
                  <p className="text-[10px] text-emerald-500 font-medium leading-tight">Concluídas</p>
                </div>
                <div className={cn("rounded-lg p-2.5 text-center", overdueTasks.length > 0 ? "bg-red-50" : "bg-slate-50")}>
                  <p className={cn("text-lg font-bold", overdueTasks.length > 0 ? "text-red-600" : "text-slate-400")}>
                    {overdueTasks.length}
                  </p>
                  <p className={cn("text-[10px] font-medium leading-tight", overdueTasks.length > 0 ? "text-red-400" : "text-slate-400")}>
                    Atrasadas
                  </p>
                </div>
              </div>

              {/* Workload indicator */}
              {activeTasks.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span>Carga atual</span>
                    <span>{activeTasks.length} ativa{activeTasks.length > 1 ? "s" : ""}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        activeTasks.length >= 5 ? "bg-red-400" :
                        activeTasks.length >= 3 ? "bg-amber-400" : "bg-emerald-400"
                      )}
                      style={{ width: `${Math.min((activeTasks.length / 6) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {activeTasks.length >= 5 ? "⚠ Sobrecarregado" :
                     activeTasks.length >= 3 ? "Carga moderada" : "Carga leve"}
                  </p>
                </div>
              )}

              {activeTasks.length === 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-400 text-center py-1">Sem tarefas ativas — disponível</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <AddMemberModal onSave={handleAddMember} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
