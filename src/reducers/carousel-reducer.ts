import { next, previous } from "../helpers/carousel-helpers";
import { CarouselAction } from "../models/carousel-actions/carousel-action.model";
import { CarouselState } from "../models/carousel-state.model";

export default function carouselReducer(state: CarouselState, action: CarouselAction): CarouselState {
  switch (action.type) {
    case "jump":
      return Object.assign({}, state, { desired: action.desired });
    case "next":
      return Object.assign({}, state, {
        desired: next(action.length, state.active),
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
