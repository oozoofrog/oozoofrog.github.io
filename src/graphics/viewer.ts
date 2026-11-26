import * as T from "three";
import { lunarSky, lunarGround } from "./paint";
import { loadAstronaut } from "./frog";
import { makeStudy, type Study } from "./studies";

// One GPU context serves the exhibit and all visible catalogue plates.
export function mountGallery() {
  const plates =
    document.querySelectorAll<HTMLCanvasElement>("canvas[data-study]");
  if (!plates.length) return;
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFShadowMap;
  const templates = new Map<Study, T.Group>();
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  for (const canvas of plates) {
    const context = canvas.getContext("2d");
    if (!context) continue;
    const ctx = context;
    const hero = canvas.dataset.study === "pond";
    const scene = new T.Scene();
    const camera = new T.OrthographicCamera(-2, 2, 2, -2, 0.1, 50);
    if (hero)
      camera.position.set(0, 1.06 + 6 * Math.sin(0.39), 6 * Math.cos(0.39));
    else camera.position.set(3, 2.1, 4);
    const target = new T.Vector3(0, hero ? 1.06 : 0, 0);
    camera.lookAt(target);
    scene.add(new T.HemisphereLight(0xfff4db, 0x94aca0, 1.3));
    const key = new T.DirectionalLight(0xffebc9, 2.0);
    key.position.set(-3, 6, 4);
    key.castShadow = hero;
    if (hero) {
      key.shadow.mapSize.set(1024, 1024);
      Object.assign(key.shadow.camera, {
        left: -2.3,
        right: 2.3,
        top: 2.3,
        bottom: -2.3,
        near: 0.1,
        far: 15,
      });
      key.shadow.normalBias = 0.004;
      key.shadow.bias = -0.0003;
    }
    scene.add(key);
    const rim = new T.DirectionalLight(0xd5f4ec, 1.85);
    rim.position.set(3, 3, -4);
    scene.add(rim);
    const pivot = new T.Group();
    scene.add(pivot);
    let model: T.Group | undefined;
    let angle = 0,
      visible = false,
      running = false,
      frame = 0,
      lastFrame = 0;
    let width = 0,
      height = 0;
    function draw() {
      if (!visible || !width || !height) return;
      if (!model) {
        if (hero) return;
        const kind = canvas.dataset.study as Study;
        if (!templates.has(kind)) templates.set(kind, makeStudy(kind));
        model = templates.get(kind)!.clone();
      }
      if (!model.parent) pivot.add(model);
      pivot.rotation.y = angle;
      const extent = hero
        ? Math.max(1.72, (1.72 * height) / width)
        : Math.max(1.45, (1.65 * height) / width);
      camera.left = (-extent * width) / height;
      camera.right = -camera.left;
      camera.top = extent;
      camera.bottom = -extent;
      camera.updateProjectionMatrix();
      const size = renderer.getSize(new T.Vector2());
      if (size.x !== width || size.y !== height)
        renderer.setSize(width, height, false);
      renderer.render(scene, camera);
      const bitmap = renderer.domElement;
      if (canvas.width !== bitmap.width || canvas.height !== bitmap.height) {
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0);
    }
    function animate(now: number) {
      frame = 0;
      if (!running || !visible || document.hidden) return;
      if (now - lastFrame >= 32) {
        angle += Math.min(now - lastFrame, 60) * 0.00031;
        lastFrame = now;
        draw();
      }
      frame = requestAnimationFrame(animate);
    }
    function schedule() {
      cancelAnimationFrame(frame);
      if (running && visible && !document.hidden) {
        lastFrame = performance.now();
        frame = requestAnimationFrame(animate);
      }
    }
    new ResizeObserver(([entry]) => {
      width = Math.round(entry.contentRect.width);
      height = Math.round(entry.contentRect.height);
      draw();
    }).observe(canvas);
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      draw();
      schedule();
    }).observe(canvas);
    document.addEventListener("visibilitychange", schedule);
    if (hero) {
      const plate = canvas.closest<HTMLElement>("[data-exhibit]")!;
      const rotation = plate.querySelector<HTMLButtonElement>("[data-turn]")!;
      const mesh = plate.querySelector<HTMLButtonElement>("[data-mesh]")!;
      const controls = plate.querySelector<HTMLElement>("[data-controls]")!;
      const retry = plate.querySelector<HTMLButtonElement>("[data-retry]")!;
      const load = async () => {
        retry.hidden = true;
        try {
          model = await loadAstronaut();
          pivot.position.set(-0.26, -0.08, 0);
          scene.add(lunarGround(), lunarSky(camera, target));
          controls.hidden = false;
          draw();
        } catch {
          retry.hidden = false;
        }
      };
      retry.addEventListener("click", load);
      void load();
      for (const view of plate.querySelectorAll<HTMLButtonElement>(
        "[data-angle]",
      )) {
        view.addEventListener("click", () => {
          angle = T.MathUtils.degToRad(Number(view.dataset.angle));
          running = false;
          rotation.setAttribute("aria-pressed", "false");
          schedule();
          draw();
        });
      }
      rotation.addEventListener("click", () => {
        running = !running;
        rotation.setAttribute("aria-pressed", String(running));
        schedule();
      });
      mesh.addEventListener("click", () => {
        const wire = mesh.getAttribute("aria-pressed") !== "true";
        mesh.setAttribute("aria-pressed", String(wire));
        model?.traverse((o) => {
          if (
            o instanceof T.Mesh &&
            (o.material.side === T.BackSide || o.userData.glass)
          )
            o.visible = !wire;
          if (
            o instanceof T.Mesh &&
            (o.material instanceof T.MeshStandardMaterial ||
              o.material instanceof T.MeshBasicMaterial)
          )
            o.material.wireframe = wire;
        });
        draw();
      });
      let lastX: number | undefined;
      canvas.addEventListener("pointerdown", (event) => {
        lastX = event.clientX;
        canvas.setPointerCapture(event.pointerId);
      });
      canvas.addEventListener("pointermove", (event) => {
        if (lastX === undefined) return;
        angle += (event.clientX - lastX) * 0.012;
        lastX = event.clientX;
        draw();
      });
      canvas.addEventListener("lostpointercapture", () => {
        lastX = undefined;
      });
    } else {
      const card = canvas.closest("a,.project-card") ?? canvas;
      const start = () => {
        running = !reduced.matches;
        schedule();
      };
      const stop = () => {
        running = false;
        schedule();
      };
      card.addEventListener("pointerenter", start);
      card.addEventListener("pointerleave", stop);
      card.addEventListener("focusin", start);
      card.addEventListener("focusout", stop);
    }
  }
}
