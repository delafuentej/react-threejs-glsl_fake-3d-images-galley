import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import materialVertexShader from "../shaders/material/vertex.glsl";
import materialFragmentShader from "../shaders/material/fragment.glsl";

export function useFake3DPlane(
  mapImage,
  depthImage,
  params = { xDepth: 7, yDepth: 7 }
) {
  const canvasRef = useRef(null);
  const shaderMaterialRef = useRef(null);
  const rendererRef = useRef(null);
  const planeRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!mapImage || !depthImage || !canvasRef.current) return;

    let mounted = true;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current = renderer;

    const cursor = { x: 0, y: 0, lerpX: 0, lerpY: 0 };

    // Cargar texturas de manera segura
    const loader = new THREE.TextureLoader();
    const loadTexture = (url) =>
      new Promise((resolve, reject) => {
        loader.load(
          url,
          (tex) => {
            if (tex.image) resolve(tex);
            else reject("Textura no cargada correctamente");
          },
          undefined,
          reject
        );
      });

    let material, geometry;

    loadTexture(mapImage)
      .then((mapTex) =>
        loadTexture(depthImage).then((depthTex) => [mapTex, depthTex])
      )
      .then(([mapTex, depthTex]) => {
        if (!mounted) return;

        // Verificar que la textura tenga dimensiones
        if (!mapTex.image || !mapTex.image.width || !mapTex.image.height) {
          console.warn("Textura inválida:", mapImage);
          return;
        }

        // Crear shader material
        material = new THREE.ShaderMaterial({
          uniforms: {
            originalTexture: { value: mapTex },
            depthTexture: { value: depthTex },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uDepth: { value: new THREE.Vector2(params.xDepth, params.yDepth) },
          },
          vertexShader: materialVertexShader,
          fragmentShader: materialFragmentShader,
          transparent: true,
        });
        shaderMaterialRef.current = material;

        // Geometría responsiva

        const aspectTexture = mapTex.image.width / mapTex.image.height;
        const aspectViewport = window.innerWidth / window.innerHeight;
        let width, height;
        if (aspectViewport > aspectTexture) {
          width = camera.position.z * aspectViewport;
          height = width / aspectTexture;
        } else {
          height = camera.position.z;
          width = height * aspectTexture;
        }
        geometry = new THREE.PlaneGeometry(width, height, 1, 1);

        const plane = new THREE.Mesh(geometry, material);
        planeRef.current = plane;
        scene.add(plane);

        setIsReady(true);
      })
      .catch((err) => console.error("Error cargando texturas:", err));

    // Manejo del mouse
    const handleMouse = (e) => {
      cursor.x = e.clientX / window.innerWidth - 0.5;
      cursor.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", handleMouse);

    // Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Loop de render
    const animate = () => {
      if (!mounted) return;

      // Lerp manual para suavizar cursor
      cursor.lerpX += (cursor.x - cursor.lerpX) * 0.1;
      cursor.lerpY += (cursor.y - cursor.lerpY) * 0.1;

      if (planeRef.current) {
        planeRef.current.material.uniforms.uMouse.value.set(
          cursor.lerpX,
          cursor.lerpY
        );
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Cleanup correcto
    return () => {
      mounted = false;
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("resize", handleResize);
      if (renderer) renderer.dispose();
      if (material) material.dispose();
      if (geometry) geometry.dispose();
    };
  }, [mapImage, depthImage, params.xDepth, params.yDepth]);

  return { canvasRef, isReady };
}
