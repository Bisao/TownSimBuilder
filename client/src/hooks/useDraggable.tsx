import { useState, useRef, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDraggableOptions {
  initialPosition?: Position;
  disabled?: boolean;
}

export const useDraggable = ({ initialPosition = { x: 0, y: 0 }, disabled = false }: UseDraggableOptions = {}) => {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<Position>({ x: 0, y: 0 });
  const elementStartPos = useRef<Position>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || disabled) return;

      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;

      const newX = elementStartPos.current.x + deltaX;
      const newY = elementStartPos.current.y + deltaY;

      // Limitar dentro da viewport
      const maxX = window.innerWidth - (dragRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (dragRef.current?.offsetHeight || 0);

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, disabled]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || e.button !== 0) return; // Apenas botão esquerdo

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = position;
  };

  return {
    dragRef,
    position,
    isDragging,
    handleMouseDown,
    setPosition
  };
};