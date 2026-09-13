import Dexie, { type EntityTable } from "dexie";
import type { ViewPose } from "@/features/studio/components/StudioViewport";
import type { ProductKind } from "@/tuning";

export type WorkspaceHistoryEntry = {
	id?: number;
	product: ProductKind;
	artwork: Blob;
	artworkKey?: string;
	artworkName: string;
	artworkLastModified: number;
	/** The optional image printed on the back of a ticket. */
	backArtwork?: Blob;
	backArtworkName?: string;
	backArtworkLastModified?: number;
	/** The 彩窗 image, when the entry was made on an acrylic product. */
	windowArtwork?: Blob;
	windowArtworkName?: string;
	/** The optional image printed on a standee's base. */
	baseArtwork?: Blob;
	baseArtworkName?: string;
	baseArtworkLastModified?: number;
	settings: Record<string, unknown>;
	camera: ViewPose | null;
	resolved: boolean;
	createdAt: number;
	updatedAt: number;
};

const HISTORY_LIMIT = 30;

class WorkspaceHistoryDatabase extends Dexie {
	history!: EntityTable<WorkspaceHistoryEntry, "id">;

	constructor() {
		super("goods-preview-workspace-history");
		this.version(1).stores({
			history: "++id, updatedAt, resolved",
		});
		this.version(2).stores({
			history: "++id, updatedAt, resolved, product",
		});
	}
}

const database = new WorkspaceHistoryDatabase();

async function artworkKey(artwork: Blob) {
	const bytes = new Uint8Array(await artwork.arrayBuffer());
	try {
		const digest = await crypto.subtle.digest("SHA-256", bytes);
		return Array.from(new Uint8Array(digest), (byte) =>
			byte.toString(16).padStart(2, "0"),
		).join("");
	} catch {
		// Web Crypto is broadly available, but a content-only fallback keeps
		// history working in constrained browser contexts without using metadata.
		let hash = 2166136261;
		for (const byte of bytes) {
			hash ^= byte;
			hash = Math.imul(hash, 16777619);
		}
		return `fnv1a-${bytes.length}-${hash >>> 0}`;
	}
}

async function sameArtwork(stored: Blob | null, next: File | null | undefined) {
	if (!stored && !next) return true;
	if (!stored || !next) return false;
	return (await artworkKey(stored)) === (await artworkKey(next));
}

export async function createHistoryEntry({
	product,
	artwork,
	backArtwork,
	windowArtwork,
	baseArtwork,
	settings,
	camera,
}: {
	product: ProductKind;
	artwork: File;
	backArtwork?: File | null;
	windowArtwork?: File | null;
	baseArtwork?: File | null;
	settings: Record<string, unknown>;
	camera: ViewPose | null;
}) {
	const now = Date.now();
	const key = await artworkKey(artwork);
	const matchingProduct = await database.history
		.where("product")
		.equals(product)
		.toArray();
	for (const entry of matchingProduct) {
		const existingKey = entry.artworkKey ?? (await artworkKey(entry.artwork));
		if (entry.artworkKey !== existingKey && entry.id !== undefined)
			await database.history.update(entry.id, { artworkKey: existingKey });
		if (existingKey !== key || entry.id === undefined) continue;
		// The optional images belong to the artwork: the same combination revisits
		// the same entry, so restoring and re-uploading any image converges here.
		if (!(await sameArtwork(entry.windowArtwork ?? null, windowArtwork)))
			continue;
		if (!(await sameArtwork(entry.backArtwork ?? null, backArtwork))) continue;
		if (!(await sameArtwork(entry.baseArtwork ?? null, baseArtwork))) continue;
		await database.history.update(entry.id, {
			settings,
			camera,
			resolved: false,
			updatedAt: now,
		});
		return entry.id;
	}
	const id = await database.transaction("rw", database.history, async () => {
		const id = await database.history.add({
			product,
			artwork,
			artworkKey: key,
			artworkName: artwork.name,
			artworkLastModified: artwork.lastModified,
			backArtwork: backArtwork ?? undefined,
			backArtworkName: backArtwork?.name,
			backArtworkLastModified: backArtwork?.lastModified,
			windowArtwork: windowArtwork ?? undefined,
			windowArtworkName: windowArtwork?.name,
			baseArtwork: baseArtwork ?? undefined,
			baseArtworkName: baseArtwork?.name,
			baseArtworkLastModified: baseArtwork?.lastModified,
			settings,
			camera,
			resolved: false,
			createdAt: now,
			updatedAt: now,
		});
		const obsolete = await database.history
			.orderBy("updatedAt")
			.reverse()
			.offset(HISTORY_LIMIT)
			.primaryKeys();
		if (obsolete.length) await database.history.bulkDelete(obsolete);
		return id;
	});
	if (typeof id !== "number") throw new Error("无法创建历史记录。");
	return id;
}

export async function updateHistoryEntry(
	id: number,
	changes: Pick<WorkspaceHistoryEntry, "settings" | "camera">,
) {
	await database.history.update(id, {
		...changes,
		resolved: false,
		updatedAt: Date.now(),
	});
}

export async function resolveHistoryEntry(id: number) {
	await database.history.update(id, { resolved: true, updatedAt: Date.now() });
}

export async function deleteHistoryEntry(id: number) {
	await database.history.delete(id);
}

// Only the newest entry matters: a completed latest export deliberately leaves
// older unfinished attempts alone instead of unexpectedly reviving one.
export async function loadLatestUnresolvedHistoryEntry() {
	const latest = await database.history.orderBy("updatedAt").reverse().first();
	return latest?.resolved ? null : (latest ?? null);
}

export function listHistoryEntries() {
	return database.history.orderBy("updatedAt").reverse().toArray();
}
