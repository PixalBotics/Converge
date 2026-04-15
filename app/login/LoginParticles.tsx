"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import type { ISourceOptions } from "@tsparticles/engine";

const loginTwinkleOptions: ISourceOptions = {
  background: {
    color: { value: "transparent" },
  },
  fpsLimit: 60,
  fullScreen: { enable: false },
  interactivity: {
    detectsOn: "window",
    events: {
      onHover: { enable: true, mode: "grab" },
      onClick: { enable: false },
      resize: { enable: true, delay: 0 },
    },
    modes: {
      grab: {
        distance: 180,
        links: { opacity: 0.55 },
      },
    },
  },
  particles: {
    color: { value: "#ffffff" },
    links: {
      blink: false,
      color: "#ffffff",
      consent: false,
      distance: 130,
      enable: true,
      frequency: 1,
      opacity: 0.35,
      width: 1,
    },
    move: {
      direction: "none",
      enable: true,
      outModes: { default: "out" },
      random: true,
      speed: 0.45,
      straight: false,
    },
    number: {
      value: 120,
      density: {
        enable: true,
        width: 1000,
        height: 1000,
      },
    },
    opacity: {
      value: { min: 0.12, max: 0.5 },
    },
    shape: { type: "circle" },
    size: {
      value: { min: 1, max: 3 },
    },
    twinkle: {
      particles: {
        enable: true,
        frequency: 0.05,
        opacity: 1,
        color: { value: "#ffffff" },
      },
      lines: {
        enable: true,
        frequency: 0.05,
        opacity: 1,
      },
    },
  },
  detectRetina: true,
};

export function LoginParticles() {
  const [ready, setReady] = useState(false);
  const options = useMemo(() => loginTwinkleOptions, []);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        "& > div": {
          width: "100%",
          height: "100%",
        },
      }}
    >
      <Particles id="login-tsparticles" options={options} />
    </Box>
  );
}
