import { CarouselAction } from "../models/carousel-actions/carousel-action.model";
import { CarouselState } from "../models/carousel-state";

const previous = (length: number, current: number) => (current - 1 + length) % length;

const skip = (length: number, current: number) => (current + 1) % length;

export default function carouselReducer(state: CarouselState, action: CarouselAction): CarouselState {
  switch (action.type) {
    case "jump":
      return Object.assign({}, state, { desired: action.desired });
    case "next":
      return Object.assign({}, state, {
        desired: skip(action.length, state.active),
      });
    case "prev":
      return Object.assign({}, state, {
        desired: previous(action.length, state.active),
      });
    case "done":
      return Object.assign({}, state, {
        displacement: NaN,
        active: state.desired,
      });
    case "drag":
      return Object.assign({}, state, { displacement: action.displacement });
    default:
      return state;
  }
}
