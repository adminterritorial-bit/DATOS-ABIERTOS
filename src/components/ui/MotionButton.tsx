'use client';
import {motion,useReducedMotion} from 'motion/react';
import type {HTMLMotionProps} from 'motion/react';

/** Adaptación local del patrón Button de Animate UI: Motion, hover/tap y movimiento reducido.
 * https://animate-ui.com/docs/components/buttons/button
 */
export function MotionButton({children,hoverScale=1.035,tapScale=.975,...props}:HTMLMotionProps<'button'> & {hoverScale?:number;tapScale?:number}){
 const reduced=useReducedMotion();
 return <motion.button {...props}
  whileHover={reduced?undefined:{scale:hoverScale}}
  whileTap={reduced?undefined:{scale:tapScale}}
  transition={{duration:.16,ease:'easeOut'}}>{children}</motion.button>;
}
