import { useRef, useState, useCallback, useEffect } from "react";
import { useCanvasStore } from "../stores/canvasStore";
import type { Point, CanvasElement } from "../types/canvas";

let idCounter = 0;
function generateId() {
  return `el_${Date.now()}_${idCounter++}`;
}

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentElement, setCurrentElement] = useState<CanvasElement | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPan, setLastPan] = useState<Point>({ x: 0, y: 0 });
  const [freehandPoints, setFreehandPoints] = useState<Point[]>([]);

  const {
    tool, elements, zoom, panX, panY,
    strokeColor, fillColor, strokeWidth, opacity,
    addElement, setZoom, setPan,
  } = useCanvasStore();

  const screenToCanvas = useCallback(
    (sx: number, sy: number): Point => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (sx - rect.left - panX) / zoom,
        y: (sy - rect.top - panY) / zoom,
      };
    },
    [zoom, panX, panY]
  );

  const renderElement = useCallback(
    (ctx: CanvasRenderingContext2D, el: CanvasElement) => {
      ctx.save();
      ctx.globalAlpha = el.opacity;
      ctx.translate(el.x, el.y);
      ctx.strokeStyle = el.strokeColor;
      ctx.fillStyle = el.fillColor;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      switch (el.type) {
        case "freehand": {
          if (el.points.length < 2) break;
          ctx.beginPath();
          ctx.moveTo(el.points[0].x, el.points[0].y);
          for (let i = 1; i < el.points.length; i++) {
            ctx.lineTo(el.points[i].x, el.points[i].y);
          }
          ctx.stroke();
          break;
        }
        case "line": {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(el.x2 - el.x, el.y2 - el.y);
          ctx.stroke();
          break;
        }
        case "arrow": {
          const dx = el.x2 - el.x;
          const dy = el.y2 - el.y;
          const angle = Math.atan2(dy, dx);
          const headLen = 12;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(dx, dy);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(dx, dy);
          ctx.lineTo(
            dx - headLen * Math.cos(angle - Math.PI / 6),
            dy - headLen * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(dx, dy);
          ctx.lineTo(
            dx - headLen * Math.cos(angle + Math.PI / 6),
            dy - headLen * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
          break;
        }
        case "rectangle": {
          ctx.beginPath();
          ctx.rect(0, 0, el.width, el.height);
          if (el.fillColor !== "transparent") ctx.fill();
          ctx.stroke();
          break;
        }
        case "ellipse": {
          ctx.beginPath();
          ctx.ellipse(
            el.width / 2, el.height / 2,
            Math.abs(el.width / 2), Math.abs(el.height / 2),
            0, 0, Math.PI * 2
          );
          if (el.fillColor !== "transparent") ctx.fill();
          ctx.stroke();
          break;
        }
        case "diamond": {
          const hw = el.width / 2;
          const hh = el.height / 2;
          ctx.beginPath();
          ctx.moveTo(hw, 0);
          ctx.lineTo(el.width, hh);
          ctx.lineTo(hw, el.height);
          ctx.lineTo(0, hh);
          ctx.closePath();
          if (el.fillColor !== "transparent") ctx.fill();
          ctx.stroke();
          break;
        }
        case "text": {
          ctx.font = `${el.fontSize}px sans-serif`;
          ctx.fillStyle = el.strokeColor;
          ctx.fillText(el.text, 0, el.fontSize);
          break;
        }
      }
      ctx.restore();
    },
    []
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);

    for (const el of elements) {
      renderElement(ctx, el);
    }
    if (currentElement) {
      renderElement(ctx, currentElement);
    }

    ctx.restore();
  }, [elements, currentElement, zoom, panX, panY, renderElement]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      draw();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (tool === "hand" || e.button === 1) {
        setIsPanning(true);
        setLastPan({ x: e.clientX, y: e.clientY });
        return;
      }

      if (tool === "select") return;

      const point = screenToCanvas(e.clientX, e.clientY);
      setIsDrawing(true);
      setStartPoint(point);

      if (tool === "freehand") {
        setFreehandPoints([point]);
        setCurrentElement({
          id: generateId(), type: "freehand",
          x: 0, y: 0, points: [point],
          strokeColor, fillColor, strokeWidth, opacity, angle: 0,
        });
      } else if (tool === "text") {
        const text = prompt("Enter text:");
        if (text) {
          addElement({
            id: generateId(), type: "text",
            x: point.x, y: point.y, text, fontSize: 20,
            strokeColor, fillColor: "transparent",
            strokeWidth, opacity, angle: 0,
          });
        }
        setIsDrawing(false);
      } else if (tool === "line" || tool === "arrow") {
        setCurrentElement({
          id: generateId(), type: tool,
          x: point.x, y: point.y, x2: point.x, y2: point.y,
          strokeColor, fillColor, strokeWidth, opacity, angle: 0,
        });
      } else if (tool === "rectangle") {
        setCurrentElement({
          id: generateId(), type: "rectangle",
          x: point.x, y: point.y, width: 0, height: 0,
          strokeColor, fillColor, strokeWidth, opacity, angle: 0,
        });
      } else if (tool === "ellipse") {
        setCurrentElement({
          id: generateId(), type: "ellipse",
          x: point.x, y: point.y, width: 0, height: 0,
          strokeColor, fillColor, strokeWidth, opacity, angle: 0,
        });
      } else if (tool === "diamond") {
        setCurrentElement({
          id: generateId(), type: "diamond",
          x: point.x, y: point.y, width: 0, height: 0,
          strokeColor, fillColor, strokeWidth, opacity, angle: 0,
        });
      }
    },
    [tool, screenToCanvas, strokeColor, fillColor, strokeWidth, opacity, addElement]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        const dx = e.clientX - lastPan.x;
        const dy = e.clientY - lastPan.y;
        setPan(panX + dx, panY + dy);
        setLastPan({ x: e.clientX, y: e.clientY });
        return;
      }

      if (!isDrawing || !startPoint) return;
      const point = screenToCanvas(e.clientX, e.clientY);

      if (tool === "freehand") {
        const newPoints = [...freehandPoints, point];
        setFreehandPoints(newPoints);
        setCurrentElement((prev) =>
          prev && prev.type === "freehand"
            ? { ...prev, points: newPoints }
            : prev
        );
      } else if (currentElement) {
        if (currentElement.type === "line" || currentElement.type === "arrow") {
          setCurrentElement({ ...currentElement, x2: point.x, y2: point.y });
        } else if (
          currentElement.type === "rectangle" ||
          currentElement.type === "ellipse" ||
          currentElement.type === "diamond"
        ) {
          setCurrentElement({
            ...currentElement,
            width: point.x - startPoint.x,
            height: point.y - startPoint.y,
          });
        }
      }
    },
    [isPanning, isDrawing, startPoint, tool, screenToCanvas, lastPan, panX, panY, setPan, currentElement, freehandPoints]
  );

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDrawing && currentElement) {
      addElement(currentElement);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentElement(null);
    setFreehandPoints([]);
  }, [isPanning, isDrawing, currentElement, addElement]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const delta = -e.deltaY * 0.001;
        setZoom(zoom + delta);
      } else {
        setPan(panX - e.deltaX, panY - e.deltaY);
      }
    },
    [zoom, panX, panY, setZoom, setPan]
  );

  const cursorMap: Record<string, string> = {
    select: "default", hand: "grab", freehand: "crosshair",
    line: "crosshair", arrow: "crosshair", rectangle: "crosshair",
    ellipse: "crosshair", diamond: "crosshair", text: "text",
  };

  return (
    <div className="flex-1 overflow-hidden relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: cursorMap[tool] || "default" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
    </div>
  );
}
