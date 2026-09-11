import { useEffect } from "react";
import { SCENES, type SceneKind } from "@/features/studio/lib/scenes";

// The active scene owns the app backdrop. It is deliberately not restored on
// unmount: every workspace sets its own scene, so keeping the last colour until
// the next one mounts removes the flash of the default background during a
// product switch.
export function useSceneBackground(scene: SceneKind) {
	useEffect(() => {
		const background = SCENES[scene].background;
		document.body.style.backgroundColor = background;
		document.documentElement.style.backgroundColor = background;
	}, [scene]);
}
