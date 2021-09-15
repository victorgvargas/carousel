import * as React from "react";

export enum Directions {
    LEFT = 'left',
    RIGHT = 'right',
    UP = 'up',
    DOWN = 'down'
}

export type HandledEvents = React.MouseEvent | MouseEvent | TouchEvent;
export type VectorTuple = [number, number];
export type SwipeDirections = 
    | typeof Directions.LEFT
    | typeof Directions.RIGHT
    | typeof Directions.UP
    | typeof Directions.DOWN;

export interface EventData {
  absX: number;
  absY: number;
  deltaX: number;
  deltaY: number;
  dir: SwipeDirections;
  event: HandledEvents;
  first: boolean;
  initial: VectorTuple;
  velocity: number;
  vxvy: VectorTuple;
}

export type SwipeCallback = (eventData: EventData) => void;
export type TapCallback = ({event}: {event: HandledEvents}) => void;

export type SwipeCallbacks = {
  onSwipeStart: SwipeCallback;
  onSwiped: SwipeCallback;
  onSwipedDown: SwipeCallback;
  onSwipedLeft: SwipeCallback;
  onSwipedRight: SwipeCallback;
  onSwipedUp: SwipeCallback;
  onSwiping: SwipeCallback;
  onTap: TapCallback;
}

export type ConfigurationOptionDelta =
  | number
  | { [key in Lowercase<SwipeDirections>]?: number };
export interface ConfigurationOptions {
  delta: ConfigurationOptionDelta;
  preventDefaultTouchmoveEvent: boolean;
  rotationAngle: number;
  trackMouse: boolean;
  trackTouch: boolean;
}

export type SwipeableProps = Partial<SwipeCallbacks & ConfigurationOptions>;

export type SwipeablePropsWithDefaultOptions = Partial<SwipeCallbacks> &
  ConfigurationOptions;

export interface SwipeableHandlers {
  ref(element: HTMLElement | null): void;
  onMouseDown?(event: React.MouseEvent): void;
}

export type SwipeableState = {
  cleanUpTouch?: () => void;
  el?: HTMLElement;
  eventData?: EventData;
  first: boolean;
  initial: VectorTuple;
  start: number;
  swiping: boolean;
  xy: VectorTuple;
};

export type StateSetter = (
  state: SwipeableState,
  props: SwipeablePropsWithDefaultOptions
) => SwipeableState;
export type Setter = (stateSetter: StateSetter) => void;
export type AttachTouch = (el: HTMLElement, passive: boolean) => () => void;