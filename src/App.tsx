import "./App.css";

import React, { useRef, useEffect, useState } from "react";

type Point = {
  x: number;
  y: number;
};

type Size = {
  width: number;
  height: number;
};

type Rect = {
  position: Point;
  size: Size;
};

type ConnectionPoint = {
  point: Point;
  angle: number;
};

// Функция для вычисления массива точек
const dataConverter = (
  rect1: Rect,
  rect2: Rect,
  cPoint1: ConnectionPoint,
  cPoint2: ConnectionPoint
): Point[] => {
  // Валидация соединительных точек и углов (пример проверки)
  const validateConnection = (rect: Rect, cPoint: ConnectionPoint): boolean => {
    const halfWidth = rect.size.width / 2;
    const halfHeight = rect.size.height / 2;
    const { x, y } = cPoint.point;

    const isOnEdge =
      ((x === rect.position.x - halfWidth ||
        x === rect.position.x + halfWidth) &&
        y >= rect.position.y - halfHeight &&
        y <= rect.position.y + halfHeight) ||
      ((y === rect.position.y - halfHeight ||
        y === rect.position.y + halfHeight) &&
        x >= rect.position.x - halfWidth &&
        x <= rect.position.x + halfWidth);

    const isAngleValid = [0, 90, 180, 270].includes(cPoint.angle % 360);

    return isOnEdge && isAngleValid;
  };

  if (
    !validateConnection(rect1, cPoint1) ||
    !validateConnection(rect2, cPoint2)
  ) {
    throw new Error("Connection points are invalid.");
  }

  // Добавляем начальную и конечную точки
  const points: Point[] = [cPoint1.point, cPoint2.point];

  // Расчет ломаной линии, избегая пересечений (упрощено)
  // Промежуточные расчеты и добавление точек пути
  return points;
};

const CanvasComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rect1, setRect1] = useState<Rect>({
    position: { x: 150, y: 150 },
    size: { width: 100, height: 50 },
  });
  const [rect2, setRect2] = useState<Rect>({
    position: { x: 400, y: 300 },
    size: { width: 100, height: 50 },
  });
  const [draggingRect, setDraggingRect] = useState<number | null>(null);

  const cPoint1: ConnectionPoint = {
    point: { x: rect1.position.x, y: rect1.position.y - rect1.size.height / 2 },
    angle: 270,
  };
  const cPoint2: ConnectionPoint = {
    point: { x: rect2.position.x, y: rect2.position.y - rect2.size.height / 2 },
    angle: 90,
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Отрисовка прямоугольников
    [rect1, rect2].forEach((rect) => {
      ctx.beginPath();
      ctx.rect(
        rect.position.x - rect.size.width / 2,
        rect.position.y - rect.size.height / 2,
        rect.size.width,
        rect.size.height
      );
      ctx.stroke();
    });

    // Отрисовка ломаной линии
    const points = dataConverter(rect1, rect2, cPoint1, cPoint2);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.stroke();
  };

  // Эффект отрисовки при изменении прямоугольников
  useEffect(() => {
    draw();
  }, [rect1, rect2]);

  // Обработчик для начала перетаскивания
  const handleMouseDown = (event: React.MouseEvent) => {
    const { offsetX, offsetY } = event.nativeEvent;
    if (
      offsetX >= rect1.position.x - rect1.size.width / 2 &&
      offsetX <= rect1.position.x + rect1.size.width / 2 &&
      offsetY >= rect1.position.y - rect1.size.height / 2 &&
      offsetY <= rect1.position.y + rect1.size.height / 2
    ) {
      setDraggingRect(1);
    } else if (
      offsetX >= rect2.position.x - rect2.size.width / 2 &&
      offsetX <= rect2.position.x + rect2.size.width / 2 &&
      offsetY >= rect2.position.y - rect2.size.height / 2 &&
      offsetY <= rect2.position.y + rect2.size.height / 2
    ) {
      setDraggingRect(2);
    }
  };

  // Обработчик для перетаскивания
  const handleMouseMove = (event: React.MouseEvent) => {
    if (draggingRect) {
      const { offsetX, offsetY } = event.nativeEvent;
      if (draggingRect === 1) {
        setRect1((prev) => ({ ...prev, position: { x: offsetX, y: offsetY } }));
      } else if (draggingRect === 2) {
        setRect2((prev) => ({ ...prev, position: { x: offsetX, y: offsetY } }));
      }
    }
  };

  // Завершение перетаскивания
  const handleMouseUp = () => {
    setDraggingRect(null);
  };

  return (
    <section className="main_section">
      <canvas
        className="canvas_blog"
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: "1px solid black" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </section>
  );
};

export default CanvasComponent;
