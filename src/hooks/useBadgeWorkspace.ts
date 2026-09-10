import { useCallback, useEffect, useRef, useState } from "react";
import {
	DEFAULT_SETTINGS,
	MAX_IMAGE_FILE_SIZE,
	MAX_IMAGE_PIXELS,
	SUPPORTED_IMAGE_TYPES,
} from "@/lib/badge/constants";
import { BadgeRenderer, defaultArtwork } from "@/lib/badge/renderer";
import type { BadgeView, SettingChange, Settings } from "@/lib/badge/types";
import { SCENES } from "@/lib/studio/scenes";

const RENDERER_ERROR =
	"3D 预览初始化失败，请使用支持 WebGL 2 的浏览器并启用硬件加速。";

export function useBadgeWorkspace() {
	const canvasHostRef = useRef<HTMLDivElement>(null);
	const framingRef = useRef<HTMLElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const rendererRef = useRef<BadgeRenderer | null>(null);
	const fallbackArtworkRef = useRef<HTMLCanvasElement | null>(null);
	const uploadSequenceRef = useRef(0);

	const [settings, setSettings] = useState<Settings>(() => ({
		...DEFAULT_SETTINGS,
	}));
	const [ready, setReady] = useState(false);
	const [error, setError] = useState("");
	const [busy, setBusy] = useState(false);
	const [artwork, setArtwork] = useState<HTMLImageElement | null>(null);
	const [thumbnail, setThumbnail] = useState("");
	const [artworkName, setArtworkName] = useState("默认图案");
	const [resolution, setResolution] = useState("2048");
	useEffect(() => {
		const host = canvasHostRef.current;
		const framing = framingRef.current;
		if (!host || !framing) return;

		try {
			const fallbackArtwork = defaultArtwork();
			const renderer = new BadgeRenderer(host, framing);
			rendererRef.current = renderer;
			fallbackArtworkRef.current = fallbackArtwork;
			setReady(true);
			setThumbnail(fallbackArtwork.toDataURL());

			return () => {
				rendererRef.current = null;
				renderer.dispose();
			};
		} catch {
			rendererRef.current = null;
			setError(RENDERER_ERROR);
		}
	}, []);

	useEffect(() => {
		const renderer = rendererRef.current;
		const source = artwork ?? fallbackArtworkRef.current;
		if (!renderer || !source) return;

		renderer.artwork = source;
		renderer.update(settings);
	}, [artwork, settings]);

	useEffect(() => {
		const bodyColor = document.body.style.backgroundColor,
			rootColor = document.documentElement.style.backgroundColor;
		document.body.style.backgroundColor = SCENES[settings.scene].background;
		document.documentElement.style.backgroundColor =
			SCENES[settings.scene].background;
		return () => {
			document.body.style.backgroundColor = bodyColor;
			document.documentElement.style.backgroundColor = rootColor;
		};
	}, [settings.scene]);
	const updateSetting = useCallback<SettingChange>((key, value) => {
		setSettings((current) => ({ ...current, [key]: value }));
	}, []);

	const resetCrop = useCallback(() => {
		setSettings((current) => ({ ...current, zoom: 1, x: 0, y: 0 }));
	}, []);

	const uploadArtwork = useCallback(
		async (file?: File) => {
			if (!file) return;
			const sequence = ++uploadSequenceRef.current;
			if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
				setError("请选择 PNG、JPG 或 WebP 图像。");
				return;
			}
			if (file.size > MAX_IMAGE_FILE_SIZE) {
				setError("图像大小不能超过 20 MB。");
				return;
			}

			const url = URL.createObjectURL(file);
			const image = new Image();
			image.src = url;
			try {
				await image.decode();
				if (sequence !== uploadSequenceRef.current) return;
				if (image.naturalWidth * image.naturalHeight > MAX_IMAGE_PIXELS) {
					throw new Error("图像像素过大，请缩小至 6400 万像素以内。");
				}
				setArtwork(image);
				const preview = document.createElement("canvas");
				preview.width = preview.height = 160;
				const context = preview.getContext("2d");
				context?.drawImage(image, 0, 0, 160, 160);
				setThumbnail(preview.toDataURL());
				setArtworkName(file.name);
				resetCrop();
				setError("");
			} catch (cause) {
				if (sequence === uploadSequenceRef.current) {
					setError(
						cause instanceof Error && cause.message.startsWith("图像像素")
							? cause.message
							: "无法读取这张图片，请重新选择。",
					);
				}
			} finally {
				URL.revokeObjectURL(url);
			}
		},
		[resetCrop],
	);

	const changeView = useCallback((view: BadgeView) => {
		rendererRef.current?.view(view);
	}, []);

	const exportArtwork = useCallback(async () => {
		const renderer = rendererRef.current;
		if (!renderer) return;

		setBusy(true);
		setError("");
		try {
			await renderer.export(Number(resolution));
		} catch {
			setError("导出失败，请降低分辨率后重试。");
		} finally {
			setBusy(false);
		}
	}, [resolution]);

	return {
		canvasHostRef,
		framingRef,
		inputRef,
		settings,
		ready,
		error,
		busy,
		thumbnail,
		artworkName,
		resolution,
		updateSetting,
		resetCrop,
		uploadArtwork,
		changeView,
		setResolution,
		exportArtwork,
	};
}
