// Platform brand constants used throughout the app
export type PlatformId = "linkedin" | "instagram" | "facebook" | "x";

export interface PlatformMeta {
  id: PlatformId;
  name: string;
  color: string;
  bgColor: string;
  width: number;
  height: number;
  available: boolean; // Phase 1: only LinkedIn is wired for OAuth/posting
}

export const PLATFORMS: PlatformMeta[] = [
  { id: "linkedin",  name: "LinkedIn",  color: "#0A66C2", bgColor: "#E8F1FA", width: 1200, height: 627,  available: true },
  { id: "instagram", name: "Instagram", color: "#E4405F", bgColor: "#FDECF0", width: 1080, height: 1080, available: true },
  { id: "facebook",  name: "Facebook",  color: "#1877F2", bgColor: "#E7F0FE", width: 1200, height: 630,  available: true },
  { id: "x",         name: "X",         color: "#000000", bgColor: "#EFEFEF", width: 1600, height: 900,  available: true },
];

// Looks up a platform definition by ID
export const getPlatform = (id: PlatformId) =>
  PLATFORMS.find((p) => p.id === id)!;
