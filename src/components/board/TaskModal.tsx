"use client";

import { useState, useEffect } from "react";
import { X, Trash2, Save } from "lucide-react";
import type { Task, Member, TaskStatus, Priority } from "@/types";
import { cn, STATUS_LABELS, PRIORITY_LABELS } from "@/lib/utils";
import { format } from "date-fns";

interface TaskModalProps {
  task: Task | null;
  defaultStatus: TaskStatus;
  members: Member[];
  onSave: (data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE", "BLOCKED"];
const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export function TaskModal({ task, defaultStatus, members, onSave, onDelete, onClose }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? defaultStatus);
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "MEDIUM");
  const [memberId, setMemberId] = useState<string>(task?.memberId ?? "");
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : ""
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEdit = !!task;

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({
      id: task?.id,
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      memberId: memberId || undefined,
      dueDate: dueDate || undefined,
    });
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!task?.id) return;
    if (!confirm("Remover esta tarefa?")) return;
    setDeleting(true);
    await onDelete(task.id);
    setDeleting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">
            {isEdit ? "Editar tarefa" : "Nova tarefa"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="O que precisa ser feito?"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 placeholder-slate-300"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes adicionais..."
              rows={3}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 placeholder-slate-300 resize-none"
            />
          </div>

          {/* Grid of selects */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 bg-white"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 bg-white"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Responsável</label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 bg-white"
              >
                <option value="">Sem responsável</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Prazo</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          {isEdit ? (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
            >
              <Trash2 size={14} />
              {deleting ? "Removendo..." : "Remover"}
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || saving}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Save size={14} />
              {saving ? "Salvando..." : isEdit ? "Salvar" : "Criar tarefa"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
