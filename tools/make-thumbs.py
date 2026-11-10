"""Generate small WebP thumbnails for product cards (images/thumbs/...).

Run after adding new product photos:   python tools/make-thumbs.py
Requires Pillow (pip install pillow). Existing up-to-date thumbs are skipped.
The site still works without thumbs — it falls back to the original images.
"""
import json
import os
import sys
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WIDTH = 480
QUALITY = 72


def thumb_path(img):
    rel = img[len("images/"):] if img.startswith("images/") else img
    return os.path.join(ROOT, "images", "thumbs", os.path.splitext(rel)[0] + ".webp")


def main():
    with open(os.path.join(ROOT, "products.json"), encoding="utf-8") as f:
        products = json.load(f)
    made = skipped = 0
    for p in products:
        for img in p["images"]:
            src = os.path.join(ROOT, img)
            dst = thumb_path(img)
            if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
                skipped += 1
                continue
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            with Image.open(src) as im:
                im = ImageOps.exif_transpose(im).convert("RGB")
                if im.width > WIDTH:
                    im = im.resize((WIDTH, round(im.height * WIDTH / im.width)), Image.LANCZOS)
                im.save(dst, "WEBP", quality=QUALITY, method=6)
            made += 1
    print(f"thumbnails: {made} created, {skipped} up to date")


if __name__ == "__main__":
    sys.exit(main())
