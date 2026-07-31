import "./board.css";

type AddTaskProps = {
    value: string;
    loading: boolean;
    onChange: (value: string) => void;
    onAdd: () => void;
};

export function AddTask({
    value,
    loading,
    onChange,
    onAdd,
}: AddTaskProps) {
    return (
        <div className="add-task">
            <input
                type="text"
                placeholder="Enter title of task"
                value={value}
                disabled={loading}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        onAdd();
                    }
                }}
            />

            <button
                onClick={onAdd}
                disabled={loading}
            >
                {loading ? "Adding..." : "Add Task"}
            </button>
        </div>
    );
}