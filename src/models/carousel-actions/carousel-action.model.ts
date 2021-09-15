import { CarouselDoneAction } from "./carousel-done-action.model";
import { CarouselDragAction } from "./carousel-drag-action.model";
import { CarouselJumpAction } from "./carousel-jump-action.model";
import { CarouselNextAction } from "./carousel-next-action.model";
import { CarouselPrevAction } from "./carousel-prev-action.model";

export type CarouselAction =
  | CarouselJumpAction
  | CarouselNextAction
  | CarouselPrevAction
  | CarouselDragAction
  | CarouselDoneAction;