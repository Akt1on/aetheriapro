import { useEffect, useRef } from "react";

/**
 * Магнитный кастомный курсор:
 *  - две точки: маленькое ядро (точное) + большой мягкий круг (с лагом).
 *  - "втягивается" в элементы с [data-cursor="hover"] или a, button, [role=button], input, textarea, label.
 *  - на touch-устройствах не монтируется.
 *  - уважает prefers-reduced-motion (без лерпа, просто follow).
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // hide on touch
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dot = dotRef.current!;
    const ring = ringRef.current!;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let scale = 1;
    let targetScale = 1;
    let visible = false;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
      // instant dot
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      if (reduced) {
        ring.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%) scale(${targetScale})`;
      }
    };

    const onLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const isHoverable = (el: Element | null): boolean => {
      if (!el) return false;
      return !!el.closest('a, button, [role="button"], input, textarea, label, [data-cursor="hover"]');
    };

    const onOver = (e: PointerEvent) => {
      targetScale = isHoverable(e.target as Element) ? 2.4 : 1;
    };

    const onDown = () => { targetScale = 0.75; };
    const onUp = (e: PointerEvent) => { targetScale = isHoverable(e.target as Element) ? 2.4 : 1; };

    const tick = () => {
      if (!reduced) {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        scale += (targetScale - scale) * 0.18;
        ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale})`;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    // hide native cursor
    document.documentElement.classList.add("has-custom-cursor");

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-9 w-9 rounded-full opacity-0 mix-blend-difference"
        style={{
          border: "1px solid rgba(255,255,255,0.85)",
          transition: "opacity 200ms ease",
          willChange: "transform, opacity",
        }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 rounded-full bg-white opacity-0 mix-blend-difference"
        style={{
          transition: "opacity 200ms ease",
          willChange: "transform, opacity",
        }}
      />
    </>
  );
}
