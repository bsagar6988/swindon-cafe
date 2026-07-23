import React from "react";
import Svg, { Circle, Ellipse, Line, Path, Rect, Text as SvgText } from "react-native-svg";

export function Logo({ size = 96 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <Rect x={0} y={0} width={1024} height={1024} fill="none" />

      <Circle cx={512} cy={512} r={460} fill="none" stroke="#E85D2A" strokeWidth={14} />
      <Circle cx={512} cy={512} r={430} fill="none" stroke="#1F8A70" strokeWidth={6} />

      <Ellipse cx={512} cy={520} rx={170} ry={24} fill="none" stroke="#1F8A70" strokeWidth={10} />
      <Path
        d="M 382 340 L 642 340 L 607 494 Q 606 500 600 500 L 424 500 Q 418 500 417 494 Z"
        fill="#1F8A70"
      />
      <Path
        d="M 632 366 C 696 366 696 456 632 452"
        fill="none"
        stroke="#1F8A70"
        strokeWidth={16}
        strokeLinecap="round"
      />
      <Ellipse cx={512} cy={340} rx={130} ry={18} fill="#FBF6EF" stroke="#1F8A70" strokeWidth={6} />

      <Path d="M 462 300 C 448 272 474 258 460 228" fill="none" stroke="#E85D2A" strokeWidth={9} strokeLinecap="round" />
      <Path d="M 512 300 C 498 268 524 254 510 220" fill="none" stroke="#E85D2A" strokeWidth={9} strokeLinecap="round" />
      <Path d="M 562 300 C 548 272 574 258 560 228" fill="none" stroke="#E85D2A" strokeWidth={9} strokeLinecap="round" />

      <SvgText
        x={512}
        y={650}
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize={76}
        letterSpacing={8}
        fill="#1A1A1A"
      >
        SWINDON
      </SvgText>

      <Line x1={392} y1={685} x2={477} y2={685} stroke="#E85D2A" strokeWidth={3} />
      <Line x1={547} y1={685} x2={632} y2={685} stroke="#E85D2A" strokeWidth={3} />
      <Rect x={502} y={675} width={20} height={20} fill="#E85D2A" transform="rotate(45 512 685)" />

      <SvgText
        x={512}
        y={762}
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize={64}
        letterSpacing={14}
        fill="#1F8A70"
      >
        CAFÉ
      </SvgText>

      <Circle cx={252} cy={754} r={5} fill="#E85D2A" />
      <Circle cx={772} cy={754} r={5} fill="#E85D2A" />
    </Svg>
  );
}
