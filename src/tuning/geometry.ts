// A product is authored at one natural scale, so its size in millimetres becomes
// world units by dividing by the base it was modelled against. The badge has its
// own; every acrylic product is cut from the same sheet model.
export const MODEL_SCALE = {
	badge: 65,
	sheet: 60,
};

// The set seats every product on the same floor line.
export const STAGE_FLOOR_Y = -1;
// Shadow catchers sit a hair below it, so the surface never fights the product.
export const STAGE_SURFACE_OFFSET = 0.004;
// The reflection plane sits between the two: above the opaque floor so it draws
// in front of it, below the line the products stand on.
export const STAGE_REFLECTION_OFFSET = 0.002;
