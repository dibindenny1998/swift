# Removes the black background from the source render and writes a transparent PNG.
# Usage: python3 scripts/mascot/cutout.py docs/reference/mascot-source.png public/mascot.png
import sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi
src, out = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(src).convert("RGB")).astype(np.float32)
m = im.max(axis=2)
dark = m < 28
lab, n = ndi.label(dark)
border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bg = np.isin(lab, list(border))
# Edge band: non-background pixels within 4px of the background.
band = ndi.binary_dilation(bg, iterations=4) & ~bg
fg_m = np.where(bg | band, 0, m)
local = ndi.maximum_filter(fg_m, size=11)
local = np.where(local < 60, 255, local)
alpha = np.ones_like(m)
alpha[bg] = 0
alpha[band] = np.clip(m[band] / local[band], 0, 1)
alpha = ndi.gaussian_filter(alpha, 0.6)
alpha[bg & (ndi.distance_transform_edt(bg) > 2)] = 0
rgb = np.clip(im / np.maximum(alpha, 1e-3)[..., None], 0, 255)
rgb = np.where(alpha[..., None] > 0.02, rgb, 0)
rgba = np.dstack([rgb, alpha * 255]).astype(np.uint8)
img = Image.fromarray(rgba, "RGBA")
bbox = img.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
img = img.crop(bbox)
w, h = img.size
pad = int(h * 0.02)
canvas = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
canvas.paste(img, (pad, pad))
H = 880
canvas = canvas.resize((round(canvas.width * H / canvas.height), H), Image.LANCZOS)
canvas.save(out, optimize=True)
print(canvas.size)
