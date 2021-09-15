import { useReducer, useEffect } from 'react';
import { swiped } from '../helpers/carousel-helpers';
import { useSwipe, EventData, SwipeableHandlers } from '../hooks/useSwipe/useSwipe';
import { CarouselState } from '../models/carousel-state.model';
import carouselReducer from '../reducers/carousel-reducer';

const transitionTime = 400;
const elastic = `transform ${transitionTime}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
const smooth = `transform ${transitionTime}ms ease`;

const initialCarouselState: CarouselState = {
    displacement: 0,
    desired: 0,
    active: 0,
};

export function useCarousel(
    length: number,
    interval: number,
  ): [number, (n: number) => void, SwipeableHandlers, React.CSSProperties] {
    const [state, dispatch] = useReducer(carouselReducer, initialCarouselState);
    const handlers = useSwipe({
      onSwiping(e) {
        dispatch({
          type: 'drag',
          displacement: -e.deltaX,
        });
      },
      onSwipedLeft(e) {
        swiped(e, dispatch, length, 1);
      },
      onSwipedRight(e) {
        swiped(e, dispatch, length, -1);
      },
      trackMouse: true,
      trackTouch: true,
    });
  
    useEffect(() => {
      const id = setTimeout(() => dispatch({ type: 'next', length }), interval);
      return () => clearTimeout(id);
    }, [state.displacement, state.active]);
  
    useEffect(() => {
      const id = setTimeout(() => dispatch({ type: 'done' }), transitionTime);
      return () => clearTimeout(id);
    }, [state.desired]);
  
    const style: React.CSSProperties = {
      transform: 'translateX(0)',
      width: `${100 * (length + 2)}%`,
      left: `-${(state.active + 1) * 100}%`,
    };
  
    if (state.desired !== state.active) {
      const dist = Math.abs(state.active - state.desired);
      const pref = Math.sign(state.displacement || 0);
      const dir = (dist > length / 2 ? 1 : -1) * Math.sign(state.desired - state.active);
      const shift = (100 * (pref || dir)) / (length + 2);
      style.transition = smooth;
      style.transform = `translateX(${shift}%)`;
    } else if (!isNaN(state.displacement)) {
      if (state.displacement !== 0) {
        style.transform = `translateX(${state.displacement}px)`;
      } else {
        style.transition = elastic;
      }
    }
  
    return [state.active, n => dispatch({ type: 'jump', desired: n }), handlers, style];
  }