// Random color constants
export const COLOR_1 = "#ff5733";
export const COLOR_2 = "#33ff57";
export const COLOR_3 = "#3357ff";
export const COLOR_4 = "#ff33a8";
export const COLOR_5 = "#a833ff";
export const COLOR_6 = "#33ffa8";
export const COLOR_7 = "#ff8c33";
export const COLOR_8 = "#8cff33";
export const COLOR_9 = "#338cff";
export const COLOR_10 = "#ff338c";

// Color map for easy lookup
const COLORS: Record<string, string> = {
  COLOR_1,
  COLOR_2,
  COLOR_3,
  COLOR_4,
  COLOR_5,
  COLOR_6,
  COLOR_7,
  COLOR_8,
  COLOR_9,
  COLOR_10,
};

/**
 * Get a color by name, with fallback to a default color if not found
 * @param name - The color name (e.g., "COLOR_1")
 * @returns The hex color string
 */
export function getColor(name: string): string {
  return COLORS[name] || "#cccccc"; // Default fallback color
}

/**
 * Get a random color name from the available colors
 * @returns A random color name (e.g., "COLOR_1")
 */
export function getRandomColorName(): string {
  const keys = Object.keys(COLORS);
  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex];
}

// Reverse map for hex to name lookup
const COLOR_TO_NAME: Record<string, string> = {};
for (const [name, color] of Object.entries(COLORS)) {
  COLOR_TO_NAME[color] = name;
}

/**
 * Get the color name from a hex color value
 * @param hex - The hex color string (e.g., "#ff5733")
 * @returns The color name (e.g., "COLOR_1") or "UNKNOWN" if not found
 */
export function getColorName(hex: string): string {
  return COLOR_TO_NAME[hex] || "UNKNOWN";
}
