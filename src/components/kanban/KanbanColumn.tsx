import { type Card, type ColumnId } from "../../types/kanban";
import { KanbanCard } from "./KanbanCard";
import { useDroppable } from "@dnd-kit/react";
import "./board.css";

export function KanbanColumn ({
    id,
    label,
    cards,
    isActive,
    onCardClick, 
} : {
    id: ColumnId;
    label: string;
    cards: Card[];
    isActive: boolean;
    onCardClick: (card: Card) => void;

}) {
    const { ref } = useDroppable({ id });
    return (
        <div className={`kanban-column${isActive ? " drag-over" : ""}`} ref={ref}>
            <h3 className="kanban-column-header">{label}</h3>
            <div className="kanban-column-body">
                {cards.map((card, index) => (
                    <KanbanCard 
                        key={card.id}
                        card={card} 
                        index={index} 
                        onClick={onCardClick}    
                    />
                ))}
            </div>
        </div>
    )
}