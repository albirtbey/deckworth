import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableAreaProps {
  id: string; // Unique ID for the droppable area
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function DroppableArea({ id, children, className, style }: DroppableAreaProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  const combinedStyle = {
    ...style,
    border: isOver ? '2px dashed #2563eb' : '2px dashed #9ca3af', // Example: highlight when an item is over
    transition: 'border-color 0.2s ease-in-out',
  };

  return (
    <div ref={setNodeRef} style={combinedStyle} className={className}>
      {children}
    </div>
  );
} 