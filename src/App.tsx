import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router";
import type { Mesh } from "three";
import { Button } from "@/components/ui/button";

function RotatingCube() {
	const meshRef = useRef<Mesh>(null);

	useFrame((_, delta) => {
		if (!meshRef.current) return;
		meshRef.current.rotation.x += delta * 0.5;
		meshRef.current.rotation.y += delta * 0.8;
	});

	return (
		<mesh ref={meshRef} castShadow>
			<boxGeometry args={[1.6, 1.6, 1.6]} />
			<meshStandardMaterial color="#a78bfa" roughness={0.25} metalness={0.15} />
		</mesh>
	);
}

function HomePage() {
	return (
		<main className="min-h-screen bg-background text-foreground">
			<section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-12 px-6 py-16 lg:flex-row lg:items-center lg:gap-20">
				<div className="max-w-xl space-y-6">
					<p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
						Vite starter
					</p>
					<h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
						Build something <span className="text-primary">remarkable.</span>
					</h1>
					<p className="max-w-lg text-lg leading-8 text-muted-foreground">
						React Router, shadcn/ui, Biome, Vite, React Three Fiber, and Bun are
						ready to go.
					</p>
					<div className="flex flex-wrap gap-3">
						<Button asChild size="lg">
							<Link to="/about">Explore the starter</Link>
						</Button>
						<Button asChild variant="outline" size="lg">
							<a
								href="https://github.com/pmndrs/react-three-fiber"
								target="_blank"
								rel="noreferrer"
							>
								R3F docs
							</a>
						</Button>
					</div>
				</div>

				<div className="h-[360px] w-full max-w-xl overflow-hidden rounded-3xl border bg-card shadow-2xl shadow-black/20">
					<Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} shadows>
						<color attach="background" args={["#18181b"]} />
						<ambientLight intensity={1.5} />
						<directionalLight castShadow intensity={3} position={[3, 4, 5]} />
						<RotatingCube />
					</Canvas>
				</div>
			</section>
		</main>
	);
}

function AboutPage() {
	return (
		<main className="grid min-h-screen place-items-center bg-background px-6 text-foreground">
			<div className="space-y-5 text-center">
				<p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
					React Router
				</p>
				<h1 className="text-5xl font-semibold tracking-tight">
					A second route.
				</h1>
				<Button asChild variant="outline">
					<Link to="/">Back home</Link>
				</Button>
			</div>
		</main>
	);
}

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/about" element={<AboutPage />} />
			</Routes>
		</BrowserRouter>
	);
}
