import { useFrame, useThree } from "@react-three/fiber";
import {
	type RefObject,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import * as THREE from "three";
import { composeBadgeTexture } from "@/features/badge/model/artwork";
import { badgeGeometry } from "@/features/badge/model/badgeGeometry";
import { ContactShadow } from "@/features/badge/model/contact-shadow";
import { FINISHES, finishMaterial } from "@/features/badge/model/finishes";
import type { BadgeSettings } from "@/features/badge/settings";
import { lightDirection } from "@/features/studio/lib/lighting";
import { placeBadge } from "@/features/badge/model/placement";
import { MODEL_SCALE, type Vector3Tuple, sceneWallZ } from "@/tuning";

const METAL = { color: "#b8bdc2", metalness: 1, roughness: 0.27 };

export type BadgeShadowHandle = {
	render: () => void;
	surface: THREE.Object3D;
};

// The badge product: face, hardware, finish material and its depth-pass contact
// shadow. Everything it adds to the scene lives here.
export function BadgeModel({
	settings,
	artwork,
	shadowRef,
	onPlaced,
}: {
	settings: BadgeSettings;
	artwork: HTMLImageElement | HTMLCanvasElement;
	shadowRef: RefObject<BadgeShadowHandle | null>;
	/** Reports where the badge sits, for the workspace to aim the camera at. */
	onPlaced: (center: Vector3Tuple) => void;
}) {
	const gl = useThree((state) => state.gl);
	const groupRef = useRef<THREE.Group>(null);
	const [shadow, setShadow] = useState<ContactShadow | null>(null);
	const scale = settings.size / MODEL_SCALE.badge;

	const geometry = useMemo(() => badgeGeometry(), []);
	useEffect(() => () => geometry.dispose(), [geometry]);

	const texture = useMemo(() => {
		const value = new THREE.CanvasTexture(
			composeBadgeTexture(artwork, settings.size, settings.bleed),
		);
		value.colorSpace = THREE.SRGBColorSpace;
		value.anisotropy = gl.capabilities.getMaxAnisotropy();
		return value;
	}, [artwork, settings.size, settings.bleed, gl]);
	useEffect(() => () => texture.dispose(), [texture]);

	// A depth-only clone of the badge feeds the soft contact shadow.
	useLayoutEffect(() => {
		const group = groupRef.current;
		if (!group) return;
		const instance = new ContactShadow(group);
		setShadow(instance);
		shadowRef.current = {
			render: () => instance.render(gl),
			surface: instance.wall,
		};
		return () => {
			shadowRef.current = null;
			setShadow(null);
			instance.dispose();
		};
	}, [gl, shadowRef]);

	// Seat the badge first, so the shadow below can be fitted around where it
	// actually ended up.
	const center = useRef<Vector3Tuple>([0, 0, 0]);
	useLayoutEffect(() => {
		const group = groupRef.current;
		if (!group) return;
		center.current = placeBadge(group, settings, scale);
		onPlaced(center.current);
	}, [settings, scale, onPlaced]);

	useLayoutEffect(() => {
		if (!shadow) return;
		const direction = lightDirection(
			settings.lightAzimuth,
			settings.lightElevation,
		);
		const wallZ = sceneWallZ(settings.scene);
		shadow.update(scale, direction, wallZ, center.current);
		if (groupRef.current)
			shadow.setPose(
				groupRef.current,
				settings.pose,
				center.current,
				settings.scene === "studio",
			);
		shadow.material.uniforms.strength.value = settings.shadow / 100;
		shadow.plane.visible = settings.shadow > 0 && settings.scene !== "studio";
		shadow.wall.visible = wallZ !== null && settings.shadow > 0;
		if (wallZ !== null) shadow.wall.position.z = wallZ + 0.003;
	}, [
		shadow,
		settings.scene,
		settings.pose,
		settings.shadow,
		settings.lightAzimuth,
		settings.lightElevation,
		scale,
	]);

	useEffect(() => {
		gl.toneMappingExposure = FINISHES[settings.finish].exposure;
	}, [gl, settings.finish]);

	useFrame(() => shadow?.render(gl));

	return (
		<>
			<group ref={groupRef}>
				<mesh geometry={geometry}>
					<meshPhysicalMaterial
						map={texture}
						{...finishMaterial(settings.finish, settings.gloss)}
					/>
				</mesh>
				<mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.075]}>
					<cylinderGeometry args={[0.95, 0.95, 0.04, 192]} />
					<meshStandardMaterial {...METAL} />
				</mesh>
				<mesh position={[0, 0, -0.088]}>
					<torusGeometry args={[0.932, 0.022, 16, 192]} />
					<meshStandardMaterial {...METAL} />
				</mesh>
				<mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, -0.155]}>
					<cylinderGeometry args={[0.013, 0.013, 1.15, 12]} />
					<meshStandardMaterial {...METAL} />
				</mesh>
				{[-0.56, 0.56].map((x) => (
					<mesh key={x} position={[x, 0, -0.12]}>
						<boxGeometry args={[0.11, 0.17, 0.09]} />
						<meshStandardMaterial {...METAL} />
					</mesh>
				))}
			</group>
			{shadow && (
				<>
					<primitive object={shadow.plane} />
					<primitive object={shadow.wall} />
				</>
			)}
		</>
	);
}
