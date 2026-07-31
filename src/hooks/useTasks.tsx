import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

import type {
    Board,
    Card,
    ColumnId,
    Task,
    NewTask
} from "../types/kanban";

export function useTasks() {
    const [board, setBoard] = useState<Board>({
        todo: [],
        inProgress: [],
        inReview: [],
        done: [],
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [addingTask, setAddingTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");

    const [selectedTask, setSelectedTask] =
        useState<Task | null>(null);

    useEffect(() => {
        initialize();
    }, []);

    async function initialize() {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                const { error } =
                    await supabase.auth.signInAnonymously();

                if (error) throw error;
            }

            await loadTasks();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Initialization failed."
            );

            setLoading(false);
        }
    }

    async function loadTasks() {
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from("tasks")
                .select("*");

            if (error) throw error;

            const nextBoard: Board = {
                todo: [],
                inProgress: [],
                inReview: [],
                done: [],
            };

            data.forEach((task) => {
                nextBoard[task.status as ColumnId].push({
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    
                });
            });

            setBoard(nextBoard);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load tasks."
            );
        } finally {
            setLoading(false);
        }
    }

    async function addTask(task: NewTask) {
        setError(null);

        if (!task.title.trim()) {
            setError("Title is required.");
            return;
        }

        if (!task.description.trim()) {
            setError("Description is required.");
            return;
        }

        if (!task.due_date) {
            setError("Due date is required.");
            return;
        }

        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                throw userError;
            }

            const newCard: Card = {
                id: crypto.randomUUID(),
                title: task.title,
                description: task.description,
            };

            console.log("Creating task:", task);

            const { error } = await supabase
                .from("tasks")
                .insert({
                    id: newCard.id,
                    title: task.title,
                    description: task.description,
                    status: "todo",
                    priority: task.priority,
                    due_date: task.due_date,
                    assignee_id: user.id,
                    user_id: user.id,
                });

            await logTaskActivity({
                taskId: newCard.id,
                userId: user.id,
                action: "created",
                to: "todo",
            });

            if (error) {
                console.error("Supabase insert error:", error);
                throw error;
            }

            setBoard((prev) => ({
                ...prev,
                todo: [...prev.todo, newCard],
            }));

            setNewTaskTitle("");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create task."
            );
        } finally {
            setAddingTask(false);
        }
    }

    async function openTask(card: Card) {
        try {
            const { data: task, error } = await supabase
                .from("tasks")
                .select("*")
                .eq("id", card.id)
                .single();

            if (error) throw error;

            const { data: activity, error: activityError } =
                await supabase
                    .from("task_activity")
                    .select("*")
                    .eq("task_id", card.id)
                    .order("created_at", {
                        ascending: false,
                    });

            if (activityError) throw activityError;

            setSelectedTask({...task, activity});
        } catch (err) {
            console.error(err);
        }
    }

    async function deleteTask(taskId: string) {
        setError(null);

        try {
            const { error } = await supabase
                .from("tasks")
                .delete()
                .eq("id", taskId)

            if (error) throw error; 

            setBoard((prev) => ({
                todo: prev.todo.filter((card) => card.id !== taskId), 
                inProgress: prev.inProgress.filter((card) => card.id !== taskId),
                inReview: prev.inReview.filter((card) => card.id !== taskId),
                done: prev.done.filter((card) => card.id !== taskId),
            }));

            setSelectedTask(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete task."
            );
        }
    }

    async function logTaskActivity({
        taskId,
        userId, 
        action, 
        from,
        to,
        details,
    } : {
        taskId: string; 
        userId: string;
        action: string; 
        from?: string; 
        to?: string; 
        details?: string;
    }) {
        await supabase
            .from("task_activity")
            .insert({
                task_id: taskId,
                user_id: userId,
                action,
                from_value: from,
                to_value: to,
                details,
            })
    }

    return {
        board,
        setBoard,

        loading,
        error,

        addingTask,

        newTaskTitle,
        setNewTaskTitle,

        selectedTask,
        setSelectedTask,

        loadTasks,
        addTask,
        openTask,
        deleteTask,

        logTaskActivity
    };
}