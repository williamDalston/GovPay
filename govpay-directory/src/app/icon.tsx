import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0F1B2D",
          borderRadius: 6,
          color: "#3B82F6",
          fontSize: 14,
          fontWeight: 800,
          fontFamily: "sans-serif",
          letterSpacing: -0.5,
        }}
      >
        GP
      </div>
    ),
    { ...size }
  );
}
