import { EventData } from "../hooks/useSwipe/types";
import { CarouselAction } from "../models/carousel-actions/carousel-action.model";

export const previous = (length: number, current: number) => (current - 1 + length) % length;

export const next = (length: number, current: number) => (current + 1) % length;

export function threshold(target: EventTarget) {
    const width = (target as HTMLElement).clientWidth;
    return width / 3;
}

export function swiped(e: EventData, dispatch: React.Dispatch<CarouselAction>, length: number, dir: 1 | -1) {
    const t = threshold(e.event.target);
    const d = dir * e.deltaX;
  
    if (d >= t) {
      dispatch({
        type: dir > 0 ? 'next' : 'prev',
        length,
      });
    } else {
      dispatch({
        type: 'drag',
        displacement: 0,
      });
    }
}