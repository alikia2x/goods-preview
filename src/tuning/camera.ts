export type Vector3Tuple = [number, number, number];

type ViewPositions = {
	front: Vector3Tuple;
	back: Vector3Tuple;
	angle: Vector3Tuple;
};

// One camera for every product; only the framing distance and the seats differ.
export const CAMERA = {
	fov: 35,
	near: 0.1,
	far: 200,
	// The crop a product is framed into, as a multiple of its exact fit.
	framingFill: 1.18,
};

// The badge sits at the origin and is framed from fixed seats, so its views are
// absolute camera positions.
export const BADGE_CAMERA: {
	minDistance: number;
	maxDistance: number;
	views: ViewPositions;
	opening: Vector3Tuple;
	tableOpening: Vector3Tuple;
} = {
	minDistance: 2,
	maxDistance: 9,
	views: {
		front: [0, 0, 4.9],
		back: [0, 0, -4.9],
		angle: [0.3, 0.5, 4.9],
	},
	opening: [0.2, 0.55, 4.9],
	tableOpening: [0.12, 0.4, 5.2],
};

// An acrylic product is framed around the outline it was cut to, so its views
// are directions; the distance follows from the measured span.
export const ACRYLIC_CAMERA: {
	minDistance: number;
	maxDistance: number;
	views: ViewPositions;
	opening: Record<"keychain" | "acrylic" | "standee", Vector3Tuple>;
} = {
	minDistance: 3,
	maxDistance: 60,
	views: {
		front: [0, 0, 1],
		back: [0, 0.03, -1],
		angle: [0.25, 0.1, 1],
	},
	opening: {
		keychain: [0.07, 0.05, 1],
		acrylic: [0.07, 0.05, 1],
		standee: [0.25, 0.1, 1],
	},
};
