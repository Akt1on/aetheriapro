import { useEffect, useRef } from "react";

/**
 * LiquidOrb — WebGL2 raymarched iridescent sphere with animated displacement.
 * Single full-screen quad inside a bounded container. No three.js.
 * Cinematic "liquid metal / soap bubble" look with rim light and internal glow.
 * Pauses off-screen; DPR-capped.
 */
export function LiquidOrb({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const gl = c.getContext("webgl2", { antialias: false, alpha: true, premultipliedAlpha: true }) as WebGL2RenderingContext | null;
    if (!gl) { c.style.display = "none"; return; }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const RAY_STEPS = isMobile ? 40 : 72;
    const FBM_OCT = isMobile ? 3 : 5;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5);

    const vs = `#version 300 es
    in vec2 p; void main(){ gl_Position=vec4(p,0.,1.); }`;

    const fs = `#version 300 es
    precision highp float;
    out vec4 o;
    uniform vec2 uR; uniform float uT; uniform vec2 uM;

    float h(vec3 p){ return fract(sin(dot(p,vec3(41.3,289.1,113.7)))*43758.5453); }
    float n3(vec3 p){ vec3 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
      float a=mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
                  mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);
      return a; }
    float fbm(vec3 p){ float s=0., a=.5; for(int i=0;i<5;i++){ s+=a*n3(p); p*=2.02; a*=.5;} return s; }

    float sdSphere(vec3 p, float r){ return length(p)-r; }
    float map(vec3 p){
      float d = sdSphere(p, 1.0);
      // organic displacement
      float disp = fbm(p*1.6 + vec3(uT*0.15));
      d += (disp-0.5)*0.25;
      return d;
    }
    vec3 nrm(vec3 p){ vec2 e=vec2(0.001,0.);
      return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
    }

    vec3 pal(float t){
      vec3 a=vec3(0.10,0.05,0.35);
      vec3 b=vec3(0.55,0.25,0.90);
      vec3 c=vec3(0.10,0.75,0.95);
      vec3 d=vec3(0.98,0.82,0.40);
      float x=fract(t);
      return mix(mix(a,b,smoothstep(.0,.35,x)), mix(c,d,smoothstep(.65,1.,x)), smoothstep(.3,.75,x));
    }

    void main(){
      vec2 uv=(gl_FragCoord.xy-.5*uR)/min(uR.x,uR.y);
      vec2 m=(uM-.5*uR)/min(uR.x,uR.y);
      vec3 ro=vec3(0.,0.,3.2);
      vec3 rd=normalize(vec3(uv, -1.7));
      // rotate scene
      float a=uT*0.25 + m.x*0.8;
      float b=0.2 + m.y*0.4;
      mat3 Rx=mat3(1.,0.,0., 0.,cos(b),-sin(b), 0.,sin(b),cos(b));
      mat3 Ry=mat3(cos(a),0.,sin(a), 0.,1.,0., -sin(a),0.,cos(a));
      ro=Ry*Rx*ro; rd=Ry*Rx*rd;

      float t=0., hit=0.; vec3 p;
      for(int i=0;i<72;i++){
        p=ro+rd*t;
        float d=map(p);
        if(d<0.001){ hit=1.; break; }
        if(t>6.) break;
        t+=d*0.85;
      }
      vec3 col=vec3(0.);
      float alpha=0.;
      if(hit>0.5){
        vec3 N=nrm(p);
        vec3 L=normalize(vec3(0.6,0.9,0.5));
        float diff=max(dot(N,L),0.);
        float fres=pow(1.-max(dot(-rd,N),0.), 3.);
        // iridescent view-dependent tint
        float k = dot(N,rd)*0.5+0.5 + uT*0.05;
        vec3 iri = pal(k);
        vec3 base = mix(vec3(0.05,0.03,0.15), iri, 0.85);
        col = base*(0.3+0.7*diff) + fres*iri*1.6;
        // inner subsurface glow
        col += pal(fbm(p*2.5+uT*0.2))*0.25;
        // specular
        vec3 H=normalize(L-rd);
        col += pow(max(dot(N,H),0.), 48.)*vec3(1.,0.95,0.9)*0.8;
        alpha = 1.;
      } else {
        // soft aura outside sphere
        float g = exp(-length(uv)*1.6);
        col = pal(uT*0.1)*g*0.35;
        alpha = g*0.4;
      }
      // subtle grain
      col += (h(vec3(gl_FragCoord.xy,uT))-.5)/180.;
      o=vec4(col, alpha);
    }`;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog); gl.useProgram(prog);

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
      const r = c.getBoundingClientRect();
      mx = (e.clientX - r.left) * dpr;
      my = (r.height - (e.clientY - r.top)) * dpr;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const resize = () => {
      const r = c.getBoundingClientRect();
      c.width = Math.max(2, Math.floor(r.width * dpr));
      c.height = Math.max(2, Math.floor(r.height * dpr));
      gl.viewport(0, 0, c.width, c.height);
      mx = c.width / 2; my = c.height / 2;
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    let raf = 0, visible = true, start = performance.now();
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.01 });
    io.observe(c);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const tick = () => {
      if (visible) {
        const t = (performance.now() - start) / 1000;
        gl.uniform2f(uR, c.width, c.height);
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

  return <canvas ref={ref} aria-hidden className={`h-full w-full ${className}`} />;
}
