import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { CollectionCard } from '../../types';
import { Card, CardContent } from '../ui/Card'; // Using ShadCN Card for consistency
import { Button } from '../ui/Button';
import { PlusCircle, MinusCircle } from 'lucide-react';

interface DraggableCardProps {
  card: CollectionCard;
  id: string; // Draggable ID, can be card.id
  isOverlay?: boolean; // To style the card when it's being dragged
  onToggleSelection?: (card: CollectionCard) => void;
  isInOfferArea?: boolean; // To show plus or minus icon
}

export function DraggableCard({ card, id, isOverlay, onToggleSelection, isInOfferArea }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useDraggable({
    id: id,
    data: { card }, // Pass card data for drop handlers
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging || isOverlay ? 100 : 'auto',
    cursor: isOverlay ? 'grabbing' : (onToggleSelection ? 'pointer' : 'grab'), // Change cursor if clickable
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent triggering drag when clicking the button part
    // However, dnd-kit's listeners might still pick it up.
    // A common pattern is to have a dedicated drag handle if granular control is needed.
    // For now, let's assume clicks on the button are distinct enough.
    if (onToggleSelection) {
        // Check if the click target is the button itself or its child icon
        let target = e.target as HTMLElement;
        while (target && target !== e.currentTarget) {
            if (target.dataset.role === 'toggle-button') {
                onToggleSelection(card);
                return;
            }
            target = target.parentNode as HTMLElement;
        }
        // If not clicking the button, and the card itself is generally clickable (e.g. to view details)
        // we might want to let that happen. For this component, the main interaction is drag or toggle.
        // If only onToggleSelection is provided, make the whole card clickable for that.
        if ( (e.target as HTMLElement).closest('[data-role="toggle-button"]') === null && listeners && !isDragging) {
             // If we want the whole card to be clickable to toggle, uncomment next line
             // onToggleSelection(card);
        } else if ( (e.target as HTMLElement).closest('[data-role="toggle-button"]') === null && !listeners && onToggleSelection) {
            // Fallback if no listeners (e.g. drag disabled)
            onToggleSelection(card);
        }
    }
  };

  // For this version, the button is the primary click target for selection toggle.
  // The main card area remains draggable via `listeners`.

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative">
      <div {...listeners} > {/* Drag handle area */} 
        <Card 
            className={`p-2 ${isOverlay ? 'shadow-2xl scale-105' : 'hover:shadow-lg'} transition-all ${onToggleSelection && !isOverlay ? 'cursor-grab' : ''}`}
            // onClick={handleCardClick} // Attach click to Card if the whole card should toggle
        >
          <CardContent className="p-0">
            <img src={card.images.small} alt={card.name} className="w-full rounded-md aspect-[2.5/3.5] object-contain mb-1" />
            <p className="text-xs font-medium truncate" title={card.name}>{card.name}</p>
            <p className="text-xs text-muted-foreground">Set: {card.set.name}</p>
            <p className="text-xs text-muted-foreground">Cond: {card.condition}</p>
            <p className="text-xs text-muted-foreground">Qty: {card.quantity}</p>
          </CardContent>
        </Card>
      </div>
      {onToggleSelection && !isOverlay && (
        <Button
          data-role="toggle-button" // For precise click targeting
          variant="outline"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 z-10"
          onClick={() => onToggleSelection(card)} // Direct click handler for the button
        >
          {isInOfferArea ? 
            <MinusCircle className="h-4 w-4 text-destructive" /> : 
            <PlusCircle className="h-4 w-4 text-primary" />
          }
          <span className="sr-only">{isInOfferArea ? 'Remove from offer' : 'Add to offer'}</span>
        </Button>
      )}
    </div>
  );
} 