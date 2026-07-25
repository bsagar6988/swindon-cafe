import React from "react";
import Svg, { Circle, Text as SvgText } from "react-native-svg";

const CX = 512;
const CY = 512;

interface ArcChar {
  char: string;
  x: number;
  y: number;
  rotate: number;
}

// Places each character of `text` along a circular arc of the given radius,
// between angleStart and angleEnd (degrees, 0 = 12 o'clock, clockwise
// positive). react-native-svg's TextPath support is unreliable across
// platforms, so arced text is laid out character-by-character instead.
function arcChars(text: string, radius: number, angleStart: number, angleEnd: number): ArcChar[] {
  const chars = text.split("");
  const n = chars.length;
  return chars.map((char, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const angle = angleStart + (angleEnd - angleStart) * t;
    const rad = (angle * Math.PI) / 180;
    return {
      char,
      x: CX + radius * Math.sin(rad),
      y: CY - radius * Math.cos(rad),
      rotate: angle,
    };
  });
}

function ArcText({
  text,
  radius,
  angleStart,
  angleEnd,
  fontSize,
  flip,
}: {
  text: string;
  radius: number;
  angleStart: number;
  angleEnd: number;
  fontSize: number;
  flip: boolean;
}) {
  const items = arcChars(text, radius, angleStart, angleEnd);
  return (
    <>
      {items.map((item, i) => (
        <SvgText
          key={i}
          x={item.x}
          y={item.y}
          rotation={flip ? item.rotate + 180 : item.rotate}
          origin={`${item.x}, ${item.y}`}
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight="900"
          fontSize={fontSize}
          fill="#141414"
        >
          {item.char}
        </SvgText>
      ))}
    </>
  );
}

const BADGE_TEXT = "• TASTE OF THE TOWN •";

export function Logo({ size = 96 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <Circle cx={CX} cy={CY} r={505} fill="#F5C518" />

      <ArcText text={BADGE_TEXT} radius={400} angleStart={-62} angleEnd={62} fontSize={40} flip={false} />
      <ArcText text={BADGE_TEXT} radius={400} angleStart={242} angleEnd={118} fontSize={40} flip={true} />

      <SvgText
        x={512}
        y={565}
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontSize={128}
        letterSpacing={2}
        fill="#141414"
      >
        SWINDON
      </SvgText>
      <SvgText
        x={512}
        y={760}
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontSize={220}
        letterSpacing={4}
        fill="#141414"
      >
        EATS
      </SvgText>
    </Svg>
  );
}
