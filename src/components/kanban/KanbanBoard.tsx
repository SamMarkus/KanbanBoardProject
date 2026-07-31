import { useRef, useState } from "react";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";

import "./board.css";

import { KanbanColumn } from "./KanbanColumn";
import { SidePanel } from "./SidePanel";

import { useTasks } from "../../hooks/useTasks";

import {
    applyDrag,
    COLUMNS,
    findColumn,
} from "../../utils/board";

import type {
    Board,
    Card,
    ColumnId
} from "../../types/kanban";

import { supabase } from "../../lib/supabase";

export function KanbanBoard() {
    const {
        board,
        setBoard,

        loading,
        error,

        selectedTask,
        setSelectedTask,

        addTask,
        openTask,
        deleteTask,
        logTaskActivity
    } = useTasks();

    const [snapshot, setSnapshot] = useState<Board | null>(null);
    const [activeCard, setActiveCard] = useState<Card | null>(null);
    const [activeColumnId, setActiveColumnId] =
        useState<ColumnId | null>(null);
    const lastTargetRef = useRef<string | number | null>(null);
    const [panelMode, setPanelMode] = useState<"view" | "create" | null>(null);


    if (loading) {
        return <div className="loading">Loading tasks...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="kanban-board-wrapper">
            <button className="add-task green-button"
                onClick={() => {
                    setSelectedTask(null);
                    setPanelMode("create");
                }}
            >
                New Task
            </button>

            <DragDropProvider
                onDragStart={(event) => {
                    const id = event.operation.source?.id as string;

                    const col = findColumn(board, id);

                    if (!col) return;

                    setActiveCard(
                        board[col].find((c) => c.id === id) ?? null
                    );

                    setSnapshot(board);
                    lastTargetRef.current = null;
                }}
                onDragOver={(event) => {
                    const sourceId =
                        event.operation.source?.id as string;

                    const targetId =
                        event.operation.target?.id ?? null;

                    if (targetId === sourceId) return;
                    if (targetId === lastTargetRef.current) return;

                    lastTargetRef.current = targetId;

                    if (targetId == null) {
                        setActiveColumnId(null);
                        return;
                    }

                    if (typeof targetId === "string") {
                        setActiveColumnId(targetId as ColumnId);
                    } else {
                        setActiveColumnId(
                            findColumn(
                                board,
                                String(targetId)
                            ) ?? null
                        );
                    }

                    if (!snapshot) return;

                    setBoard(
                        applyDrag(
                            snapshot,
                            sourceId,
                            String(targetId)
                        )
                    );
                }}
                onDragEnd={async (event) => {
                    setActiveColumnId(null);
                    lastTargetRef.current = null;

                    if (event.canceled && snapshot) {
                        setBoard(snapshot);
                    }

                    if (!event.canceled && activeCard) {
                        const oldColumn = findColumn(snapshot!, activeCard.id);
                        const newColumn = findColumn(board, activeCard.id);

                        if (oldColumn && newColumn && oldColumn !== newColumn) {
                            await supabase
                                .from("tasks")
                                .update({
                                    status: newColumn,
                                })
                                .eq("id", activeCard.id);

                            const {
                                data: { user }
                            } = await supabase.auth.getUser();

                            await logTaskActivity({
                                taskId: activeCard.id,
                                userId: user!.id,
                                action: "moved",
                                from: oldColumn,
                                to: newColumn,
                            });
                        }
                    }

                    setActiveCard(null);
                    setSnapshot(null);
                }}
            >
                <div className="kanban-board">
                    {COLUMNS.map((column) => (
                        <KanbanColumn
                            key={column.id}
                            id={column.id}
                            label={column.label}
                            cards={board[column.id]}
                            isActive={
                                activeColumnId === column.id
                            }
                            onCardClick={openTask}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeCard ? (
                        <div className="kanban-card drag-overlay">
                            {activeCard.title}
                        </div>
                    ) : null}
                </DragOverlay>
            </DragDropProvider>

            <SidePanel
                task={selectedTask}
                mode={panelMode ?? "view"}
                onClose={() => {
                    setSelectedTask(null);
                    setPanelMode(null);
                }}
                onCreate={addTask}
                onDelete={deleteTask}
            />
        </div>
    );
}