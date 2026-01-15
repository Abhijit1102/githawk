"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const CODE_LINES = [
  "auth.verifySession();",
  "user.validateToken();",
  "workspace.initialize();",
];

export default function Loader() {
  const [lineIndex, setLineIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentLine = CODE_LINES[lineIndex];
    const speed = isDeleting ? 40 : 70;

    let pauseTimeout: NodeJS.Timeout | null = null;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentLine.slice(0, displayText.length + 1));

        // Pause briefly at end of line
        if (displayText.length + 1 === currentLine.length) {
          pauseTimeout = setTimeout(() => setIsDeleting(true), 800);
        }
      } else {
        setDisplayText(currentLine.slice(0, displayText.length - 1));

        if (displayText.length === 0) {
          setIsDeleting(false);
          setLineIndex((prev) => (prev + 1) % CODE_LINES.length);
        }
      }
    }, speed);

    // Cleanup both timeouts on unmount or dependency change
    return () => {
      clearTimeout(timeout);
      if (pauseTimeout) clearTimeout(pauseTimeout);
    };
  }, [displayText, isDeleting, lineIndex]);

  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-background text-foreground overflow-hidden">
      {/* Subtle terminal/grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--border))_1px,transparent_0)] bg-[size:24px_24px] opacity-[0.15]" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Central Icon */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          {/* Glow */}
          <div className="absolute inset-0 rounded-xl blur-xl bg-primary/30" />

          <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-card border border-border font-mono text-2xl text-primary shadow-sm">
            {"{ }"}
          </div>
        </motion.div>

        {/* Code typing */}
        <div className="flex items-center font-mono text-sm text-muted-foreground">
          <span className="text-primary">$</span>
          <span className="ml-2">{displayText}</span>

          {/* Cursor */}
          <motion.span
            className="ml-1 inline-block h-4 w-[2px] bg-primary"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>

        {/* Status text */}
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-xs text-muted-foreground tracking-wide"
        >
          Authenticating…
        </motion.div>
      </div>
    </div>
  );
}
