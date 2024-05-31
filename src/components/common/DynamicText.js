import React, { useRef, useState, useEffect } from "react";
import { Typography } from "@mui/material";

const Character = ({ children, fontSize }) => (
  <span style={{ fontSize }}>{children}</span>
);

const DynamicText = ({ maxFontSize, minFontSize, hiddenRef }) => {
  const containerRef = useRef(null);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const calculateLines = () => {
      if (!hiddenRef.current || !containerRef.current) return;

      const text = hiddenRef.current.innerHTML;

      const containerWidth = containerRef.current.offsetWidth;
      const words = text.split(" ");
      let currentLine = "";
      let testLine;
      const newLines = [];

      const tempDiv = document.createElement("div");
      tempDiv.style.visibility = "hidden";
      tempDiv.style.position = "absolute";
      tempDiv.style.whiteSpace = "pre";
      tempDiv.style.width = `${containerWidth}px`;
      tempDiv.style.font = window.getComputedStyle(hiddenRef.current).font;
      document.body.appendChild(tempDiv);

      words.forEach((word) => {
        testLine = currentLine ? `${currentLine} ${word}` : word;
        tempDiv.textContent = testLine;

        if (tempDiv.scrollWidth > containerWidth) {
          newLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });

      newLines.push(currentLine);
      document.body.removeChild(tempDiv);

      setLines(newLines);
    };

    calculateLines();
    window.addEventListener("resize", calculateLines);

    return () => {
      window.removeEventListener("resize", calculateLines);
    };
  }, [hiddenRef]);

  const styleLines = (lines) => {
    return lines.map((line, index) => {
      const chars = line.split("");
      const step = (maxFontSize - minFontSize) / Math.max(chars.length - 1, 1);
      return (
        <Typography key={index} component="div">
          {chars.map((char, charIndex) => {
            const fontSize =
              index % 2 === 0
                ? maxFontSize - step * charIndex
                : minFontSize + step * charIndex;
            return (
              <Character
                key={`${index}-${charIndex}`}
                fontSize={`${fontSize}px`}
              >
                {char}
              </Character>
            );
          })}
        </Typography>
      );
    });
  };

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      {styleLines(lines)}
    </div>
  );
};

export default DynamicText;
