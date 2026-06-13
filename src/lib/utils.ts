import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isPast, isWithinInterval, addHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Priority, TaskStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
}

export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "dd MMM", { locale: ptBR });
}

export function isOverdue(dueDate: string | null | undefined, status: TaskStatus): boolean {
  if (!dueDate || status === "DONE") return false;
  return isPast(new Date(dueDate));
}

export function isDueSoon(dueDate: string | null | undefined, status: TaskStatus): boolean {
  if (!dueDate || status === "DONE") return false;
  const due = new Date(dueDate);
  const now = new Date();
  const in48h = addHours(now, 48);
  return isWithinInterval(due, { start: now, end: in48h });
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: "text-slate-500 bg-slate-100",
  MEDIUM: "text-blue-600 bg-blue-50",
  HIGH: "text-amber-600 bg-amber-50",
  URGENT: "text-red-600 bg-red-50",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "A fazer",
  IN_PROGRESS: "Em andamento",
  DONE: "Concluído",
  BLOCKED: "Bloqueado",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-emerald-100 text-emerald-700",
  BLOCKED: "bg-red-100 text-red-700",
};

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-pink-500",
];

export function getAvatarColor(name: string): string {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}
