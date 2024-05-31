import { useState, useEffect, useRef } from "react";
import ResizeObserver from "resize-observer-polyfill";

const useResponsiveText = ({ maxFontSize, minFontSize }) => {
  const containerRef = useRef(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useEffect(() => {
    const adjustFontSize = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      const textElement = container.querySelector(".responsive-text");

      if (textElement) {
        let newFontSize = maxFontSize;
        textElement.style.fontSize = `${newFontSize}px`;

        while (
          newFontSize > minFontSize &&
          (textElement.scrollWidth > width || textElement.scrollHeight > height)
        ) {
          newFontSize -= 1;
          textElement.style.fontSize = `${newFontSize}px`;
        }
        setFontSize(newFontSize);
      }
    };

    const resizeObserver = new ResizeObserver(adjustFontSize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    adjustFontSize();
    window.addEventListener("resize", adjustFontSize);

    return () => {
      if (containerRef.current) resizeObserver.unobserve(containerRef.current);
      window.removeEventListener("resize", adjustFontSize);
    };
  }, [maxFontSize, minFontSize]);

  return { containerRef, fontSize };
};

export default useResponsiveText;
