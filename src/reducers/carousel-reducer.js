const previous = (length, current) => (current - 1 + length) % length;

const skip = (length, current) => (current + 1) % length;

export default function carouselReducer(state, action) {
  switch (action.type) {
    case "leap":
      return Object.assign({}, state, { desired: action.desired });
    case "skip":
      return Object.assign({}, state, {
        desired: skip(action.length, state.active),
      });
    case "previous":
      return Object.assign({}, state, {
        desired: previous(action.length, state.active),
      });
    case "finished":
      return Object.assign({}, state, {
        displacement: NaN,
        active: state.desired,
      });
    case "dragging":
      return Object.assign({}, state, { displacement: action.displacement });
    default:
      return state;
  }
}
