import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
//để loại css thừa
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
