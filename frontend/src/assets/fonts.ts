// Font loader script
// Add new fonts here by adding to the fonts array

interface FontDefinition {
  name: string;
  url: string;
  weight?: string;
  style?: string;
}

const fonts: FontDefinition[] = [
  {
    name: "Outfit",
    url: "./fonts/Outfit/static/Outfit-Thin.ttf",
    weight: "100",
  },
  {
    name: "Outfit",
    url: "./fonts/Outfit/static/Outfit-ExtraLight.ttf",
    weight: "200",
  },
  {
    name: "Outfit",
    url: "./fonts/Outfit/static/Outfit-Light.ttf",
    weight: "300",
  },
  {
    name: "Outfit",
    url: "./fonts/Outfit/static/Outfit-Regular.ttf",
    weight: "400",
  },
  {
    name: "Outfit",
    url: "./fonts/Outfit/static/Outfit-Medium.ttf",
    weight: "500",
  },
  {
    name: "Outfit",
    url: "./fonts/Outfit/static/Outfit-SemiBold.ttf",
    weight: "600",
  },
  {
    name: "Outfit",
    url: "./fonts/Outfit/static/Outfit-Bold.ttf",
    weight: "700",
  },
  {
    name: "Outfit",
    url: "./fonts/Outfit/static/Outfit-ExtraBold.ttf",
    weight: "800",
  },
  {
    name: "Outfit",
    url: "./fonts/Outfit/static/Outfit-Black.ttf",
    weight: "900",
  },
];

export const loadFonts = async () => {
  const fontPromises = fonts.map(async (fontDef) => {
    const font = new FontFace(fontDef.name, `url(${fontDef.url})`, {
      weight: fontDef.weight || "normal",
      style: fontDef.style || "normal",
    });

    await font.load();
    document.fonts.add(font);
  });

  await Promise.all(fontPromises);
};

// Call loadFonts() in your main entry point, e.g., main.tsx
// import { loadFonts } from './assets/fonts';
// loadFonts();
