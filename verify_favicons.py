import math
from PIL import Image
import numpy as np

def verify_google_search_circle(img_path):
    img = Image.open(img_path).convert('RGBA')
    w, h = img.size
    cx, cy = w / 2.0, h / 2.0
    r_max = min(cx, cy)
    arr = np.array(img)
    alpha = arr[:, :, 3]

    ys, xs = np.where(alpha > 0)
    if len(xs) == 0:
        print(f"{img_path}: Empty image!")
        return

    dists = np.sqrt((xs + 0.5 - cx)**2 + (ys + 0.5 - cy)**2)
    max_dist = np.max(dists)
    ratio = max_dist / r_max

    bbox = img.getbbox()
    status = "PASSED (100% within Google Circle)" if ratio <= 1.0 else "CLIPPED"
    print(f"{img_path} ({w}x{h}):")
    print(f"  - Bounding Box: {bbox}")
    print(f"  - Max pixel radius: {max_dist:.2f} px / {r_max:.2f} px ({ratio*100:.1f}%)")
    print(f"  - Status: {status}")

print("=== Google Search & PWA Safe Zone Validation ===")
for path in [
    'logo/favicon-48x48.png',
    'logo/favicon-96x96.png',
    'logo/favicon-192x192.png',
    'logo/favicon-512x512.png',
    'favicon-48x48.png',
    'favicon-96x96.png',
    'icon-192.png',
    'icon-512.png',
    'apple-touch-icon.png'
]:
    verify_google_search_circle(path)

print("\n=== Browser Tab Bold Icons ===")
for path in ['favicon.png', 'logo/favicon.png']:
    img = Image.open(path)
    bbox = img.getbbox()
    w, h = img.size
    content_w = bbox[2] - bbox[0]
    content_h = bbox[3] - bbox[1]
    print(f"{path}: Canvas {w}x{h}, Content {content_w}x{content_h} ({content_w/w*100:.1f}% canvas coverage)")

print("\n=== ICO Layers Check ===")
ico = Image.open("favicon.ico")
print("favicon.ico format:", ico.format, "size:", ico.size)
