export type Tool =
  | "select"
  | "hand"
  | "freehand"
  | "line"
  | "arrow"
  | "rectangle"
  | "ellipse"
  | "diamond"
  | "text";

export interface Point {
  x: number;
  y: number;
}

export interface BaseElement {
  id: string;
  type: Tool;
  x: number;
  y: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  angle: number;
}

export interface FreehandElement extends BaseElement {
  type: "freehand";
  points: Point[];
}

export interface LineElement extends BaseElement {
  type: "line";
  x2: number;
  y2: number;
}

export interface ArrowElement extends BaseElement {
  type: "arrow";
  x2: number;
  y2: number;
}

export interface RectangleElement extends BaseElement {
  type: "rectangle";
  width: number;
  height: number;
}

export interface EllipseElement extends BaseElement {
  type: "ellipse";
  width: number;
  height: number;
}

export interface DiamondElement extends BaseElement {
  type: "diamond";
  width: number;
  height: number;
}

export interface TextElement extends BaseElement {
  type: "text";
  text: string;
  fontSize: number;
}

export type CanvasElement =
  | FreehandElement
  | LineElement
  | ArrowElement
  | RectangleElement
  | EllipseElement
  | DiamondElement
  | TextElement;
