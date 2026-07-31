import { useSortable } from "@dnd-kit/react/sortable";
import { type Card } from "../../types/kanban";
import "./board.css";

type Props = {
    card: Card;
    index: number;
    onClick: (card: Card) => void;
};

export function KanbanCard({
    card,
    index,
    onClick
}: Props) {

    const { ref, isDragSource } = useSortable({
        id: card.id,
        index,
    });

    return (
        <div
            ref={ref}
            className="kanban-card"
            style={{ opacity: isDragSource ? 0.5 : 1 }}
            onClick={() => onClick(card)}
        >
            {card.title}
        </div>
    );
}