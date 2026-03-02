import React from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import "./Background3D.css";

const Background3D = ({ mousePosition }) => {
  const location = useLocation();
  const path = location.pathname;

  const mX = mousePosition?.x || 0;
  const mY = mousePosition?.y || 0;

  // Determine scene type based on path
  const getSceneType = () => {
    if (path === "/") return null;
    if (path.includes("login") || path.includes("register")) return "nebula";
    if (path.includes("dashboard")) return "particles";
    if (path.includes("events") || path.includes("organizer")) return "lines";
    return "default";
  };

  const sceneType = getSceneType();

  return (
    <div className="background-3d-container">
      {sceneType === "grid" && (
        <div className="scene-grid">
          <motion.div
            className="grid-plane"
            animate={{
              rotateX: 60 + mY * 10,
              rotateY: mX * 10,
              y: mY * 20,
            }}
          ></motion.div>
          <div className="grid-overlay"></div>
        </div>
      )}

      {sceneType === "nebula" && (
        <div className="scene-nebula">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className={`nebula-orb orb-${i + 1}`}
              animate={{
                x: [0, (i + 1) * 20 * mX, 0],
                y: [0, (i + 1) * 20 * mY, 0],
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {sceneType === "particles" && (
        <div className="scene-particles">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: `calc(${Math.random() * 100}vw + ${mX * 50}px)`,
                y: [null, -1000],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 10 + Math.random() * 20,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 10,
              }}
            />
          ))}
        </div>
      )}

      {sceneType === "lines" && (
        <div className="scene-lines">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="geometric-line"
              style={{
                top: `${i * 15}%`,
                left: "-20%",
                width: "140%",
                transform: `rotate(${i * 5}deg)`,
              }}
              animate={{
                x: [mX * -20, mX * 20],
                y: [mY * -10, mY * 10],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 5 + i,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {sceneType === "default" && (
        <div className="scene-default">
          <div className="vignette"></div>
        </div>
      )}

      <div className="global-noise"></div>
    </div>
  );
};

export default Background3D;
