import { useEffect, useState } from "react";
import { type SidePanelProps, type TaskActivity } from "../../types/kanban";

export function SidePanel({
        task,
        mode,
        onClose,
        onCreate,
        onDelete,
    }: SidePanelProps) {
        const [title, setTitle] = useState("");
        const [description, setDescription] = useState("");
        const [priority, setPriority] = useState("medium");
        const [dueDate, setDueDate] = useState("");
        const [errors, setErrors] = useState<Record<string, string>>({});


        useEffect(() => {
            if (mode === "create") {
                setTitle("");
                setDescription("");
                setPriority("medium");
                setDueDate("");
            }
        }, [mode]);


    function validateForm() {
        const newErrors: Record<string, string> = {};

        if (!title.trim()) {
            newErrors.title = "Title is required.";
        }

        if (!description.trim()) {
            newErrors.description = "Description is required.";
        }

        if (!dueDate) {
            newErrors.dueDate = "Due date is required.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    function formatActivity(activity: TaskActivity) {
        switch (activity.action) {
            case "created":
                return "Created task";

            case "moved":
                return `Moved from ${activity.from_value} → ${activity.to_value}`;

            case "priority_changed":
                return `Changed priority from ${activity.from_value} to ${activity.to_value}`;

            default:
                return activity.action;
        }
    }

    // Create panel
    if (mode === "create") {
        return (
            <div className="overlay" onClick={onClose}>
                <div 
                    className="side-panel"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="close-button"
                        onClick={onClose}
                    >
                        X
                    </button>

                    <div className="form-group">
                        <h2>Create Task</h2>
                        <input
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        {errors.title && (
                            <p className="error">{errors.title}</p>
                        )}

                        <textarea 
                            placeholder="Description"
                            value={description}
                            onChange={(e) =>
                                setDescription(e.target.value)
                            }
                        />
                        {errors.description && (
                            <p className="error">{errors.description}</p>
                        )}

                        <select
                            value={priority}
                            onChange={(e) => {
                                console.log("Selected priority:", e.target.value);
                                setPriority(e.target.value);
                            }}
                        >
                            <option value="high">
                                High
                            </option>

                            <option value="medium">
                                Medium
                            </option>

                            <option value="low">
                                Low
                            </option>
                        </select>

                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) =>
                                setDueDate(e.target.value)
                            }
                        />
                        {errors.dueDate && (
                            <p className="error">{errors.dueDate}</p>
                        )}

                        <button
                            onClick={() => {
                                if (!validateForm()) return; 

                                onCreate?.({
                                    title,
                                    description,
                                    priority,
                                    due_date: dueDate
                                })

                                onClose();
                            }}
                        >
                            Create Task
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // View panel
    if (!task) return null;
    return (
        <div className="overlay" onClick={onClose}>
            <div 
                className="side-panel"
                onClick={(e) => e.stopPropagation}
            >
                <button
                    className="close-button"
                    onClick={onClose}
                >
                    ✕
                </button>
                <h2>{task.title}</h2>
                <h3 className="underline">Description</h3>
                <p>{task.description}</p>
                <p>
                    <strong>Priority:</strong> {task.priority}
                </p>
                <p>
                    <strong>Due:</strong> {task.due_date}
                </p>
                <p>
                    <strong>Assignee:</strong> {task.assignee_id}
                </p>
                <p>
                    <strong>ID:</strong> {task.id}
                </p>

                <button
                    onClick={() => {
                        if (task && window.confirm("Delete this task?")) {
                            onDelete?.(task.id);
                        }
                    }}
                    className="delete-button"
                >
                    Delete Task
                </button>

                <h3 className="underline">Activity</h3>
                <div className="activity-log">
                    {task.activity?.map((item) => (
                        <div>
                            <p>{formatActivity(item)}</p>
                            <div className="activity-time">
                                {new Date(item.created_at).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}