"""
Favicon and Logo Generator for Dual-Scale Strategy
(Google Search Anti-Crop & Tab Browser Bold)

Follows MASTER-PROMPT-FAVICON.md:
- Browser Tab (favicon.ico, favicon.png, favicon.svg):
  Scale 95%-96% (bold, crisp, filling canvas)
- Google Search & PWA (favicon-48x48.png, favicon-96x96.png, favicon-192x192.png, favicon-512x512.png, apple-touch-icon.png):
  Scale 70%-74% (Safe zone margin ~13%-15% on each side, r < canvasSize/2)
"""

import os
import base64
from io import BytesIO
from PIL import Image, ImageOps

MASTER_LOGO_PATH = "logo/logo-raw.png"
OUTPUT_DIRS = ["logo", "."]

def create_scaled_icon(source_img, canvas_size, scale_ratio):
    """
    Creates an icon with exact canvas_size and scales the trimmed logo according to scale_ratio.
    """
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))

    # Calculate target dimension
    target_content_size = max(1, int(round(canvas_size * scale_ratio)))

    # Maintain aspect ratio of source
    src_w, src_h = source_img.size
    aspect = src_w / src_h
    if aspect >= 1.0:
        new_w = target_content_size
        new_h = max(1, int(round(target_content_size / aspect)))
    else:
        new_h = target_content_size
        new_w = max(1, int(round(target_content_size * aspect)))

    resized_logo = source_img.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Center on canvas
    pos_x = (canvas_size - new_w) // 2
    pos_y = (canvas_size - new_h) // 2
    canvas.paste(resized_logo, (pos_x, pos_y), resized_logo)
    return canvas

def generate_svg(png_image, canvas_size=48):
    """
    Generates a crisp SVG embedding base64 PNG data.
    """
    buffered = BytesIO()
    png_image.save(buffered, format="PNG", optimize=True)
    img_b64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {canvas_size} {canvas_size}" width="100%" height="100%">
  <image width="{canvas_size}" height="{canvas_size}" href="data:image/png;base64,{img_b64}" />
</svg>'''
    return svg_content

def main():
    if not os.path.exists(MASTER_LOGO_PATH):
        raise FileNotFoundError(f"Master logo not found at {MASTER_LOGO_PATH}")

    raw_img = Image.open(MASTER_LOGO_PATH).convert("RGBA")

    # Clean / Trim transparent borders so scale is exact
    bbox = raw_img.getbbox()
    trimmed_logo = raw_img.crop(bbox)
    print(f"[+] Loaded master logo from {MASTER_LOGO_PATH}, trimmed size: {trimmed_logo.size}")

    # Scales defined in Master Prompt
    TAB_SCALE = 0.95      # 95% - 96% for Tab Browser Bold
    SAFE_SCALE = 0.72     # 70% - 74% for Google Search Safe Zone (Circular Mask Anti-Crop)
    APPLE_SCALE = 0.78    # ~78% for Apple Touch Icon (Rounded rectangle mask)

    print("[+] Generating icons...")

    # 1. Browser Tab Bold Icons (95% scale)
    tab_favicon_16 = create_scaled_icon(trimmed_logo, 16, TAB_SCALE)
    tab_favicon_32 = create_scaled_icon(trimmed_logo, 32, TAB_SCALE)
    tab_favicon_48 = create_scaled_icon(trimmed_logo, 48, TAB_SCALE)

    # Root & logo favicon.png (48x48 bold tab)
    favicon_png_48 = tab_favicon_48

    # Root & logo favicon.svg (based on crisp 48x48 / high-res bold tab)
    tab_favicon_96 = create_scaled_icon(trimmed_logo, 96, TAB_SCALE)
    svg_content = generate_svg(tab_favicon_96, canvas_size=96)

    # 2. Google Search & PWA Safe Zone Icons (72% scale)
    search_48 = create_scaled_icon(trimmed_logo, 48, SAFE_SCALE)
    search_96 = create_scaled_icon(trimmed_logo, 96, SAFE_SCALE)
    search_192 = create_scaled_icon(trimmed_logo, 192, SAFE_SCALE)
    search_512 = create_scaled_icon(trimmed_logo, 512, SAFE_SCALE)

    # 3. Apple Touch Icon (78% scale)
    apple_180 = create_scaled_icon(trimmed_logo, 180, APPLE_SCALE)

    # 4. Standard Logo Master 512x512 WebP & PNG (Full Master & Safe)
    logo_png_512 = search_512

    # Let's save all into logo/ directory and root . directory
    os.makedirs("logo", exist_ok=True)

    # A. Save in logo/
    search_48.save("logo/favicon-48x48.png", optimize=True)
    search_96.save("logo/favicon-96x96.png", optimize=True)
    search_192.save("logo/favicon-192x192.png", optimize=True)
    search_512.save("logo/favicon-512x512.png", optimize=True)
    apple_180.save("logo/apple-touch-icon.png", optimize=True)
    favicon_png_48.save("logo/favicon.png", optimize=True)
    with open("logo/favicon.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)

    logo_png_512.save("logo/logo.png", optimize=True)
    logo_png_512.save("logo/logo.webp", "WEBP", quality=95, method=6)

    # Multi-layer favicon.ico for logo/
    # ICO contains 16x16, 32x32, 48x48 layers
    tab_favicon_48.save("logo/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)], append_images=[tab_favicon_16, tab_favicon_32])

    # B. Save in root ./ (Fallback and standard paths)
    favicon_png_48.save("favicon.png", optimize=True)
    tab_favicon_48.save("favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)], append_images=[tab_favicon_16, tab_favicon_32])
    with open("favicon.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)

    search_48.save("favicon-48x48.png", optimize=True)
    search_96.save("favicon-96x96.png", optimize=True)
    search_192.save("icon-192.png", optimize=True)
    search_192.save("favicon-192x192.png", optimize=True)
    search_512.save("icon-512.png", optimize=True)
    search_512.save("favicon-512x512.png", optimize=True)
    apple_180.save("apple-touch-icon.png", optimize=True)

    print("[✓] All favicon, logo, and icon assets generated successfully!")

if __name__ == "__main__":
    main()
