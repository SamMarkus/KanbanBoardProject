import { supabase } from "../lib/supabase";

export async function loadTasks() {
    return supabase
        .from("tasks")
        .select("*");
}

export async function createTask(task: any) {
    return supabase
        .from("tasks")
        .insert(task);
}

export async function updateTaskStatus(
    id: string,
    status: string
) {
    return supabase
        .from("tasks")
        .update({ status })
        .eq("id", id);
}

export async function getTask(id: string) {
    return supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .single();
}