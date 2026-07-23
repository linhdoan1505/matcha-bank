import random

BASE_LIQUID_COLORS = {
    "Ceremonial Matcha": (91, 127, 58),
    "Culinary Matcha": (79, 122, 46),
    "Houjicha": (138, 90, 52),
}
FRUIT_TINTS = {
    "Strawberry": (214, 60, 90),
    "Mango": (255, 170, 40),
    "Lychee": (255, 200, 210),
}
FRUIT_EMOJI = {
    "Strawberry": "🍓",
    "Mango": "🥭",
    "Lychee": "🍈",
}
DEFAULT_LIQUID_COLOR = (206, 222, 190)


def _shade(rgb, factor):
    return tuple(max(0, min(255, round(c * factor))) for c in rgb)


def _liquid_color(ingredients):
    base = next((i for i in reversed(ingredients) if i.get("cat") == "base"), None)
    rgb = list(BASE_LIQUID_COLORS.get(base.get("name"), (122, 166, 90))) if base else list(DEFAULT_LIQUID_COLOR)

    milk_count = sum(1 for i in ingredients if i.get("cat") == "milk")
    for _ in range(milk_count):
        rgb = [c + (255 - c) * 0.22 for c in rgb]

    for i in ingredients:
        if i.get("cat") == "fruit":
            tint = FRUIT_TINTS.get(i.get("name"))
            if tint:
                rgb = [c * 0.85 + t * 0.15 for c, t in zip(rgb, tint)]

    return tuple(round(min(255, c)) for c in rgb)


def build_cup_thumb_svg(ingredients):
    rgb = _liquid_color(ingredients)
    top = _shade(rgb, 1.18)
    bottom = _shade(rgb, 0.82)
    uid = f"{random.randrange(16**6):06x}"

    foam = any(i.get("name") == "Cold Foam" for i in ingredients)
    boba = any(i.get("name") == "Boba Pearls" for i in ingredients)
    ice = any(i.get("cat") == "ice" for i in ingredients)
    fruit = next((i for i in ingredients if i.get("cat") == "fruit"), None)
    fruit_emoji = FRUIT_EMOJI.get(fruit.get("name")) if fruit else None

    ice_svg = (
        '<rect x="52" y="36" width="13" height="13" rx="3" fill="rgba(255,255,255,0.85)" '
        'transform="rotate(12 58 42)"/><rect x="74" y="52" width="11" height="11" rx="3" '
        'fill="rgba(255,255,255,0.8)" transform="rotate(-10 80 57)"/>'
        if ice
        else ""
    )
    boba_svg = (
        '<circle cx="50" cy="114" r="5" fill="#2a1a12"/><circle cx="65" cy="120" r="5" fill="#2a1a12"/>'
        '<circle cx="80" cy="113" r="5" fill="#2a1a12"/><circle cx="92" cy="119" r="5" fill="#2a1a12"/>'
        if boba
        else ""
    )
    fruit_svg = f'<text x="70" y="82" font-size="26" text-anchor="middle">{fruit_emoji}</text>' if fruit_emoji else ""
    foam_svg = '<ellipse cx="70" cy="20" rx="45" ry="11" fill="#fbf7ee"/>' if foam else ""

    return f"""<svg viewBox="0 0 140 140" class="thumb-cup" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <defs>
    <linearGradient id="liq-{uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgb({top[0]},{top[1]},{top[2]})"/>
      <stop offset="100%" stop-color="rgb({bottom[0]},{bottom[1]},{bottom[2]})"/>
    </linearGradient>
  </defs>
  <rect x="88" y="2" width="9" height="30" rx="4" fill="#e85c7a" transform="rotate(12 92 17)"/>
  <polygon points="26,18 114,18 102,128 38,128" fill="url(#liq-{uid})"/>
  <polygon points="26,18 114,18 102,128 38,128" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
  {ice_svg}
  {boba_svg}
  {fruit_svg}
  {foam_svg}
  <rect x="20" y="8" width="100" height="14" rx="6" fill="#ffffff" opacity="0.95"/>
</svg>"""
