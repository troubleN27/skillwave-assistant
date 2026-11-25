import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

export const alt = "Skillwave Academy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#4F46E5",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <svg width="96" height="96" viewBox="0 0 32 32">
          <path
            d="M6 20c3.2 0 3.2-6 6.4-6s3.2 6 6.4 6 3.2-9 6.4-9"
            fill="none"
            stroke="#fff"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <circle cx="25.2" cy="11" r="2.4" fill="#06B6D4" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2 }}>Skillwave Academy</div>
          <div style={{ fontSize: 34, opacity: 0.85, maxWidth: 900 }}>{t("description")}</div>
        </div>
      </div>
    ),
    size,
  );
}
