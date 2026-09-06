"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { DrawingPoint, DrawingStroke } from "@/lib/types";

interface DrawingCanvasProps {
  strokes: DrawingStroke[];
  color?: string;
  strokeWidth?: number;
  onStrokeComplete?: (points: DrawingPoint[]) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

interface CanvasSize {
  width: number;
  height: number;
}

function drawPath(
  context: CanvasRenderingContext2D,
  points: DrawingPoint[],
  canvasSize: CanvasSize,
  color: string,
  width: number
) {
  if (points.length === 0) return;

  const scaledWidth = Math.max(2, width * canvasSize.width / 800);
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = scaledWidth;
  context.lineCap = "round";
  context.lineJoin = "round";

  if (points.length === 1) {
    const point = points[0];
    context.beginPath();
    context.arc(point.x * canvasSize.width, point.y * canvasSize.height, scaledWidth / 2, 0, Math.PI * 2);
    context.fill();
    return;
  }

  context.beginPath();
  context.moveTo(points[0].x * canvasSize.width, points[0].y * canvasSize.height);
  for (const point of points.slice(1)) {
    context.lineTo(point.x * canvasSize.width, point.y * canvasSize.height);
  }
  context.stroke();
}

export default function DrawingCanvas({
  strokes,
  color = "#1f2937",
  strokeWidth = 8,
  onStrokeComplete,
  disabled = false,
  ariaLabel = "Shared drawing board",
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activePointsRef = useRef<DrawingPoint[]>([]);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 0, height: 0 });
  const [activePoints, setActivePoints] = useState<DrawingPoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const interactive = Boolean(onStrokeComplete) && !disabled;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const devicePixelRatio = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.round(bounds.width));
      const height = Math.max(1, Math.round(bounds.height));
      const pixelWidth = Math.max(1, Math.round(width * devicePixelRatio));
      const pixelHeight = Math.max(1, Math.round(height * devicePixelRatio));

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      setCanvasSize((previous) =>
        previous.width === width && previous.height === height
          ? previous
          : { width, height }
      );
    };

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.width === 0 || canvasSize.height === 0) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    context.clearRect(0, 0, canvasSize.width, canvasSize.height);
    context.fillStyle = "#fffdf7";
    context.fillRect(0, 0, canvasSize.width, canvasSize.height);

    for (const stroke of strokes) {
      drawPath(context, stroke.points, canvasSize, stroke.color, stroke.width);
    }
    if (activePoints.length > 0) {
      drawPath(context, activePoints, canvasSize, color, strokeWidth);
    }
  }, [activePoints, canvasSize, color, strokeWidth, strokes]);

  const getPoint = (event: ReactPointerEvent<HTMLCanvasElement>): DrawingPoint => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
      y: Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)),
    };
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!interactive || isDrawing) return;
    const point = getPoint(event);
    activePointsRef.current = [point];
    setActivePoints([point]);
    setIsDrawing(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const nextPoints = [...activePointsRef.current, getPoint(event)];
    activePointsRef.current = nextPoints;
    setActivePoints(nextPoints);
  };

  const resetActiveStroke = () => {
    activePointsRef.current = [];
    setActivePoints([]);
    setIsDrawing(false);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const completedPoints = activePointsRef.current;
    resetActiveStroke();
    if (completedPoints.length > 0) {
      onStrokeComplete?.(completedPoints);
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="w-full aspect-[4/3] overflow-hidden rounded-xl border border-gray-300 bg-[#fffdf7] shadow-inner">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={ariaLabel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={resetActiveStroke}
        className={`block h-full w-full ${interactive ? "cursor-crosshair" : "cursor-default"}`}
        style={{ touchAction: "none" }}
      />
    </div>
  );
}
