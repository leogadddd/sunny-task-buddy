// Font imports for Vite
import OutfitThin from "./fonts/Outfit/static/Outfit-Thin.ttf";
import OutfitExtraLight from "./fonts/Outfit/static/Outfit-ExtraLight.ttf";
import OutfitLight from "./fonts/Outfit/static/Outfit-Light.ttf";
import OutfitRegular from "./fonts/Outfit/static/Outfit-Regular.ttf";
import OutfitMedium from "./fonts/Outfit/static/Outfit-Medium.ttf";
import OutfitSemiBold from "./fonts/Outfit/static/Outfit-SemiBold.ttf";
import OutfitBold from "./fonts/Outfit/static/Outfit-Bold.ttf";
import OutfitExtraBold from "./fonts/Outfit/static/Outfit-ExtraBold.ttf";
import OutfitBlack from "./fonts/Outfit/static/Outfit-Black.ttf";

interface FontDefinition {
  name: string;
  url: string;
  weight: string;
  style?: string;
}

const fonts: FontDefinition[] = [
  { name: "Outfit", url: OutfitThin, weight: "100" },
  { name: "Outfit", url: OutfitExtraLight, weight: "200" },
  { name: "Outfit", url: OutfitLight, weight: "300" },
  { name: "Outfit", url: OutfitRegular, weight: "400" },
  { name: "Outfit", url: OutfitMedium, weight: "500" },
  { name: "Outfit", url: OutfitSemiBold, weight: "600" },
  { name: "Outfit", url: OutfitBold, weight: "700" },
  { name: "Outfit", url: OutfitExtraBold, weight: "800" },
  { name: "Outfit", url: OutfitBlack, weight: "900" },
];

export const loadFonts = async () => {
  try {
    const fontPromises = fonts.map(async (fontDef) => {
      const font = new FontFace(fontDef.name, `url(${fontDef.url})`, {
        weight: fontDef.weight,
        style: fontDef.style || "normal",
      });

      await font.load();
      document.fonts.add(font);
    });

    await Promise.all(fontPromises);
    console.log("Fonts loaded successfully");
  } catch (error) {
    console.error("Failed to load fonts:", error);
    // Don't throw - allow app to continue without custom fonts
  }
};

// Call loadFonts() in your main entry point, e.g., main.tsx
// import { loadFonts } from './assets/fonts';
// loadFonts();
