import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0F1B2D",
          borderRadius: 36,
          color: "#3B82F6",
          fontSize: 72,
          fontWeight: 800,
          fontFamily: "sans-serif",
          letterSpacing: -2,
        }}
      >
        GP
      </div>
    ),
    { ...size }
  );
}
