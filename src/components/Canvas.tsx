import { useRef, useState, useCallback, useEffect } from 'react'
import { useCanvasStore } from '../stores/canvasStore'
import { Point, CanvasElement } from '../types/canvas'


let idCounter = 0
function generateId(): string {
  return `el_${Date.now()}_${++idCounter}`
}

function getElementBounds(el: CanvasElement): { x: number; y: number; width: number; height: number } {
  if (el.type === 'freehand') {
    const xs = el.points.map((p) => p.x)
    const ys = el.points.map((p) => p.y)
    const minX = Math.min(...xs)
    const minY = Math.min(...ys)
    const maxX = Math.max(...xs)
    const maxY = Math.max(...ys)
    return { x: minX, y: minY, width: maxX - minX || 1, height: maxY - minY || 1 }
  }
  if (el.type === 'line' || el.type === 'arrow') {
    const x = Math.min(el.x, el.x2)
    const y = Math.min(el.y, el.y2)
    return { x, y, width: Math.abs(el.x2 - el.x) || 1, height: Math.abs(el.y2 - el.y) || 1 }
  }
  if (el.type === 'text') {
    return { x: el.x, y: el.y, width: el.text.length * el.fontSize * 0.6, height: el.fontSize * 1.2 }
  }
  return { x: el.x, y: el.y, width: el.width, height: el.height }
}

interface CanvasProps {
  onMouseMove?: (x: number, y: number) => void
}

export default function Canvas({ onMouseMove }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [currentElement, setCurrentElement] = useState<CanvasElement | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [lastPan, setLastPan] = useState<Point>({ x: 0, y: 0 })
  const [freehandPoints, setFreehandPoints] = useState<Point[]>([])

  const {
    tool,
    elements,
    zoom,
    panX,
    panY,
    selectedIds,
    strokeColor,
    fillColor,
    strokeWidth,
    opacity,
    addElement,
    setZoom,
    setPan,
    setSelectedIds,
    deleteElements,
  } = useCanvasStore()

  const screenToCanvas = useCallback(
    (sx: number, sy: number): Point => {
      return {
        x: (sx - panX) / zoom,
        y: (sy - panY) / zoom,
      }
    },
    [panX, panY, zoom]
  )

  const renderElement = useCallback(
    (ctx: CanvasRenderingContext2D, el: CanvasElement) => {
      ctx.save()
      ctx.globalAlpha = el.opacity ?? 1
      ctx.strokeStyle = el.strokeColor || '#111111'
      ctx.lineWidth = el.strokeWidth ?? 2
      ctx.fillStyle = el.fillColor || 'transparent'

      if (el.type === 'freehand') {
        if (el.points.length < 2) {
          ctx.restore()
          return
        }
        ctx.beginPath()
        ctx.moveTo(el.points[0].x, el.points[0].y)
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x, el.points[i].y)
        }
        ctx.stroke()
      } else if (el.type === 'line') {
        ctx.beginPath()
        ctx.moveTo(el.x, el.y)
        ctx.lineTo(el.x2, el.y2)
        ctx.stroke()
      } else if (el.type === 'arrow') {
        const headLen = 12
        const arrowAngle = Math.atan2(el.y2 - el.y, el.x2 - el.x)
        ctx.beginPath()
        ctx.moveTo(el.x, el.y)
        ctx.lineTo(el.x2, el.y2)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(el.x2, el.y2)
        ctx.lineTo(el.x2 - headLen * Math.cos(arrowAngle - Math.PI / 6), el.y2 - headLen * Math.sin(arrowAngle - Math.PI / 6))
        ctx.moveTo(el.x2, el.y2)
        ctx.lineTo(el.x2 - headLen * Math.cos(arrowAngle + Math.PI / 6), el.y2 - headLen * Math.sin(arrowAngle + Math.PI / 6))
        ctx.stroke()
      } else if (el.type === 'rectangle') {
        if (el.fillColor && el.fillColor !== 'transparent') {
          ctx.fillRect(el.x, el.y, el.width, el.height)
        }
        ctx.strokeRect(el.x, el.y, el.width, el.height)
      } else if (el.type === 'ellipse') {
        const cx = el.x + el.width / 2
        const cy = el.y + el.height / 2
        ctx.beginPath()
        ctx.ellipse(cx, cy, Math.abs(el.width / 2), Math.abs(el.height / 2), 0, 0, Math.PI * 2)
        if (el.fillColor && el.fillColor !== 'transparent') {
          ctx.fill()
        }
        ctx.stroke()
      } else if (el.type === 'diamond') {
        const cx = el.x + el.width / 2
        const cy = el.y + el.height / 2
        ctx.beginPath()
        ctx.moveTo(cx, el.y)
        ctx.lineTo(el.x + el.width, cy)
        ctx.lineTo(cx, el.y + el.height)
        ctx.lineTo(el.x, cy)
        ctx.closePath()
        if (el.fillColor && el.fillColor !== 'transparent') {
          ctx.fill()
        }
        ctx.stroke()
      } else if (el.type === 'text') {
        ctx.font = `${el.fontSize ?? 16}px sans-serif`
        ctx.fillStyle = el.strokeColor || '#111111'
        ctx.textBaseline = 'top'
        const lines = (el.text || '').split('\n')
        const lineHeight = (el.fontSize ?? 16) * 1.3
        lines.forEach((line, i) => {
          ctx.fillText(line, el.x, el.y + i * lineHeight)
        })
      }

      ctx.restore()
    },
    []
  )

  const drawSelection = useCallback(
    (ctx: CanvasRenderingContext2D, el: CanvasElement) => {
      const bounds = getElementBounds(el)
      const pad = 4
      const x = bounds.x - pad
      const y = bounds.y - pad
      const w = bounds.width + pad * 2
      const h = bounds.height + pad * 2

      ctx.save()
      ctx.strokeStyle = '#D4A843'
      ctx.lineWidth = 1.5 / zoom
      ctx.setLineDash([6 / zoom, 4 / zoom])
      ctx.strokeRect(x, y, w, h)
      ctx.setLineDash([])

      const handleSize = 8 / zoom
      const handles = [
        { hx: x, hy: y },
        { hx: x + w / 2, hy: y },
        { hx: x + w, hy: y },
        { hx: x + w, hy: y + h / 2 },
        { hx: x + w, hy: y + h },
        { hx: x + w / 2, hy: y + h },
        { hx: x, hy: y + h },
        { hx: x, hy: y + h / 2 },
      ]

      ctx.fillStyle = '#D4A843'
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1.5 / zoom
      handles.forEach(({ hx, hy }) => {
        ctx.fillRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize)
        ctx.strokeRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize)
      })

      ctx.restore()
    },
    [zoom]
  )

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const dotSpacing = 20
    if (zoom > 0.4) {
      ctx.fillStyle = '#e5e7eb'
      const startX = Math.floor(-panX / zoom / dotSpacing) * dotSpacing
      const startY = Math.floor(-panY / zoom / dotSpacing) * dotSpacing
      const endX = startX + canvas.width / zoom + dotSpacing * 2
      const endY = startY + canvas.height / zoom + dotSpacing * 2
      for (let dx = startX; dx <= endX; dx += dotSpacing) {
        for (let dy = startY; dy <= endY; dy += dotSpacing) {
          ctx.beginPath()
          ctx.arc(dx, dy, 1.2 / zoom, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    ctx.save()
    ctx.translate(panX, panY)
    ctx.scale(zoom, zoom)

    elements.forEach((el) => renderElement(ctx, el))
    if (currentElement) {
      renderElement(ctx, currentElement)
    }

    selectedIds.forEach((id) => {
      const el = elements.find((e) => e.id === id)
      if (el) drawSelection(ctx, el)
    })

    ctx.restore()
  }, [elements, currentElement, selectedIds, zoom, panX, panY, renderElement, drawSelection])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        canvas.width = width
        canvas.height = height
        draw()
      }
    })
    observer.observe(container)

    return () => observer.disconnect()
  }, [draw])

  useEffect(() => {
    draw()
  }, [draw])

  const findElementAtPoint = useCallback(
    (px: number, py: number): CanvasElement | null => {
      for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i]
        const bounds = getElementBounds(el)
        const pad = 4
        if (
          px >= bounds.x - pad &&
          px <= bounds.x + bounds.width + pad &&
          py >= bounds.y - pad &&
          py <= bounds.y + bounds.height + pad
        ) {
          return el
        }
      }
      return null
    },
    [elements]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top
      const pt = screenToCanvas(sx, sy)

      if (tool === 'hand' || e.button === 1) {
        setIsPanning(true)
        setLastPan({ x: e.clientX, y: e.clientY })
        e.preventDefault()
        return
      }

      if (tool === 'select') {
        const hit = findElementAtPoint(pt.x, pt.y)
        if (hit) {
          if (e.shiftKey) {
            setSelectedIds(
              selectedIds.includes(hit.id)
                ? selectedIds.filter((id) => id !== hit.id)
                : [...selectedIds, hit.id]
            )
          } else {
            setSelectedIds([hit.id])
          }
        } else {
          setSelectedIds([])
        }
        return
      }

      setIsDrawing(true)
      setStartPoint(pt)

      if (tool === 'freehand') {
        setFreehandPoints([pt])
        setCurrentElement({
          id: generateId(),
          type: 'freehand',
          points: [pt],
          x: pt.x,
          y: pt.y,
          strokeColor,
          fillColor: 'transparent',
          strokeWidth,
          opacity,
          angle: 0,
        })
      } else if (tool === 'eraser') {
        setIsDrawing(true)
        setStartPoint(pt)
        setFreehandPoints([pt])
      } else if (tool === 'text') {
        const text = prompt('Enter text:')
        if (text) {
          addElement({
            id: generateId(),
            type: 'text',
            x: pt.x,
            y: pt.y,
            text,
            fontSize: 16,
            strokeColor,
            fillColor: 'transparent',
            strokeWidth,
            opacity,
            angle: 0,
          })
        }
        setIsDrawing(false)
      } else {
        const base = {
          id: generateId(),
          strokeColor,
          fillColor,
          strokeWidth,
          opacity,
          angle: 0,
        }
        if (tool === 'line') {
          setCurrentElement({ ...base, type: 'line', x: pt.x, y: pt.y, x2: pt.x, y2: pt.y })
        } else if (tool === 'arrow') {
          setCurrentElement({ ...base, type: 'arrow', x: pt.x, y: pt.y, x2: pt.x, y2: pt.y })
        } else if (tool === 'rectangle') {
          setCurrentElement({ ...base, type: 'rectangle', x: pt.x, y: pt.y, width: 0, height: 0 })
        } else if (tool === 'ellipse') {
          setCurrentElement({ ...base, type: 'ellipse', x: pt.x, y: pt.y, width: 0, height: 0 })
        } else if (tool === 'diamond') {
          setCurrentElement({ ...base, type: 'diamond', x: pt.x, y: pt.y, width: 0, height: 0 })
        }
      }
    },
    [tool, screenToCanvas, findElementAtPoint, selectedIds, setSelectedIds, strokeColor, fillColor, strokeWidth, opacity, addElement]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top
      const pt = screenToCanvas(sx, sy)

      if (onMouseMove) {
        onMouseMove(pt.x, pt.y)
      }

      if (isPanning) {
        const dx = e.clientX - lastPan.x
        const dy = e.clientY - lastPan.y
        setPan(panX + dx, panY + dy)
        setLastPan({ x: e.clientX, y: e.clientY })
        return
      }

      if (!isDrawing || !startPoint) return

      if (tool === 'eraser') {
        const newPoints = [...freehandPoints, pt]
        setFreehandPoints(newPoints)
        const eraserRadius = strokeWidth * 2
        const toDelete: string[] = []
        for (const el of elements) {
          if (el.type === 'freehand') {
            for (const p of el.points) {
              if (Math.abs(p.x - pt.x) < eraserRadius && Math.abs(p.y - pt.y) < eraserRadius) {
                toDelete.push(el.id)
                break
              }
            }
          } else {
            const b = getElementBounds(el)
            if (
              pt.x >= b.x - eraserRadius && pt.x <= b.x + b.width + eraserRadius &&
              pt.y >= b.y - eraserRadius && pt.y <= b.y + b.height + eraserRadius
            ) {
              toDelete.push(el.id)
            }
          }
        }
        if (toDelete.length > 0) {
          deleteElements(toDelete)
        }
        return
      }

      if (tool === 'freehand') {
      } else if (currentElement && (tool === 'line' || tool === 'arrow')) {
        setCurrentElement((prev) =>
          prev && (prev.type === 'line' || prev.type === 'arrow')
            ? { ...prev, x2: pt.x, y2: pt.y }
            : prev
        )
      } else if (currentElement && (tool === 'rectangle' || tool === 'ellipse' || tool === 'diamond')) {
        const x = Math.min(startPoint.x, pt.x)
        const y = Math.min(startPoint.y, pt.y)
        const width = Math.abs(pt.x - startPoint.x)
        const height = Math.abs(pt.y - startPoint.y)
        setCurrentElement((prev) =>
          prev && (prev.type === 'rectangle' || prev.type === 'ellipse' || prev.type === 'diamond')
            ? { ...prev, x, y, width, height }
            : prev
        )
      }
    },
    [isPanning, lastPan, isDrawing, startPoint, tool, freehandPoints, currentElement, panX, panY, zoom, screenToCanvas, setPan, onMouseMove]
  )

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false)
      return
    }

    if (isDrawing && currentElement && tool !== 'eraser') {
      const bounds = getElementBounds(currentElement)
      if (bounds.width > 2 || bounds.height > 2 || currentElement.type === 'freehand') {
        addElement(currentElement)
      }
    }

    setIsDrawing(false)
    setStartPoint(null)
    setCurrentElement(null)
    setFreehandPoints([])
  }, [isPanning, isDrawing, currentElement, addElement, tool])

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const sx = e.clientX - rect.left
        const sy = e.clientY - rect.top

        const delta = -e.deltaY * 0.002
        const newZoom = Math.min(10, Math.max(0.1, zoom * (1 + delta)))
        const scale = newZoom / zoom

        const newPanX = sx - (sx - panX) * scale
        const newPanY = sy - (sy - panY) * scale

        setZoom(newZoom)
        setPan(newPanX, newPanY)
      } else {
        setPan(panX - e.deltaX, panY - e.deltaY)
      }
    },
    [zoom, panX, panY, setZoom, setPan]
  )

  const getCursor = () => {
    if (tool === 'hand') return 'grab'
    if (tool === 'select') return 'default'
    if (tool === 'text') return 'text'
    return 'crosshair'
  }

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', overflow: 'hidden', cursor: getCursor() }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  )
}
