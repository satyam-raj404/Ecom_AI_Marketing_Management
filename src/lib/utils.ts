import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Concatenates and dedupes Tailwind class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
