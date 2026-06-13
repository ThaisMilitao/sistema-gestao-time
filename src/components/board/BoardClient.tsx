"use client";

import { useState, useCallback } from "react";
import { Plus, AlertTriangle, Clock } from "lucide-react";
import type { Task, Member, TaskStatus, Priority } from "@/types";
import {
  cn,
  formatDateShort,
  isOverdue,
  isDueSoon,
  getInitials,
  getAvatarColor,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/lib/utils";
import { TaskModal } from "./TaskModal";

interface BoardClientProps {
  initialTasks: Task[];
  members: Member[];
}

const COLUMNS: { status: TaskStatus; label: string; color: string; headerColor: string }[] = [
  { status: "TODO", label: "A fazer", color: "bg-slate-50 border-slate-200", headerColor: "bg-slate-100 text-slate-600" },
  { status: "IN_PROGRESS", label: "Em andamento", color: "bg-blue-50 border-blue-200", headerColor: "bg-blue-100 text-blue-700" },
  { status: "DONE", label: "Concluído", color: "bg-emerald-50 border-emerald-200", headerColor: "bg-emerald-100 text-emerald-700" },
  { status: "BLOCKED", label: "Bloqueado", color: "bg-red-50 border-red-200", headerColor: "bg-red-100 text-red-700" },
];

function MemberBadge({ member }: { member: Member }) {
  return (
    <div
      className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0",
        getAvatarColor(member.name)
      )}
      title={member.name}
    >
      {getInitials(member.name)}
    </div>
  );
}

function TaskCard({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
}) {
  const overdue = isOverdue(task.dueDate, task.status);
  const dueSoon = isDueSoon(task.dueDate, task.status);

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg border p-3 cursor-pointer hover:shadow-md transition-all group",
        overdue ? "border-red-200" : dueSoon ? "border-amber-200" : "border-slate-200 hover:border-slate-300"
      )}
    >
      {/* Priority badge */}
      <div className="flex items-start gap-2 mb-2">
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide flex-shrink-0", PRIORITY_COLORS[task.priority])}>
          {PRIORITY_LABELS[task.priority]}
        </span>
      </div>

      <p className="text-sm font-medium text-slate-800 leading-snug group-hover:text-slate-900">
        {task.title}
      </p>

      {task.description && (
        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
        {task.dueDate ? (
          <div className={cn("flex items-center gap-1 text-xs", overdue ? "text-red-500" : dueSoon ? "text-amber-500" : "text-slate-400")}>
            {overdue ? <AlertTriangle size={11} /> : dueSoon ? <Clock size={11} /> : null}
            <span>{formatDateShort(task.dueDate)}</span>
          </div>
        ) : (
          <span />
        )}
        {task.member ? <MemberBadge member={task.member} /> : <span />}
      </div>
    </div>
  );
}

function Column({
  status,
  label,
  color,
  headerColor,
  tasks,
  onTaskClick,
  onAddTask,
}: {
  status: TaskStatus;
  label: string;
  color: string;
  headerColor: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}) {
  return (
    <div className={cn("flex flex-col rounded-xl border min-h-[60vh]", color)}>
      {/* Column header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-semibold px-2 py-1 rounded-md", headerColor)}>
            {label}
          </span>
          <span className="text-xs text-slate-400 font-medium">{tasks.length}</span>
        </div>
        <button
          onClick={() => onAddTask(status)}
          className="w-6 h-6 rounded-md hover:bg-white/70 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Tasks */}
      <div className="flex-1 px-2 pb-3 space-y-2 overflow-y-auto scrollbar-thin">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
        ))}
        {tasks.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-xs text-slate-300">Nenhuma tarefa</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function BoardClient({ initialTasks, members }: BoardClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("TODO");
  const [filterMember, setFilterMember] = useState<string>("all");

  const filteredTasks = filterMember === "all"
    ? tasks
    : filterMember === "unassigned"
    ? tasks.filter((t) => !t.memberId)
    : tasks.filter((t) => t.memberId === filterMember);

  const tasksByStatus = (status: TaskStatus) =>
    filteredTasks.filter((t) => t.status === status);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const handleAddTask = (status: TaskStatus) => {
    setSelectedTask(null);
    setDefaultStatus(status);
    setModalOpen(true);
  };

  const handleSave = async (data: Partial<Task> & { id?: string }) => {
    if (data.id) {
      // Update
      const res = await fetch(`/api/tasks/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated: Task = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      }
    } else {
      // Create
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created: Task = await res.json();
        setTasks((prev) => [created, ...prev]);
      }
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setModalOpen(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quadro Kanban</h1>
          <p className="text-slate-500 text-sm mt-1">
            {tasks.length} tarefas no total
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Member filter */}
          <select
            value={filterMember}
            onChange={(e) => setFilterMember(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">Todos os membros</option>
            <option value="unassigned">Sem responsável</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          <button
            onClick={() => handleAddTask("TODO")}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} />
            Nova tarefa
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="grid grid-cols-4 gap-4 flex-1 overflow-hidden">
        {COLUMNS.map((col) => (
          <Column
            key={col.status}
            {...col}
            tasks={tasksByStatus(col.status)}
            onTaskClick={handleTaskClick}
            onAddTask={handleAddTask}
          />
        ))}
      </div>

      {/* Task Modal */}
      {modalOpen && (
        <TaskModal
          task={selectedTask}
          defaultStatus={defaultStatus}
          members={members}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
