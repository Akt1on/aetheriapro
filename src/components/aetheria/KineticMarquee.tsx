import { motion, useScroll, useSpring, useTransform, useVelocity, useMotionValue, useAnimationFrame } from "framer-motion";
import { useRef } from "react";

/**
 * Kinetic marquee — infinite tape whose speed reacts to scroll velocity.
 * Faster/reverse when scrolling fast. Awwwards-style tape.
 */
export function KineticMarquee({
  items,
  baseVelocity = 40,
  className = "",
}: {
  items: string[];
  baseVelocity?: number;
  className?: string;
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });

  const directionFactor = useRef(1);
  const x = useTransform(baseX, (v) => `${wrap(-25, -75, v)}%`);

  useAnimationFrame((_, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    const vf = velocityFactor.get();
    if (vf < 0) directionFactor.current = -1;
    else if (vf > 0) directionFactor.current = 1;
    moveBy += directionFactor.current * moveBy * vf;
    baseX.set(baseX.get() + moveBy);
  });

  const content = (
    <>
      {items.map((t, i) => (
        <span key={i} className="mx-8 inline-flex items-center gap-8">
          <span>{t}</span>
          <span className="inline-block h-2 w-2 rounded-full bg-cyan/70" />
        </span>
      ))}
    </>
  );

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <motion.div style={{ x }} className="flex whitespace-nowrap font-display text-[14vw] leading-none tracking-tight text-white/[0.06] sm:text-[10vw]">
        <span className="flex shrink-0">{content}</span>
        <span className="flex shrink-0">{content}</span>
        <span className="flex shrink-0">{content}</span>
        <span className="flex shrink-0">{content}</span>
      </motion.div>
    </div>
  );
}

function wrap(min: number, max: number, v: number) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}
