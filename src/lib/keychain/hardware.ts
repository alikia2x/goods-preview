import * as THREE from "three";

// A split ring is one continuous, flattened spring-steel winding, not two tori.
export function splitRingGeometry() {
	const profile = new THREE.Shape();
	const w = 0.025,
		h = 0.012,
		r = 0.005;
	profile.moveTo(-w + r, -h);
	profile.lineTo(w - r, -h);
	profile.quadraticCurveTo(w, -h, w, -h + r);
	profile.lineTo(w, h - r);
	profile.quadraticCurveTo(w, h, w - r, h);
	profile.lineTo(-w + r, h);
	profile.quadraticCurveTo(-w, h, -w, h - r);
	profile.lineTo(-w, -h + r);
	profile.quadraticCurveTo(-w, -h, -w + r, -h);
	const cross = profile.getPoints(4);
	cross.pop();
	const segments = 320,
		n = cross.length,
		positions: number[] = [],
		indices: number[] = [];
	for (let i = 0; i <= segments; i++) {
		const t = i / segments,
			angle = -0.35 * Math.PI + t * 3.88 * Math.PI;
		for (const point of cross)
			positions.push(
				(0.43 + point.x) * Math.cos(angle),
				(0.43 + point.x) * Math.sin(angle),
				(t - 0.5) * 0.056 + point.y,
			);
	}
	for (let i = 0; i < segments; i++)
		for (let j = 0; j < n; j++) {
			const a = i * n + j,
				b = i * n + ((j + 1) % n),
				c = (i + 1) * n + ((j + 1) % n),
				d = (i + 1) * n + j;
			indices.push(a, d, b, b, d, c);
		}
	const faces = THREE.ShapeUtils.triangulateShape(cross, []);
	for (const end of [0, segments]) {
		const offset = positions.length / 3;
		for (let j = 0; j < n; j++)
			positions.push(
				...positions.slice((end * n + j) * 3, (end * n + j) * 3 + 3),
			);
		for (const [a, b, c] of faces)
			indices.push(offset + a, offset + (end ? c : b), offset + (end ? b : c));
	}
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute(
		"position",
		new THREE.Float32BufferAttribute(positions, 3),
	);
	geometry.setIndex(indices);
	geometry.computeVertexNormals();
	return geometry;
}

export function ovalLinkGeometry(width = 0.072) {
	class LinkCurve extends THREE.Curve<THREE.Vector3> {
		constructor() {
			super();
			this.arcLengthDivisions = 256;
		}
		getPoint(t: number, target = new THREE.Vector3()) {
			const angle = t * Math.PI * 2;
			return target.set(width * Math.cos(angle), 0.112 * Math.sin(angle), 0);
		}
	}
	return new THREE.TubeGeometry(new LinkCurve(), 64, 0.014, 12, true);
}

export function claspBodyGeometry() {
	const shape = new THREE.Shape();
	shape.moveTo(0.065, -0.31);
	shape.bezierCurveTo(-0.04, -0.37, -0.18, -0.26, -0.23, -0.1);
	shape.bezierCurveTo(-0.33, 0.17, -0.2, 0.41, -0.025, 0.42);
	shape.bezierCurveTo(0.16, 0.43, 0.27, 0.28, 0.22, 0.09);
	shape.lineTo(0.145, 0.065);
	shape.bezierCurveTo(0.2, 0.25, 0.1, 0.33, -0.025, 0.33);
	shape.bezierCurveTo(-0.16, 0.31, -0.21, 0.13, -0.15, -0.07);
	shape.bezierCurveTo(-0.12, -0.19, -0.025, -0.25, 0.055, -0.22);
	shape.closePath();
	const geometry = new THREE.ExtrudeGeometry(shape, {
		depth: 0.035,
		bevelEnabled: true,
		bevelSize: 0.012,
		bevelThickness: 0.008,
		bevelSegments: 4,
		curveSegments: 32,
		steps: 1,
	});
	geometry.translate(0, 0, -0.0175);
	return geometry;
}

export function claspGateGeometry() {
	const shape = new THREE.Shape();
	shape.moveTo(0.04, -0.255);
	shape.quadraticCurveTo(0.16, -0.1, 0.215, 0.085);
	shape.lineTo(0.172, 0.105);
	shape.quadraticCurveTo(0.11, -0.085, 0.005, -0.22);
	shape.closePath();
	const geometry = new THREE.ExtrudeGeometry(shape, {
		depth: 0.025,
		bevelEnabled: true,
		bevelSize: 0.008,
		bevelThickness: 0.005,
		bevelSegments: 3,
		curveSegments: 20,
		steps: 1,
	});
	geometry.translate(0, 0, -0.0125);
	return geometry;
}
