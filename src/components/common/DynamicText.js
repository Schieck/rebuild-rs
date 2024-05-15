import React from "react";
import { Typography } from "@mui/material";
import useResponsiveText from "../../utils/useResponsiveText";

const Character = ({ children, fontSize }) => (
  <span style={{ fontSize }}>{children}</span>
);

const ResponsiveText = ({ text, maxFontSize, minFontSize }) => {
  const { containerRef, lines } = useResponsiveText({
    text,
    maxFontSize,
    minFontSize,
  });

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

export default ResponsiveText;
