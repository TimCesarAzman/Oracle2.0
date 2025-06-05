import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function StarBackground() {
  const particlesInit = useCallback(async engine => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: 0 },
        background: { color: { value: "#321354" } },
        fpsLimit: 60,
        particles: {
          number: { value: 100, density: { enable: true, area: 900 } },
          color: {
            value: [
              "#fff6e7", // warm white
              "#ffe680", // soft gold
              "#ffd700", // yellow gold
              "#faf2c3", // cream
              "#dbb24a"  // deep gold
            ]
          },
          shape: {
            type: ["circle", "star"], // gold dots & sparkles!
          },
          opacity: {
            value: 1,
            random: { enable: true, minimumValue: 0.5 }
          },
          size: {
            value: { min: 0.8, max: 2.5 },
            random: true,
            anim: { enable: true, speed: 0.6, size_min: 0.5, sync: false }
          },
          move: {
            enable: true,
            speed: 0.08,
            direction: "none",
            random: true,
            straight: false,
            outModes: { default: "out" }
          },
          shadow: {
            enable: true,
            color: "#fff8e1",
            blur: 3
          },
          links: {
            enable: true,
            distance: 130, // how close before a line is drawn
            color: "#ffe680", // soft gold
            opacity: 0.18,   // faint
            width: 1,
            triangles: {
              enable: false
            }
          },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: "grab" },
            resize: true
          },
          modes: {
            grab: { distance: 120, line_linked: { opacity: 0.38 } }
          }
        },
        detectRetina: true,
      }}
    />
  );
}
