import { useEffect, useRef } from "react";

/**
 * ShaderBackdrop — full-bleed WebGL2 fragment-shader canvas.
 * Iridescent, volumetric nebula with fBM noise, chromatic dispersion and
 * mouse-driven warping. Extremely cheap: one full-screen quad, no textures.
 * Pauses when not visible; halves DPR on mobile; respects reduced motion.
 */
export function ShaderBackdrop({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: true, premultipliedAlpha: true }) as WebGL2RenderingContext | null;
    if (!gl) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const dprCap = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);

    const vs = `#version 300 es
    in vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;

    const fs = `#version 300 es
    precision highp float;
    out vec4 o;
    uniform vec2 uR; uniform float uT; uniform vec2 uM;

    // hash + value noise + fbm
    float h(vec2 p){ return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5453); }
    float n(vec2 p){ vec2 i=floor(p),f=fract(p); vec2 u=f*f*(3.-2.*f);
      return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
    float fbm(vec2 p){ float s=0., a=.5; mat2 m=mat2(1.6,1.2,-1.2,1.6);
      for(int i=0;i<6;i++){ s+=a*n(p); p=m*p; a*=.5;} return s;}

    vec3 pal(float t){
      // iridescent indigo -> violet -> cyan -> gold sliver
      vec3 a=vec3(0.05,0.02,0.15);
      vec3 b=vec3(0.55,0.25,0.90);
      vec3 c=vec3(0.10,0.75,0.95);
      vec3 d=vec3(0.95,0.80,0.35);
      float x=fract(t);
      return mix(mix(a,b,smoothstep(.0,.35,x)),
                 mix(c,d,smoothstep(.7,1.,x)),
                 smoothstep(.35,.75,x));
    }

    void main(){
      vec2 uv=(gl_FragCoord.xy-.5*uR)/min(uR.x,uR.y);
      vec2 m=(uM-.5*uR)/min(uR.x,uR.y);
      // domain warping
      vec2 q = uv*1.2 + vec2(0., uT*0.02);
      q += 0.6*vec2(fbm(q+uT*0.05), fbm(q-uT*0.04));
      float f = fbm(q*1.4 + m*0.6);
      // volumetric glow towards center + mouse
      float d = length(uv - m*0.15);
      float glow = exp(-d*2.2) * (0.7 + 0.5*sin(uT*0.6));
      float band = smoothstep(.15,.9,f);
      vec3 col = pal(f*1.2 + uT*0.03);
      col = mix(col*0.35, col, band);
      // chromatic dispersion
      col.r *= 1.05 + 0.05*sin(uT*.7+uv.x*3.);
      col.b *= 1.05 + 0.05*cos(uT*.5+uv.y*3.);
      col += glow*vec3(0.35,0.45,0.9);
      // vignette
      col *= smoothstep(1.4,.2,length(uv));
      // dither to kill banding
      col += (h(gl_FragCoord.xy)-.5)/255.;
      o=vec4(col, band*0.55 + glow*0.35);
    }`;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); }
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uR = gl.getUniformLocation(prog, "uR");
    const uT = gl.getUniformLocation(prog, "uT");
    const uM = gl.getUniformLocation(prog, "uM");

    let mx = 0, my = 0;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = (e.clientX - r.left) * dprCap;
      my = (r.height - (e.clientY - r.top)) * dprCap;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(2, Math.floor(r.width * dprCap));
      canvas.height = Math.max(2, Math.floor(r.height * dprCap));
      gl.viewport(0, 0, canvas.width, canvas.height);
      mx = canvas.width / 2; my = canvas.height / 2;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0, visible = true, start = performance.now();
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.01 });
    io.observe(canvas);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const tick = () => {
      if (visible) {
        const t = (performance.now() - start) / 1000;
        gl.uniform2f(uR, canvas.width, canvas.height);
        gl.uniform1f(uT, reduced ? 0 : t);
        gl.uniform2f(uM, mx, my);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      window.removeEventListener("pointermove", onMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ mixBlendMode: "screen" }}
    />
  );
}
