"use client";

export default function Loader({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <div className="flex items-center justify-center">
      <div className={`loader-spinner loader-${size}`} />
    </div>
  );
}
