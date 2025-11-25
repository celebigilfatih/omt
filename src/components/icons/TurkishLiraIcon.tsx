import React from "react";

interface TurkishLiraIconProps {
  className?: string;
}

export const TurkishLiraIcon: React.FC<TurkishLiraIconProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Vertical line */}
      <path d="M7 4v13c0 2 1.5 3 3.5 3s3.5-1 3.5-3" />
      {/* Top horizontal line */}
      <path d="M4 9h10" />
      {/* Bottom horizontal line */}
      <path d="M4 13h10" />
    </svg>
  );
};
