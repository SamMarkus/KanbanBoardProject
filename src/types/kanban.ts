export type Card = {
    id: string;
    title: string;
    description: string;
};

export type ColumnId =
    | "todo"
    | "inProgress"
    | "inReview"
    | "done";

export type Board = Record<ColumnId, Card[]>;

export type Task = {
    id: string;
    title: string;
    description: string;
    status: ColumnId;
    priority: string;
    due_date: string | null;
    assignee_id: string | null;
    user_id: string;
    activity?: TaskActivity[];
};

export type TaskActivity = {
    id: string;
    task_id: string;
    action: string;
    from_value: string | null;
    to_value: string | null;
    details: string | null;
    created_at: string;
};

export type NewTask = {
    title: string;
    description: string;
    priority: string;
    due_date: string;
};

export type SidePanelProps = {
    task: Task | null;
    mode: "view" | "create";
    onClose: () => void;
    onCreate?: (task: NewTask) => void;
    onDelete?: (id: string) => void;
};
