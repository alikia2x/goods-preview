import { DoubleSide, FrontSide } from "three";
export function AcrylicMaterial({
	thickness,
	gloss,
	edge = false,
	attach,
}: {
	thickness: number;
	gloss: number;
	edge?: boolean;
	attach?: string;
}) {
	return (
		<meshPhysicalMaterial
			attach={attach}
			color="#ffffff"
			transmission={1}
			thickness={thickness}
			ior={1.49}
			side={DoubleSide}
			shadowSide={FrontSide}
			dispersion={0.015}
			roughness={edge ? 0.045 : 0.012}
			specularIntensity={gloss / 100}
			metalness={0}
			attenuationColor="#ffffff"
			attenuationDistance={Infinity}
		/>
	);
}
