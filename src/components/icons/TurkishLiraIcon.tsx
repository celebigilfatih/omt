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
      <path d="M8 5v14" />
      <path d="M6 9h8" />
      <path d="M6 13h8" />
      <path d="M13 16c1.5 0 3-1 3-3s-1.5-3-3-3" />
    </svg>
  );
};
