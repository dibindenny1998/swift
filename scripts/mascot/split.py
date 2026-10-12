# Splits public/mascot.png into body + arm layers for the rigged <Mascot>.
# Usage: python3 scripts/mascot/split.py public/mascot.png public/mascot <preview-dir>
import sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi
src, outdir, sp = sys.argv[1], sys.argv[2], sys.argv[3]
img = Image.open(src).convert("RGBA")
im = np.asarray(img).astype(np.int32)
r, g, b, a = im[...,0], im[...,1], im[...,2], im[...,3]
H, W = a.shape
brown = (a > 20) & (r > g) & (g >= b - 10) & (r < 200) & (r - b > 25) & (r - g < 70) & (r > 40)
lab, n = ndi.label(ndi.binary_closing(brown, iterations=2))
yy, xx = np.mgrid[0:H, 0:W]
def arm(pick, region):
    comp = (lab == lab[pick]) & region
    # include all visible pixels near the stick (antialiased edges, snow flecks)
    m = ndi.binary_dilation(comp, iterations=4) & region & (a > 0)
    return m
left = arm((486, 60), (xx < 198) & ((xx < 148) | (yy > 462)))   # (y,x) seed on left stick
right = arm((450, 560), xx > 474)
print(left.sum(), right.sum())
base = im.copy()
base[left | right, 3] = 0
def layer(mask):
    L = np.zeros_like(im); L[mask] = im[mask]; return L
Image.fromarray(base.astype(np.uint8)).save(f"{outdir}/body.png", optimize=True)
Image.fromarray(layer(left).astype(np.uint8)).save(f"{outdir}/arm-left.png", optimize=True)
Image.fromarray(layer(right).astype(np.uint8)).save(f"{outdir}/arm-right.png", optimize=True)
# preview: arms rotated
prev = Image.new("RGBA", (W, H), (11, 94, 62, 255))
prev.alpha_composite(Image.fromarray(base.astype(np.uint8)))
la = Image.fromarray(layer(left).astype(np.uint8)).rotate(-20, center=(200, 528), resample=Image.BICUBIC)
ra = Image.fromarray(layer(right).astype(np.uint8)).rotate(28, center=(478, 498), resample=Image.BICUBIC)
prev.alpha_composite(la); prev.alpha_composite(ra)
prev.convert("RGB").save(f"{sp}/rig_preview.png")
