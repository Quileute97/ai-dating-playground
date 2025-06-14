
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidePanelToggleProps {
  isOpen: boolean;
  side: "left" | "right";
  onToggle: (open: boolean) => void;
  className?: string;
}

export default function SidePanelToggle({
  isOpen,
  side,
  onToggle,
  className = "",
}: SidePanelToggleProps) {
  if (isOpen) {
    return (
      <button
        className={
          "absolute z-30 bg-white border border-gray-200 rounded-full shadow hover:bg-purple-50 hover:scale-105 p-1 transition " +
          className +
          (side === "left"
            ? " right-[-12px] top-1/2 -translate-y-1/2"
            : " left-[-12px] top-1/2 -translate-y-1/2")
        }
        title="Thu gọn panel"
        onClick={() => onToggle(false)}
        type="button"
      >
        {side === "left" ? (
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>
    );
  } else {
    return (
      <div
        className={
          "hidden lg:flex flex-col justify-center min-h-full " +
          (side === "left" ? "mr-[-14px]" : "ml-[-14px]")
        }
      >
        <button
          className={
            "bg-purple-100 border border-purple-200 text-purple-700 rounded-full p-1 shadow-md hover:bg-purple-200 transition " +
            (side === "left" ? " ml-[-6px]" : " mr-[-6px]")
          }
          onClick={() => onToggle(true)}
          title="Hiện panel"
          type="button"
        >
          {side === "left" ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
    );
  }
}
