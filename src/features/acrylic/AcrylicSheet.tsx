import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { AcrylicMaterial } from "@/features/acrylic/AcrylicMaterial";
import {
	type Outline,
	acrylicGeometry,
	sheetThickness,
} from "@/features/acrylic/lib/geometry";
import { createOpticalShadow } from "@/features/acrylic/optical-shadow";
import {
	buildWindowGeometry,
	buildWindowTint,
} from "@/features/acrylic/lib/window";
import type { AcrylicPose } from "@/features/acrylic/settings";
import type { KeychainArtwork } from "@/features/keychain/lib/artwork";
import { sampledDiffuseLighting } from "@/features/studio/lib/indirect-light";
import { ambientIblShare } from "@/features/studio/lib/light-budget";
import { MODEL_SCALE, STAGE_FLOOR_Y, type SceneKind } from "@/tuning";

// 彩窗 is a colour filter over clear acrylic, not another printed surface. The
// cap keeps at least 45% of the scene visible even for an opaque source pixel.
const MAX_WINDOW_OPACITY = 0.55;

// The cut sheet and the artwork printed behind it. Every acrylic product is this
// plus its own parts, which arrive as children and are seated with it.
export function AcrylicSheet({
	artwork,
	window,
	outline,
	size,
	thickness,
	gloss,
	windowStrength,
	scene,
	positionOffsetZ = 0,
	pose = "standing",
	children,
}: {
	artwork: KeychainArtwork;
	/** The 彩窗 image, if the product carries one. */
	window?: HTMLImageElement | HTMLCanvasElement | null;
	outline: Outline;
	size: number;
	thickness: number;
	gloss: number;
	windowStrength: number;
	scene: SceneKind;
	/** Upright-scene placement in physical millimetres. */
	positionOffsetZ?: number;
	pose?: AcrylicPose;
	children?: ReactNode;
}) {
	const scale = size / MODEL_SCALE.sheet;
	const depth = sheetThickness(thickness, size);
	const opticalShadow = useMemo(createOpticalShadow, []);
	useEffect(() => () => opticalShadow.dispose(), [opticalShadow]);
	const geometry = useMemo(
		() => acrylicGeometry(outline, depth),
		[outline, depth],
	);
	const texture = useMemo(() => {
		const value = new THREE.CanvasTexture(artwork.canvas);
		value.colorSpace = THREE.SRGBColorSpace;
		value.anisotropy = 8;
		return value;
	}, [artwork]);
	// The 彩窗 image, coloured onto the pixels the print leaves clear. It is a
	// separate translucent surface rather than part of the printed texture: the
	// two alphas mean different things, so the print keeps its cut-out while the
	// window keeps its own translucency.
	const windowTint = useMemo(
		() => (window ? buildWindowTint(artwork.canvas, outline, window) : null),
		[artwork, outline, window],
	);
	const windowTexture = useMemo(() => {
		if (!windowTint) return null;
		const value = new THREE.CanvasTexture(windowTint);
		value.colorSpace = THREE.SRGBColorSpace;
		value.anisotropy = 8;
		return value;
	}, [windowTint]);
	const windowGeometry = useMemo(
		() => (window ? buildWindowGeometry(outline) : null),
		[outline, window],
	);
	const depthMaterial = useMemo(
		() =>
			new THREE.MeshDepthMaterial({
				depthPacking: THREE.RGBADepthPacking,
				map: texture,
				alphaTest: 0.15,
				alphaToCoverage: true,
				side: THREE.DoubleSide,
			}),
		[texture],
	);
	useEffect(() => () => geometry.dispose(), [geometry]);
	useEffect(
		() => () => {
			texture.dispose();
			windowTexture?.dispose();
			windowGeometry?.dispose();
			depthMaterial.dispose();
		},
		[texture, windowTexture, windowGeometry, depthMaterial],
	);
	// The printed surface is the one the key light also strikes, so it carries the
	// ambient share. Held in a uniform: the scene can change its split without
	// forcing the shader to recompile.
	const ambientShare = useRef({ value: ambientIblShare(scene) });
	useEffect(() => {
		ambientShare.current.value = ambientIblShare(scene);
	}, [scene]);
	const patchDiffuse = useCallback(
		(shader: THREE.WebGLProgramParametersWithUniforms) =>
			sampledDiffuseLighting(shader, ambientShare.current),
		[],
	);
	const bottom = Math.min(...outline.points.map((point) => point.y));
	const flat = pose === "flat";
	// Standing, the sheet rests on its lowest cut point. Flat, it lies on the
	// face opposite the print, so the seating comes from the half-thickness
	// beneath it.
	const seatY = flat
		? STAGE_FLOOR_Y + (depth * scale) / 2
		: STAGE_FLOOR_Y - bottom * scale;
	const windowSurfaceZ = depth / 2 + 0.001;
	const depthOffset =
		scene === "standing" ? positionOffsetZ / MODEL_SCALE.sheet : 0;
	return (
		<group position={[0, seatY, depthOffset]} scale={scale}>
			<group rotation={flat ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}>
				<mesh
					castShadow
					customDepthMaterial={opticalShadow}
					geometry={geometry}
					dispose={null}
				>
					<AcrylicMaterial
						attach="material-0"
						thickness={depth}
						gloss={gloss}
					/>
					<AcrylicMaterial
						attach="material-1"
						thickness={depth}
						gloss={gloss}
						edge
					/>
				</mesh>
				<mesh castShadow receiveShadow customDepthMaterial={depthMaterial}>
					<planeGeometry args={[outline.width, outline.height]} />
					<meshStandardMaterial
						onBeforeCompile={patchDiffuse}
						map={texture}
						alphaTest={0.08}
						alphaToCoverage
						side={THREE.DoubleSide}
						roughness={0.9}
						metalness={0}
					/>
				</mesh>
				{windowTexture && windowGeometry && (
					<>
						{/* Keep the colour filter just outside each acrylic face. A layer at
						    the sheet centre is hidden by the transmissive shell's depth. */}
						<mesh
							geometry={windowGeometry}
							position={[0, 0, windowSurfaceZ]}
							renderOrder={1}
						>
							<meshBasicMaterial
								map={windowTexture}
								transparent
								opacity={(windowStrength / 100) * MAX_WINDOW_OPACITY}
								side={THREE.FrontSide}
								depthWrite={false}
							/>
						</mesh>
						<mesh
							geometry={windowGeometry}
							position={[0, 0, -windowSurfaceZ]}
							renderOrder={1}
						>
							<meshBasicMaterial
								map={windowTexture}
								transparent
								opacity={(windowStrength / 100) * MAX_WINDOW_OPACITY}
								side={THREE.BackSide}
								depthWrite={false}
							/>
						</mesh>
					</>
				)}
				{children}
			</group>
		</group>
	);
}
