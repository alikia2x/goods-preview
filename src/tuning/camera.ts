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
	// The crop a product is framed into, as a multiple of its exact fit. A product
	// tuned looser than this carries its own value below.
	framingFill: 1.5,
};

// The badge is framed around where it ended up, so its seats are directions from
// the badge's own centre; the distance follows from the size it measured, the same
// as the acrylic products.
export const BADGE_CAMERA: {
	framingFill: number;
	minDistance: number;
	maxDistance: number;
	views: ViewPositions;
	/** A lying badge uses top- and underside-facing view presets. */
	flatViews: ViewPositions;
	opening: Vector3Tuple;
	tableOpening: Vector3Tuple;
	flatOpening: Vector3Tuple;
} = {
	framingFill: 1.9,
	minDistance: 1.2,
	maxDistance: 9,
	views: {
		front: [0, 0, 1],
		back: [0, 0, -1],
		angle: [0.0608, 0.1013, 0.993],
	},
	flatViews: {
		front: [0, 0.9948, 0.1015],
		back: [0, -0.9948, -0.1015],
		angle: [0.1595, 0.7177, 0.6778],
	},
	opening: [0.0405, 0.1114, 0.993],
	tableOpening: [0.023, 0.0767, 0.9968],
	flatOpening: [0.006, 0.943, 0.334],
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

// How much breathing room each product is framed with, as a multiple of the size
// it measured. The acrylic products share one; the badge was tuned to sit looser.
export const PRODUCT_FRAMING_FILL = {
	badge: BADGE_CAMERA.framingFill,
	ticket: CAMERA.framingFill,
	keychain: CAMERA.framingFill,
	acrylic: CAMERA.framingFill,
	standee: CAMERA.framingFill,
};
