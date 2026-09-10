import type { KeychainHardwareColor } from "./types";

export const KEYCHAIN_HARDWARE_COLORS: Record<
	KeychainHardwareColor,
	{ label: string; color: string; roughness: number }
> = {
	silver: { label: "银色", color: "#e2e2e2", roughness: 0.095 },
	gold: { label: "金色", color: "#d2a34e", roughness: 0.12 },
};
