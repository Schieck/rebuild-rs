import { useState, useEffect, useRef } from "react";
import ResizeObserver from "resize-observer-polyfill";

const useResponsiveText = ({ text, maxFontSize, minFontSize }) => {
  const containerRef = useRef(null);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const adjustText = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const words = text.split(" ");
      let currentLine = "";
      const newLines = [];
      const tempDiv = document.createElement("div");
      tempDiv.style.visibility = "hidden";
      tempDiv.style.height = "0";
      tempDiv.style.whiteSpace = "pre";
      tempDiv.style.fontSize = `${(maxFontSize + minFontSize) / 1.85}px`;
      tempDiv.style.width = `${containerWidth}px`;
      document.body.appendChild(tempDiv);

      words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        tempDiv.textContent = testLine;

        if (tempDiv.scrollWidth > containerWidth) {
          newLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });

      if (currentLine) newLines.push(currentLine);
      document.body.removeChild(tempDiv);

      setLines(newLines);
    };

    adjustText();
    const resizeObserver = new ResizeObserver(adjustText);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [text]);

  return { containerRef, lines };
};

export default useResponsiveText;
