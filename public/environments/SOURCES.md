# Environment sources

All panoramas are CC0 assets from Poly Haven, bundled locally. No runtime requests to Poly Haven are required.

- `studio_small_09_512.exr`: existing transfer-optimized asset, preserved. [Studio Small 09](https://polyhaven.com/a/studio_small_09), Sergej Majboroda.
- `studio_small_03_1k.exr`: [Studio Small 03](https://polyhaven.com/a/studio_small_03), Greg Zaal. Download: https://dl.polyhaven.org/file/ph-assets/HDRIs/exr/1k/studio_small_03_1k.exr
- `photo_studio_01_1k.exr`: [Photo Studio 01](https://polyhaven.com/a/photo_studio_01), Sergej Majboroda. Download: https://dl.polyhaven.org/file/ph-assets/HDRIs/exr/1k/photo_studio_01_1k.exr

The EXR loader retains half-float radiance. The same decoded source supplies PMREM reflections and solid-angle-weighted light samples. Each environment's measured brightest cell defines its rotation reference.
