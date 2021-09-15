import * as React from "react";
import {
  AttachTouch,
  SwipeDirections,
  HandledEvents,
  Setter,
  SwipeCallbacks,
  SwipeableHandlers,
  SwipeableProps,
  SwipeablePropsWithDefaultOptions,
  SwipeableState,
  SwipeCallback,
  TapCallback,
  VectorTuple,
  EventData,
  Directions
} from "./types";

export {
  Directions,
  SwipeDirections,
  EventData,
  SwipeCallback,
  TapCallback,
  SwipeableHandlers,
  SwipeableProps,
  VectorTuple,
};

const defaultProps = {
  delta: 10,
  preventDefaultTouchmoveEvent: false,
  rotationAngle: 0,
  trackMouse: false,
  trackTouch: true,
};
const initialState: SwipeableState = {
  first: true,
  initial: [0, 0],
  start: 0,
  swiping: false,
  xy: [0, 0],
};
const mouseMove = "mousemove";
const mouseUp = "mouseup";
const touchEnd = "touchend";
const touchMove = "touchmove";
const touchStart = "touchstart";

function getDirection(
  absX: number,
  absY: number,
  deltaX: number,
  deltaY: number
): SwipeDirections {
  if (absX > absY) {
    if (deltaX > 0) {
      return Directions.RIGHT;
    }
    return Directions.LEFT;
  } else if (deltaY > 0) {
    return Directions.DOWN;
  }
  return Directions.UP;
}

function rotateXYByAngle(pos: VectorTuple, angle: number): VectorTuple {
  if (angle === 0) return pos;
  const angleInRadians = (Math.PI / 180) * angle;
  const x =
    pos[0] * Math.cos(angleInRadians) + pos[1] * Math.sin(angleInRadians);
  const y =
    pos[1] * Math.cos(angleInRadians) - pos[0] * Math.sin(angleInRadians);
  return [x, y];
}

function getHandlers(
  set: Setter,
  handlerProps: { trackMouse: boolean | undefined }
): [
  {
    ref: (element: HTMLElement | null) => void;
    onMouseDown?: (event: React.MouseEvent) => void;
  },
  AttachTouch
] {
  const onStart = (event: HandledEvents) => {
    if (event && "touches" in event && event.touches.length > 1) return;

    set((state, props) => {
      if (props.trackMouse) {
        document.addEventListener(mouseMove, onMove);
        document.addEventListener(mouseUp, onUp);
      }
      const { clientX, clientY } =
        "touches" in event ? event.touches[0] : event;
      const xy = rotateXYByAngle([clientX, clientY], props.rotationAngle);
      return {
        ...state,
        ...initialState,
        initial: [...xy],
        xy,
        start: event.timeStamp || 0,
      };
    });
  };

  const onMove = (event: HandledEvents) => {
    set((state, props) => {
      if ("touches" in event && event.touches.length > 1) {
        return state;
      }
      const { clientX, clientY } =
        "touches" in event ? event.touches[0] : event;
      const [x, y] = rotateXYByAngle([clientX, clientY], props.rotationAngle);
      const deltaX = x - state.xy[0];
      const deltaY = y - state.xy[1];
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      const time = (event.timeStamp || 0) - state.start;
      const velocity = Math.sqrt(absX * absX + absY * absY) / (time || 1);
      const vxvy: VectorTuple = [deltaX / (time || 1), deltaY / (time || 1)];

      const dir = getDirection(absX, absY, deltaX, deltaY);

      const delta =
        typeof props.delta === "number"
          ? props.delta
          : props.delta[dir.toLowerCase() as Lowercase<SwipeDirections>] ||
            defaultProps.delta;
      if (absX < delta && absY < delta && !state.swiping) return state;

      const eventData = {
        absX,
        absY,
        deltaX,
        deltaY,
        dir,
        event,
        first: state.first,
        initial: state.initial,
        velocity,
        vxvy,
      };

      eventData.first && props.onSwipeStart && props.onSwipeStart(eventData);

      props.onSwiping && props.onSwiping(eventData);

      let cancelablePageSwipe = false;
      if (props.onSwiping || props.onSwiped || `onSwiped${dir}` in props) {
        cancelablePageSwipe = true;
      }

      if (
        cancelablePageSwipe &&
        props.preventDefaultTouchmoveEvent &&
        props.trackTouch &&
        event.cancelable
      )
        event.preventDefault();

      return {
        ...state,
        first: false,
        eventData,
        swiping: true,
      };
    });
  };

  const onEnd = (event: HandledEvents) => {
    set((state, props) => {
      let eventData: EventData | undefined;
      if (state.swiping && state.eventData) {
        eventData = { ...state.eventData, event };
        props.onSwiped && props.onSwiped(eventData);

        const onSwipedDir =
          props[`onSwiped${eventData.dir}` as keyof SwipeCallbacks];
        onSwipedDir && onSwipedDir(eventData);
      } else {
        props.onTap && props.onTap({ event });
      }
      return { ...state, ...initialState, eventData };
    });
  };

  const cleanUpMouse = () => {
    document.removeEventListener(mouseMove, onMove);
    document.removeEventListener(mouseUp, onUp);
  };

  const onUp = (e: HandledEvents) => {
    cleanUpMouse();
    onEnd(e);
  };

  /**
   * Switch of "passive" property for now.
   * When `preventDefaultTouchmoveEvent` is:
   * - true => { passive: false }
   * - false => { passive: true }
   *
   * Could take entire `addEventListener` options object as a param later?
   */
  const attachTouch: AttachTouch = (el, passive) => {
    let cleanup = () => {};
    if (el && el.addEventListener) {
      const tls: [
        typeof touchStart | typeof touchMove | typeof touchEnd,
        (e: HandledEvents) => void
      ][] = [
        [touchStart, onStart],
        [touchMove, onMove],
        [touchEnd, onEnd],
      ];
      tls.forEach(([e, h]) => el.addEventListener(e, h, { passive }));
      cleanup = () => tls.forEach(([e, h]) => el.removeEventListener(e, h));
    }
    return cleanup;
  };

  const onRef = (el: HTMLElement | null) => {
    if (el === null) return;
    set((state, props) => {
      if (state.el === el) return state;

      const addState: { cleanUpTouch?: () => void } = {};
      if (state.el && state.el !== el && state.cleanUpTouch) {
        state.cleanUpTouch();
        addState.cleanUpTouch = undefined;
      }
      if (props.trackTouch && el) {
        addState.cleanUpTouch = attachTouch(
          el,
          !props.preventDefaultTouchmoveEvent
        );
      }

      return { ...state, el, ...addState };
    });
  };

  const output: { ref: typeof onRef; onMouseDown?: typeof onStart } = {
    ref: onRef,
  };

  if (handlerProps.trackMouse) {
    output.onMouseDown = onStart;
  }

  return [output, attachTouch];
}

function updateTransientState(
  state: SwipeableState,
  props: SwipeableProps,
  attachTouch: AttachTouch
) {
  const addState: { cleanUpTouch?(): void } = {};
  if (!props.trackTouch && state.cleanUpTouch) {
    state.cleanUpTouch();
    addState.cleanUpTouch = undefined;
  } else if (props.trackTouch && !state.cleanUpTouch) {
    if (state.el) {
      addState.cleanUpTouch = attachTouch(
        state.el,
        !props.preventDefaultTouchmoveEvent
      );
    }
  }
  return { ...state, ...addState };
}

export function useSwipe(options: SwipeableProps): SwipeableHandlers {
  const { trackMouse } = options;
  const transientState = React.useRef({ ...initialState });
  const transientProps = React.useRef<SwipeablePropsWithDefaultOptions>({
    ...defaultProps,
  });
  transientProps.current = { ...defaultProps, ...options };

  const [handlers, attachTouch] = React.useMemo(
    () =>
      getHandlers(
        (stateSetter) =>
          (transientState.current = stateSetter(
            transientState.current,
            transientProps.current
          )),
        { trackMouse }
      ),
    [trackMouse]
  );

  transientState.current = updateTransientState(
    transientState.current,
    transientProps.current,
    attachTouch
  );

  return handlers;
}