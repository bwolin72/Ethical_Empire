import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Bell,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  User,
} from "lucide-react";

import { WorkersService } from "../../api/services/workerservice";
import WorkerProfile from "./WorkerProfile";

// -----------------------
// Reusable UI components
// -----------------------
const Card = ({ children }) => (
  <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
    {children}
  </div>
);

const Button = ({ className = "", ...props }) => (
  <button
    className={`px-3 py-2 rounded-2xl shadow-sm border border-gray-200 hover:bg-gray-50 active:scale-[.99] transition ${className}`}
    {...props}
  />
);

const Badge = ({ children, tone = "gray" }) => (
  <span
    className={`px-2 py-0.5 rounded-full text-xs border bg-${tone}-50 border-${tone}-200 text-${tone}-700`}
  >
    {children}
  </span>
);

const StatusBadge = ({ status }) => {
  const map = {
    ASSIGNED: { label: "Assigned", tone: "gray" },
    IN_PROGRESS: { label: "In Progress", tone: "blue" },
    PAUSED: { label: "Paused", tone: "yellow" },
    BLOCKED: { label: "Blocked", tone: "red" },
    COMPLETED: { label: "Completed", tone: "green" },
    CANCELLED: { label: "Cancelled", tone: "rose" },
  };
  const m = map[status] || map.ASSIGNED;
  return <Badge tone={m.tone}>{m.label}</Badge>;
};

const SectionTitle = ({ children, right }) => (
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-lg font-semibold">{children}</h2>
    {right && <div>{right}</div>}
  </div>
);

function useToast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(id);
  }, [toast]);

  return {
    setToast,
    Toast: toast ? (
      <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-xl shadow-lg opacity-90">
        {toast}
      </div>
    ) : null,
  };
}

// -----------------------
// Main Dashboard
// -----------------------
export default function WorkerDashboard() {
  const qc = useQueryClient();
  const { setToast, Toast } = useToast();
  const [tab, setTab] = useState("overview");

  // Queries
  const me = useQuery({ queryKey: ["me"], queryFn: WorkersService.getMe });
  const services = useQuery({
    queryKey: ["services"],
    queryFn: WorkersService.listServices,
  });
  const tasks = useQuery({
    queryKey: ["tasks"],
    queryFn: WorkersService.listTasks,
    refetchInterval: 15000,
  });
  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: WorkersService.listNotifications,
    refetchInterval: 20000,
  });
  const stats = useQuery({
    queryKey: ["stats"],
    queryFn: WorkersService.getStats,
    refetchInterval: 30000,
  });
  const calendar = useQuery({
    queryKey: ["calendar"],
    queryFn: WorkersService.getCalendar,
  });

  // Mutations
  const mutationConfig = (fn, onSuccessMsg, invalidate = []) => ({
    mutationFn: fn,
    onSuccess: () => {
      invalidate.forEach((key) => qc.invalidateQueries({ queryKey: [key] }));
      if (onSuccessMsg) setToast(onSuccessMsg);
    },
    onError: (e) => setToast(e.message),
  });

  const startTask = useMutation(
    mutationConfig(WorkersService.startTask, "Task started", ["tasks", "stats"])
  );
  const pauseTask = useMutation(
    mutationConfig(WorkersService.pauseTask, "Task paused", ["tasks"])
  );
  const resumeTask = useMutation(
    mutationConfig(WorkersService.resumeTask, "Task resumed", ["tasks"])
  );
  const completeTask = useMutation(
    mutationConfig(WorkersService.completeTask, "Task completed", [
      "tasks",
      "stats",
    ])
  );
  const setProgress = useMutation(
    mutationConfig(
      ({ id, progress }) => WorkersService.setTaskProgress(id, progress),
      null,
      ["tasks"]
    )
  );
  const addComment = useMutation(
    mutationConfig(WorkersService.addTaskComment, null, ["tasks"])
  );
  const markAllRead = useMutation(
    mutationConfig(WorkersService.markAllRead, null, ["notifications"])
  );

  const openTasks = useMemo(
    () =>
      (tasks.data || []).filter(
        (t) => !["COMPLETED", "CANCELLED"].includes(t.status)
      ),
    [tasks.data]
  );

  // -----------------------
  // Render
  // -----------------------
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Welcome back</div>
            <div className="font-semibold">
              {me.data?.user_full_name || me.data?.email || "Worker"}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setTab("overview")}>Overview</Button>
          <Button onClick={() => setTab("tasks")}>Tasks</Button>
          <Button onClick={() => setTab("calendar")}>Calendar</Button>
          <Button onClick={() => setTab("notifications")}>
            <Bell className="inline w-4 h-4 mr-1" />
            Notifications
          </Button>
          <Button onClick={() => setTab("profile")}>Profile</Button>
        </div>
      </div>

      {/* Tabs */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Stats */}
          <Card>
            <div className="text-sm text-gray-500">Assigned</div>
            <div className="text-2xl font-semibold">
              {stats.data?.assigned ?? "-"}
            </div>
          </Card>
          <Card>
            <div className="text-sm text-gray-500">In Progress</div>
            <div className="text-2xl font-semibold">
              {stats.data?.in_progress ?? "-"}
            </div>
          </Card>
          <Card>
            <div className="text-sm text-gray-500">Completed</div>
            <div className="text-2xl font-semibold">
              {stats.data?.completed ?? "-"}
            </div>
          </Card>
          <Card>
            <div className="text-sm text-gray-500">Time Spent (hrs)</div>
            <div className="text-2xl font-semibold">
              {((stats.data?.time_spent_seconds || 0) / 3600).toFixed(1)}
            </div>
          </Card>

          {/* Open Tasks */}
          <div className="md:col-span-2">
            <SectionTitle>Open Tasks</SectionTitle>
            <Card>
              <TaskList
                tasks={openTasks}
                onStart={(id) => startTask.mutate(id)}
                onPause={(id) => pauseTask.mutate(id)}
                onResume={(id) => resumeTask.mutate(id)}
                onComplete={(id) => completeTask.mutate(id)}
                onProgress={(id, p) => setProgress.mutate({ id, progress: p })}
                onComment={(payload) => addComment.mutate(payload)}
              />
            </Card>
          </div>

          {/* Calendar */}
          <div className="md:col-span-2">
            <SectionTitle>Upcoming (Calendar)</SectionTitle>
            <Card>
              <CalendarList events={calendar.data || []} />
            </Card>
          </div>
        </div>
      )}

      {tab === "tasks" && (
        <Card>
          <SectionTitle>My Tasks</SectionTitle>
          <TaskList
            tasks={tasks.data || []}
            onStart={(id) => startTask.mutate(id)}
            onPause={(id) => pauseTask.mutate(id)}
            onResume={(id) => resumeTask.mutate(id)}
            onComplete={(id) => completeTask.mutate(id)}
            onProgress={(id, p) => setProgress.mutate({ id, progress: p })}
            onComment={(payload) => addComment.mutate(payload)}
          />
        </Card>
      )}

      {tab === "calendar" && (
        <Card>
          <SectionTitle>Calendar</SectionTitle>
          <CalendarList events={calendar.data || []} />
        </Card>
      )}

      {tab === "notifications" && (
        <Card>
          <SectionTitle
            right={
              <Button
                onClick={() => markAllRead.mutate()}
                className="text-sm"
              >
                Mark all read
              </Button>
            }
          >
            Notifications
          </SectionTitle>
          <div className="divide-y">
            {(notifications.data || []).map((n) => (
              <div key={n.id} className="py-3 flex items-start gap-3">
                <Bell className="w-4 h-4 mt-1" />
                <div>
                  <div className="font-medium">{n.title}</div>
                  <div className="text-sm text-gray-600">{n.message}</div>
                </div>
                <div className="ml-auto">
                  {!n.is_read && <Badge tone="blue">New</Badge>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "profile" && (
        <Card>
          <SectionTitle>Profile</SectionTitle>
          <WorkerProfile
            me={me.data}
            services={services.data || []}
            onSave={async (payload) => {
              await WorkersService.updateMe(payload);
              qc.invalidateQueries({ queryKey: ["me"] });
              setToast("Profile updated");
            }}
          />
        </Card>
      )}

      {Toast}
    </div>
  );
}

// -----------------------
// Task List Component
// -----------------------
function TaskList({
  tasks,
  onStart,
  onPause,
  onResume,
  onComplete,
  onProgress,
  onComment,
}) {
  const [newNote, setNewNote] = useState("");
  const [activeNoteTask, setActiveNoteTask] = useState(null);

  if (!tasks?.length)
    return <div className="text-sm text-gray-500">No tasks yet.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="py-2 pr-4">Task</th>
            <th className="py-2 pr-4">Service</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Progress</th>
            <th className="py-2 pr-4">Due</th>
            <th className="py-2 pr-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id} className="border-b last:border-0">
              <td className="py-3 pr-4">
                <div className="font-medium">{t.title}</div>
                {t.description && (
                  <div className="text-gray-500 text-xs max-w-[40ch] line-clamp-2">
                    {t.description}
                  </div>
                )}
              </td>
              <td className="py-3 pr-4">{t.service?.name || "-"}</td>
              <td className="py-3 pr-4">
                <StatusBadge status={t.status} />
              </td>
              <td className="py-3 pr-4">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={t.progress}
                  onChange={(e) => onProgress(t.id, Number(e.target.value))}
                />
                <div className="text-xs text-gray-500">{t.progress}%</div>
              </td>
              <td className="py-3 pr-4 text-gray-600">
                {t.due_at ? new Date(t.due_at).toLocaleString() : "-"}
              </td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  {t.status === "ASSIGNED" && (
                    <Button
                      onClick={() => onStart(t.id)}
                      className="text-blue-700"
                    >
                      <Play className="inline w-4 h-4 mr-1" />
                      Start
                    </Button>
                  )}
                  {t.status === "IN_PROGRESS" && (
                    <>
                      <Button
                        onClick={() => onPause(t.id)}
                        className="text-yellow-700"
                      >
                        <Pause className="inline w-4 h-4 mr-1" />
                        Pause
                      </Button>
                      <Button
                        onClick={() => onComplete(t.id)}
                        className="text-green-700"
                      >
                        <CheckCircle2 className="inline w-4 h-4 mr-1" />
                        Complete
                      </Button>
                    </>
                  )}
                  {t.status === "PAUSED" && (
                    <Button
                      onClick={() => onResume(t.id)}
                      className="text-blue-700"
                    >
                      <RotateCcw className="inline w-4 h-4 mr-1" />
                      Resume
                    </Button>
                  )}
                  <Button
                    onClick={() => setActiveNoteTask(t.id)}
                    className="text-gray-700"
                  >
                    <Clock className="inline w-4 h-4 mr-1" />
                    Note
                  </Button>
                </div>

                {activeNoteTask === t.id && (
                  <div className="mt-2 flex gap-2 items-center">
                    <input
                      className="border rounded-xl px-2 py-1 text-sm w-64"
                      placeholder="Add note/comment"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                    <Button
                      onClick={() => {
                        onComment({ task: t.id, note: newNote });
                        setNewNote("");
                        setActiveNoteTask(null);
                      }}
                      className="text-sm text-blue-700"
                    >
                      <Check className="inline w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// -----------------------
// Calendar Component
// -----------------------
function CalendarList({ events }) {
  if (!events?.length)
    return <div className="text-sm text-gray-500">No calendar items.</div>;

  return (
    <ul className="space-y-2">
      {events.map((e) => (
        <li
          key={e.id}
          className="p-3 border rounded-xl flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="font-medium">{e.title}</div>
            <div className="text-xs text-gray-600">
              {e.start ? new Date(e.start).toLocaleString() : ""}{" "}
              {e.end ? ` → ${new Date(e.end).toLocaleString()}` : ""}
            </div>
          </div>
          <div className="ml-auto">
            <StatusBadge status={e.status} />
          </div>
        </li>
      ))}
    </ul>
  );
}
