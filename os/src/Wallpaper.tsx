import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Live black hole: one full-screen shader quad, rendered at 1/PIXEL resolution and scaled up with
// image-rendering: pixelated, then posterized with a Bayer dither so it reads as 90s pixel art.
const PIXEL = 4;

const frag = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform vec2 uCenter;

float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash2(i), hash2(i + vec2(1, 0)), f.x), mix(hash2(i + vec2(0, 1)), hash2(i + vec2(1, 1)), f.x), f.y);
}
// 4x4 ordered dither threshold, computed bitwise-free so it runs on GLSL ES 1.0
float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }

vec3 sky(vec3 d) {
  vec2 uv = vec2(atan(d.z, d.x), asin(clamp(d.y, -1.0, 1.0)));
  vec3 c = vec3(0.02, 0.012, 0.04);
  float n = noise(uv * 2.5 + 3.0) * noise(uv * 5.0 - 1.7);           // faint plum nebula
  c += vec3(0.23, 0.12, 0.33) * smoothstep(0.15, 0.55, n) * 0.5;
  // stars: grid on the faces of a cube around the camera, so cells stay square dots everywhere
  vec3 a = abs(d);
  vec2 f; float face;
  if (a.x > a.y && a.x > a.z) { f = d.yz / a.x; face = sign(d.x); }
  else if (a.y > a.z) { f = d.xz / a.y; face = 2.0 + sign(d.y); }
  else { f = d.xy / a.z; face = 4.0 + sign(d.z); }
  float h = hash2(floor(f * 160.0) + face * 97.0);
  if (h > 0.985) c += vec3(1.0, 0.92, 0.8) * (0.35 + (h - 0.985) * 40.0);
  float h2 = hash2(floor(f * 80.0) + face * 53.0 + 0.5);
  if (h2 > 0.994) c += vec3(0.75, 0.85, 1.0) * 1.1;
  return c;
}

void main() {
  vec2 p = (gl_FragCoord.xy / uRes) * 2.0 - 1.0;
  p.x *= uRes.x / uRes.y;
  vec2 q = p - uCenter;

  vec3 ro = vec3(uMouse.x * 1.2, 2.2 + uMouse.y * 0.7, -18.0);
  vec3 fw = normalize(-ro);
  vec3 rt = normalize(cross(vec3(0, 1, 0), fw));
  vec3 up = cross(fw, rt);
  vec3 dir = normalize(fw * 1.8 + q.x * rt + q.y * up);
  vec3 pos = ro;

  vec3 col = vec3(0.0);
  float alpha = 0.0;
  float minR = 100.0;
  bool hit = false;

  for (int i = 0; i < 140; i++) {
    float r = length(pos);
    minR = min(minR, r);
    if (r < 1.0) { hit = true; break; }
    if (r > 40.0) break;
    float dt = clamp(0.06 * r, 0.03, 0.6);
    dir = normalize(dir - pos * (1.4 / (r * r * r)) * dt);           // light bends toward the mass
    vec3 np = pos + dir * dt;
    if (pos.y * np.y < 0.0) {                                         // ray crosses the disk plane
      vec3 hp = mix(pos, np, pos.y / (pos.y - np.y));
      float hr = length(hp.xz);
      if (hr > 1.5 && hr < 5.8) {
        float ang = atan(hp.z, hp.x);
        float swirl = noise(vec2(ang * 4.0 + uTime * 0.5 - hr * 2.2, hr * 3.0));
        float t = 1.0 - smoothstep(1.5, 5.8, hr);
        vec3 dc = mix(vec3(0.35, 0.12, 0.30), vec3(0.95, 0.45, 0.12), smoothstep(0.0, 0.5, t));
        dc = mix(dc, vec3(0.95, 0.69, 0.2), smoothstep(0.45, 0.8, t));
        dc = mix(dc, vec3(1.0, 0.95, 0.85), smoothstep(0.8, 1.0, t));
        float dop = 1.0 + 0.55 * sin(ang + 1.2);                      // one side of the spin looks brighter
        float a = (0.35 + 0.65 * swirl) * smoothstep(1.5, 1.9, hr) * (1.0 - smoothstep(4.6, 5.8, hr));
        col += (1.0 - alpha) * dc * a * dop * 1.3;
        alpha += (1.0 - alpha) * a;
      }
    }
    pos = np;
  }

  if (!hit) {
    col += (1.0 - alpha) * sky(dir);
    col += (1.0 - alpha) * vec3(1.0, 0.62, 0.3) * 0.5 * exp(-6.0 * (minR - 1.0));   // photon ring
  }

  float lv = 7.0;                                                     // posterize: chunky colour steps
  col = floor(col * lv + bayer(gl_FragCoord.xy)) / lv;
  gl_FragColor = vec4(col, 1.0);
}`;

export default function Wallpaper() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'low-power' }); }
    catch { return; } // no WebGL: the CSS background colour stays

    renderer.setPixelRatio(1);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uTime: { value: 0 }, uRes: { value: new THREE.Vector2() },
      uMouse: { value: new THREE.Vector2() }, uCenter: { value: new THREE.Vector2() },
    };
    const mat = new THREE.ShaderMaterial({ fragmentShader: frag, vertexShader: 'void main(){gl_Position=vec4(position.xy,0.,1.);}', uniforms });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    scene.add(quad);

    const resize = () => {
      const w = Math.ceil(canvas.clientWidth / PIXEL), h = Math.ceil(canvas.clientHeight / PIXEL);
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(w, h);
      // wide screens: hole sits right of centre, behind the stickers; phones: centred
      uniforms.uCenter.value.set(w > h ? 0.12 * (w / h) : 0, 0.0);
    };
    resize();
    addEventListener('resize', resize);

    const target = new THREE.Vector2();
    const onMove = (e: PointerEvent) => target.set(e.clientX / innerWidth - 0.5, 0.5 - e.clientY / innerHeight);
    addEventListener('pointermove', onMove);

    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, last = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - last < 33) return; // ~30 fps is plenty for pixel art
      last = now;
      uniforms.uTime.value = (now - t0) / 1000;
      uniforms.uMouse.value.lerp(target, 0.05);
      renderer.render(scene, camera);
    };
    const onVis = () => { cancelAnimationFrame(raf); if (!document.hidden && !still) raf = requestAnimationFrame(frame); };
    if (still) renderer.render(scene, camera); else raf = requestAnimationFrame(frame);
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', resize);
      removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      mat.dispose(); quad.geometry.dispose(); renderer.dispose();
    };
  }, []);

  return <canvas ref={ref} className="wallpaper" aria-hidden="true" />;
}
