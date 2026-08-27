
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/useAuth";
import { api } from "@/lib/api";

type Task = {
    id: number;
    title: string;
    description?: string;
    status: string;
    priority: number;
    project: {
        id: number;
        name: string;
    };
    assignee?: {
        id: number;
        name: string;
    } | null;
    dueDate?: string | null;
    createdAt: string;
    tags: {
        id: number;
        name: string;
    }[];
};

type FieldErrors = {
    title?: string;
    description?: string;
    priority?: string;
    projectId?: string;
    status?: string;
    [key: string]: string | undefined;
};

export default function TasksPage() {
    const router = useRouter();

    const { token, isLoading, signOut } = useAuth();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);

    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    // Status filter
    const [statusFilter, setStatusFilter] = useState("");

    // Create form
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState(3);
    const [projectId, setProjectId] = useState(16);

    // Edit form
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editPriority, setEditPriority] = useState(3);
    const [editStatus, setEditStatus] = useState("todo");

    // Guard route
    useEffect(() => {
        if (!isLoading && !token) {
            router.replace("/login");
        }
    }, [isLoading, token, router]);

    // Load tasks
    useEffect(() => {
        if (!token) return;

        const loadTasks = async () => {
            setIsLoadingTasks(true);
            setError("");
            setFieldErrors({});

            try {
                const query = statusFilter
                    ? `?status=${encodeURIComponent(statusFilter)}`
                    : "";

                const data = await api<Task[]>(`/tasks${query}`);

                setTasks(data);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load tasks"
                );
            } finally {
                setIsLoadingTasks(false);
            }
        };

        loadTasks();
    }, [token, statusFilter]);

    // Convert API messages into field errors
    const handleApiFieldErrors = (
        error: unknown
    ): boolean => {
        if (
            !error ||
            typeof error !== "object"
        ) {
            return false;
        }

        const apiError = error as {
            status?: number;
            messages?: string[];
            message?: string;
        };

        if (apiError.status !== 400) {
            return false;
        }

        const messages = Array.isArray(apiError.messages)
            ? apiError.messages
            : apiError.message
                ? [apiError.message]
                : [];

        const knownFields = [
            "title",
            "description",
            "priority",
            "projectId",
            "status",
        ];

        const newFieldErrors: FieldErrors = {};
        const formErrors: string[] = [];

        for (const message of messages) {
            const field = knownFields.find((fieldName) =>
                message.toLowerCase().startsWith(
                    `${fieldName.toLowerCase()} `
                )
            );

            if (field) {
                newFieldErrors[field] = message;
            } else {
                formErrors.push(message);
            }
        }

        setFieldErrors(newFieldErrors);

        if (formErrors.length > 0) {
            setError(formErrors.join(", "));
        } else {
            setError("");
        }

        return true;
    };

    // Create task
    const createTask = async (
        e: React.SubmitEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setError("");
        setFieldErrors({});

        const trimmedTitle = title.trim();
        const trimmedDescription = description.trim();

        if (!trimmedTitle) {
            setFieldErrors({
                title: "Title is required",
            });
            return;
        }

        try {
            await api<Task>("/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: trimmedTitle,
                    description: trimmedDescription,
                    priority,
                    projectId,
                }),
            });

            setTitle("");
            setDescription("");
            setPriority(3);

            const query = statusFilter
                ? `?status=${encodeURIComponent(statusFilter)}`
                : "";

            const data = await api<Task[]>(
                `/tasks${query}`
            );

            setTasks(data);
        } catch (error) {
            const handled = handleApiFieldErrors(error);

            if (!handled) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to create task"
                );
            }
        }
    };

    // Start editing
    const startEdit = (task: Task) => {
        setEditingTask(task);
        setEditTitle(task.title);
        setEditDescription(task.description ?? "");
        setEditPriority(task.priority);
        setEditStatus(task.status);

        setError("");
        setFieldErrors({});
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingTask(null);
        setEditTitle("");
        setEditDescription("");
        setEditPriority(3);
        setEditStatus("todo");

        setError("");
        setFieldErrors({});
    };

    // Update task
    const updateTask = async (
        e: React.SubmitEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setError("");
        setFieldErrors({});

        if (!editingTask) return;

        try {
            const updatedTask = await api<Task>(
                `/tasks/${editingTask.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title: editTitle.trim(),
                        description: editDescription.trim(),
                        priority: editPriority,
                        status: editStatus,
                    }),
                }
            );

            if (
                statusFilter &&
                updatedTask.status !== statusFilter
            ) {
                setTasks((currentTasks) =>
                    currentTasks.filter(
                        (task) =>
                            task.id !== updatedTask.id
                    )
                );
            } else {
                setTasks((currentTasks) =>
                    currentTasks.map((task) =>
                        task.id === updatedTask.id
                            ? updatedTask
                            : task
                    )
                );
            }

            cancelEdit();
        } catch (error) {
            const handled = handleApiFieldErrors(error);

            if (!handled) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to update task"
                );
            }
        }
    };

    // Delete task
    const deleteTask = async (id: number) => {
        setError("");
        setFieldErrors({});

        try {
            await api(`/tasks/${id}`, {
                method: "DELETE",
            });

            setTasks((currentTasks) =>
                currentTasks.filter(
                    (task) => task.id !== id
                )
            );
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete task"
            );
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">

                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Tasks
                        </h1>

                        <p className="mt-1 text-slate-400">
                            Manage your tasks easily
                        </p>
                    </div>

                    <button
                        onClick={signOut}
                        className="rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700"
                    >
                        Sign Out
                    </button>
                </div>

                {/* Status Filter */}
                <div className="mb-8 rounded-xl border border-slate-700 bg-slate-800 p-5 shadow-lg">
                    <label
                        htmlFor="status-filter"
                        className="mb-2 block text-sm font-medium text-slate-200"
                    >
                        Filter by Status
                    </label>

                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:max-w-xs"
                    >
                        <option value="">
                            All Tasks
                        </option>

                        <option value="todo">
                            Todo
                        </option>

                        <option value="in_progress">
                            In Progress
                        </option>

                        <option value="done">
                            Done
                        </option>
                    </select>
                </div>

                {/* Create Task */}
                <form
                    onSubmit={createTask}
                    className="mb-8 rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-lg"
                >
                    <h2 className="mb-5 text-xl font-semibold">
                        Create Task
                    </h2>

                    <div className="space-y-4">

                        <div>
                            <input
                                type="text"
                                placeholder="Task title"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    setFieldErrors(
                                        (current) => ({
                                            ...current,
                                            title: undefined,
                                        })
                                    );
                                }}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-blue-500"
                                required
                            />

                            {fieldErrors.title && (
                                <p className="mt-2 text-sm text-red-400">
                                    {fieldErrors.title}
                                </p>
                            )}
                        </div>

                        <div>
                            <textarea
                                placeholder="Task description"
                                value={description}
                                onChange={(e) => {
                                    setDescription(
                                        e.target.value
                                    );
                                    setFieldErrors(
                                        (current) => ({
                                            ...current,
                                            description:
                                                undefined,
                                        })
                                    );
                                }}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-blue-500"
                                rows={4}
                            />

                            {fieldErrors.description && (
                                <p className="mt-2 text-sm text-red-400">
                                    {fieldErrors.description}
                                </p>
                            )}
                        </div>

                        <div>
                            <input
                                type="number"
                                min={1}
                                max={5}
                                value={priority}
                                onChange={(e) => {
                                    setPriority(
                                        Number(e.target.value)
                                    );
                                    setFieldErrors(
                                        (current) => ({
                                            ...current,
                                            priority: undefined,
                                        })
                                    );
                                }}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white outline-none focus:border-blue-500"
                            />

                            {fieldErrors.priority && (
                                <p className="mt-2 text-sm text-red-400">
                                    {fieldErrors.priority}
                                </p>
                            )}
                        </div>

                        <div>
                            <input
                                type="number"
                                value={projectId}
                                onChange={(e) => {
                                    setProjectId(
                                        Number(e.target.value)
                                    );
                                    setFieldErrors(
                                        (current) => ({
                                            ...current,
                                            projectId:
                                                undefined,
                                        })
                                    );
                                }}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white outline-none focus:border-blue-500"
                            />

                            {fieldErrors.projectId && (
                                <p className="mt-2 text-sm text-red-400">
                                    {fieldErrors.projectId}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                        >
                            Create Task
                        </button>
                    </div>
                </form>

                {/* Edit Task */}
                {editingTask && (
                    <form
                        onSubmit={updateTask}
                        className="mb-8 rounded-xl border border-yellow-500/40 bg-slate-800 p-6 shadow-lg"
                    >
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-yellow-400">
                                Edit Task
                            </h2>

                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-600"
                            >
                                Cancel
                            </button>
                        </div>

                        <div className="space-y-4">

                            <input
                                type="text"
                                placeholder="Task title"
                                value={editTitle}
                                onChange={(e) =>
                                    setEditTitle(
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-yellow-500"
                                required
                            />

                            <textarea
                                placeholder="Task description"
                                value={editDescription}
                                onChange={(e) =>
                                    setEditDescription(
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-yellow-500"
                                rows={4}
                            />

                            <input
                                type="number"
                                min={1}
                                max={5}
                                value={editPriority}
                                onChange={(e) =>
                                    setEditPriority(
                                        Number(e.target.value)
                                    )
                                }
                                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white outline-none focus:border-yellow-500"
                            />

                            <select
                                value={editStatus}
                                onChange={(e) =>
                                    setEditStatus(
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white outline-none focus:border-yellow-500"
                            >
                                <option value="todo">
                                    Todo
                                </option>

                                <option value="in_progress">
                                    In Progress
                                </option>

                                <option value="done">
                                    Done
                                </option>
                            </select>

                            <button
                                type="submit"
                                className="rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-yellow-400"
                            >
                                Update Task
                            </button>
                        </div>
                    </form>
                )}

                {/* Form-level Error */}
                {error && (
                    <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {isLoadingTasks && (
                    <div className="rounded-xl border border-slate-700 bg-slate-800 p-8 text-center">
                        <p className="text-slate-400">
                            Loading tasks...
                        </p>
                    </div>
                )}

                {/* Empty */}
                {!isLoadingTasks &&
                    !error &&
                    tasks.length === 0 && (
                        <div className="rounded-xl border border-slate-700 bg-slate-800 p-8 text-center">
                            <h2 className="text-xl font-semibold">
                                No tasks found
                            </h2>

                            <p className="mt-2 text-slate-400">
                                Try another status filter or
                                create a new task.
                            </p>
                        </div>
                    )}

                {/* Results */}
                {!isLoadingTasks &&
                    !error &&
                    tasks.length > 0 && (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-lg transition hover:border-slate-600"
                                >
                                    <div className="mb-4 flex items-start justify-between gap-3">
                                        <h2 className="text-xl font-semibold text-white">
                                            {task.title}
                                        </h2>

                                        <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-300">
                                            {task.status}
                                        </span>
                                    </div>

                                    {task.description && (
                                        <p className="mb-4 text-slate-400">
                                            {task.description}
                                        </p>
                                    )}

                                    <div className="space-y-2 text-sm text-slate-300">

                                        <p>
                                            <strong className="text-white">
                                                Priority:
                                            </strong>{" "}
                                            {task.priority}
                                        </p>

                                        <p>
                                            <strong className="text-white">
                                                Project:
                                            </strong>{" "}
                                            {task.project.name}
                                        </p>

                                        {task.assignee && (
                                            <p>
                                                <strong className="text-white">
                                                    Assignee:
                                                </strong>{" "}
                                                {task.assignee.name}
                                            </p>
                                        )}

                                        {task.dueDate && (
                                            <p>
                                                <strong className="text-white">
                                                    Due Date:
                                                </strong>{" "}
                                                {task.dueDate}
                                            </p>
                                        )}
                                    </div>

                                    {/* Buttons */}
                                    <div className="mt-5 flex gap-3">

                                        <button
                                            onClick={() =>
                                                startEdit(task)
                                            }
                                            className="rounded-lg bg-yellow-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-yellow-400"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() =>
                                                deleteTask(task.id)
                                            }
                                            className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
            </div>
        </main>
    );
}
