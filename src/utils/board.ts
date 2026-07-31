import { type Board, type ColumnId } from "../types/kanban";

export const COLUMNS = [
    { id: "todo", label: "To Do" },
    { id: "inProgress", label: "In Progress" },
    { id: "inReview", label: "In Review" },
    { id: "done", label: "Done" },
] satisfies { id: ColumnId; label: string }[];

export function findColumn(board: Board, cardId: string): ColumnId | undefined {
    return (Object.keys(board) as ColumnId[]).find((col) =>
        board[col].some(card => card.id === cardId)
    )
}

export function applyDrag(
    board: Board,
    sourceId: string, 
    targetId: string, 
) : Board {
    const sourceCol = findColumn(board, sourceId)
    if (!sourceCol) return board

    const next: Board = {
        todo: [...board.todo],
        inProgress: [...board.inProgress],
        inReview: [...board.inReview],
        done: [...board.done]
    }

    const sourceIdx = next[sourceCol].findIndex((card) => card.id === sourceId)
    const [card] = next[sourceCol].splice(sourceIdx, 1)

    // Check if target is a column
    if (COLUMNS.some((col) => col.id === targetId)) {
        next[targetId as ColumnId].push(card);
        return next;
    }

    // Otherwise target is another card
    const targetCol = findColumn(next, targetId);

    if (!targetCol) {
        next[sourceCol].splice(sourceIdx, 0, card);
        return next;
    }

    const targetIdx = next[targetCol].findIndex(
        (c) => c.id === targetId
    );

    next[targetCol].splice(targetIdx, 0, card);
    
    return next
}