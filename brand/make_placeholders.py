"""Builds the gorilla placeholder illustrations (img/placeholders/*.svg) shown
for exercises that don't have a stick-figure demo yet.
Reuses the drawing parts (head, fist, arms, torso) from the official logo file.
Run from the grauer folder:  python brand/make_placeholders.py
"""
import re
import pathlib

src = pathlib.Path("brand/v2/grauer-icon-crossed.svg").read_text(encoding="utf-8")
defs = re.search(r"<defs>(.*)</defs>", src, re.S).group(1)
INK, FUR, ARM, FACE, SILVER, GOLD, GOLD_DK, PLATE = "#0e0f11", "#2a2e33", "#3a4048", "#5c626b", "#c3cfc8", "#e8b04a", "#b9832a", "#7d8a84"
OL = f'fill="none" stroke="{INK}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"'

def svg(body, view="0 0 512 512"):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}">\n<defs>{defs}</defs>\n'
            f'{body}\n</svg>\n')

def plate(x, y):  # one dumbbell plate centered on (x, y)
    return (f'<rect x="{x - 9}" y="{y - 40}" width="18" height="80" rx="6" fill="{PLATE}"/>'
            f'<rect x="{x - 9}" y="{y - 40}" width="18" height="80" rx="6" {OL}/>')

# ---- 1) Curls: the flex pose with a dumbbell in each fist (no background) ----
flex_parts = re.search(r'<symbol id="poseB"[^>]*>(.*?)</symbol>', src, re.S).group(1)
flex_parts = re.sub(r'<g clip-path="url\(#tile\)">', "<g>", flex_parts, count=1)
flex_parts = re.sub(r'<rect width="512" height="512"[^>]*/>\s*<rect width="512" height="512" fill="url\(#glow\)"/>', "", flex_parts, count=1)
curl = flex_parts + "".join(plate(x, 150) for x in (38, 142, 370, 474))
pathlib.Path("img/placeholders/curl.svg").write_text(svg(curl, "0 40 512 472"), encoding="utf-8")

# ---- 2) Thinker: seated, chin on fist, thought bubble ----
think = f'''
<use href="#torsoA" fill="{FUR}"/>
<use href="#torsoA" {OL}/>
<use href="#armA"/>
<use href="#armA" transform="translate(512 0) scale(-1 1)"/>
<!-- resting forearm across the lap -->
<path d="M44 470 C 112 448, 210 442, 262 452 L 262 506 C 210 496, 112 500, 60 520 Z" fill="{ARM}"/>
<path d="M44 470 C 112 448, 210 442, 262 452 L 262 506 C 210 496, 112 500, 60 520 Z" {OL}/>
<use href="#fist" transform="translate(284 478) rotate(90)"/>
<use href="#head" transform="translate(236 206) rotate(-9) scale(0.56) translate(-256 -250)"/>
<!-- thinking forearm: elbow on the knee, fist under the chin -->
<path d="M441 482 L 315 336 L 273 370 L 399 518 Z" fill="{ARM}"/>
<path d="M441 482 L 315 336 L 273 370 L 399 518 Z" {OL}/>
<path d="M296 344 L 316 326 L 336 350 L 316 368 Z" fill="{GOLD}"/>
<path d="M296 344 L 316 326 L 336 350 L 316 368 Z" {OL}/>
<use href="#fist" transform="translate(276 330) rotate(-40)"/>
<!-- thought bubble -->
<circle cx="388" cy="132" r="9" fill="#e9efeb" {OL.replace('fill="none" ', '')}/>
<circle cx="410" cy="104" r="14" fill="#e9efeb" {OL.replace('fill="none" ', '')}/>
<ellipse cx="446" cy="56" rx="54" ry="44" fill="#e9efeb" {OL.replace('fill="none" ', '')}/>
<text x="446" y="78" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="58" fill="{INK}">?</text>
'''
pathlib.Path("img/placeholders/think.svg").write_text(svg(think, "0 0 512 512"), encoding="utf-8")
print("wrote img/placeholders/curl.svg, think.svg")
