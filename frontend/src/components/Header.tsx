import React from "react";
import { X, Minus, Square } from "lucide-react";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="flex items-center justify-between h-8 px-4 bg-background border-b border-border flex-shrink-0">
      <Logo />
      <div className="flex items-center space-x-2">
        <button
          className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
          title="Minimize"
        >
          {/* <Minus className="w-2 h-2 text-yellow-900 mx-auto" /> */}
        </button>
        <button
          className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
          title="Maximize"
        >
          {/* <Square className="w-2 h-2 text-green-900 mx-auto" /> */}
        </button>
        <button
          className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          title="Close"
        >
          {/* <X className="w-2 h-2 text-red-900 mx-auto" /> */}
        </button>
      </div>
    </header>
  );
}
