import type { KeychainHardwareColor } from "@/features/keychain/settings";

export const KEYCHAIN_HARDWARE_COLORS: Record<
	KeychainHardwareColor,
	{
		label: string;
		color: string;
		roughness: number;
		environmentIntensity: number;
	}
> = {
	silver: {
		label: "银色",
		color: "#e2e2e2",
		roughness: 0.095,
		environmentIntensity: 1,
	},
	gold: {
		label: "金色",
		color: "#FFE252",
		roughness: 0.1,
		environmentIntensity: 1.35,
	},
};
