#!/usr/bin/env python3
"""
Kırmızı Dosya Kahramanı — tamamen kodla çizilmiş hikaye.
6 sahne, dikey 1080x1920. Pillow ile sıfırdan çizim.
"""
import os
import math
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
OUT = "video/code-scenes"
os.makedirs(OUT, exist_ok=True)

# Renk paleti
RED_FOLDER = (220, 50, 50)
NAVY = (30, 40, 100)
GOLD = (255, 215, 0)
SKIN = (240, 200, 170)
STICK = (40, 40, 40)
BROWN = (160, 100, 60)
MARBLE = (200, 200, 210)
SKY_DAY = (135, 206, 250)
SKY_NIGHT = (25, 25, 60)
WHITE = (255, 255, 255)
BLACK = (10, 10, 10)
WOOD = (150, 90, 50)


def load_font(size, bold=False):
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def face(d, cx, cy, r, mood="happy"):
    """Basit yüz: gözler, kaş, gülümseme veya üzüntü."""
    # Göz beyazı
    d.ellipse([cx - r * 0.35, cy - r * 0.2, cx - r * 0.15, cy + r * 0.2], fill=WHITE, outline=BLACK, width=2)
    d.ellipse([cx + r * 0.15, cy - r * 0.2, cx + r * 0.35, cy + r * 0.2], fill=WHITE, outline=BLACK, width=2)
    # Gözbeği
    d.ellipse([cx - r * 0.24, cy - r * 0.05, cx - r * 0.16, cy + r * 0.05], fill=BLACK)
    d.ellipse([cx + r * 0.16, cy - r * 0.05, cx + r * 0.24, cy + r * 0.05], fill=BLACK)
    # Kaşlar
    brow_y = cy - r * 0.45
    if mood == "worried":
        d.arc([cx - r * 0.3, brow_y - 6, cx - r * 0.1, brow_y + 6], start=180, end=360, fill=BLACK, width=4)
        d.arc([cx + r * 0.1, brow_y - 6, cx + r * 0.3, brow_y + 6], start=180, end=360, fill=BLACK, width=4)
    else:
        d.line([cx - r * 0.3, brow_y, cx - r * 0.05, brow_y - 8], fill=BLACK, width=4)
        d.line([cx + r * 0.05, brow_y - 8, cx + r * 0.3, brow_y], fill=BLACK, width=4)
    # Ağız
    m_y = cy + r * 0.35
    if mood == "happy":
        d.arc([cx - r * 0.25, m_y - 8, cx + r * 0.25, m_y + 12], start=20, end=160, fill=BLACK, width=4)
    elif mood == "worried":
        d.arc([cx - r * 0.25, m_y - 10, cx + r * 0.25, m_y + 2], start=200, end=340, fill=BLACK, width=4)
    elif mood == "serious":
        d.line([cx - r * 0.2, m_y, cx + r * 0.2, m_y], fill=BLACK, width=4)
    elif mood == "smile":
        d.arc([cx - r * 0.25, m_y - 6, cx + r * 0.25, m_y + 8], start=20, end=160, fill=BLACK, width=3)


def draw_folder_hero(d, cx, cy, scale, mood="happy", bowtie=True):
    """Kırmızı Dosya kahramanı: klasör başı, yüz, pavyon, mantar, cape, gözlü eldiven, ince bacak."""
    s = scale
    # Kaftan / cape (navy)
    d.pieslice([cx - s * 110, cy - s * 130, cx + s * 110, cy + s * 140], start=200, end=340, fill=NAVY)
    # Klasöv bedeni (kırmızı)
    d.rounded_rectangle([cx - s * 55, cy - s * 90, cx + s * 55, cy + s * 80], radius=s * 8, fill=RED_FOLDER, outline=BLACK, width=3)
    # Üstteki beyaz kağıtlar
    d.rounded_rectangle([cx - s * 62, cy - s * 110, cx + s * 62, cy - s * 75], radius=s * 5, fill=WHITE, outline=BLACK, width=2)
    d.rounded_rectangle([cx - s * 50, cy - s * 100, cx + s * 50, cy - s * 65], radius=s * 5, fill=WHITE, outline=BLACK, width=2)
    # Yüz (klasörün ön yüzü)
    d.rounded_rectangle([cx - s * 45, cy - s * 75, cx + s * 45, cy + s * 65], radius=s * 6, fill=WHITE, outline=BLACK, width=2)
    face(d, cx, cy - s * 5, s * 0.35, mood)
    # Pavyon (mavi beyaz noktalı)
    if bowtie:
        d.polygon([(cx - s * 18, cy + s * 10), (cx, cy - s * 5), (cx + s * 18, cy + s * 10),
                   (cx + s * 6, cy + s * 18), (cx, cy + s * 8), (cx - s * 6, cy + s * 18)],
                  fill=(60, 80, 160), outline=BLACK, width=2)
        for px, py in [(cx - s * 10, cy + s * 2), (cx + s * 10, cy + s * 2)]:
            d.ellipse([px - s * 2, py - s * 2, px + s * 2, py + s * 2], fill=WHITE)
    # Gözlü kırmızı eldivenler
    d.ellipse([cx - s * 75, cy + s * 20, cx - s * 45, cy + s * 55], fill=RED_FOLDER, outline=BLACK, width=2)
    d.ellipse([cx + s * 45, cy + s * 20, cx + s * 75, cy + s * 55], fill=RED_FOLDER, outline=BLACK, width=2)
    d.ellipse([cx - s * 62, cy + s * 30, cx - s * 52, cy + s * 40], fill=WHITE)
    d.ellipse([cx + s * 52, cy + s * 30, cx + s * 62, cy + s * 40], fill=WHITE)
    # Ince siyah bacaklar
    d.line([cx - s * 22, cy + s * 80, cx - s * 12, cy + s * 140], fill=STICK, width=max(1, int(s * 4)))
    d.line([cx + s * 22, cy + s * 80, cx + s * 12, cy + s * 140], fill=STICK, width=max(1, int(s * 4)))
    # Oval siyah ayakkabılar
    d.ellipse([cx - s * 30, cy + s * 135, cx - s * 10, cy + s * 155], fill=BLACK, outline=STICK, width=2)
    d.ellipse([cx + s * 10, cy + s * 135, cx + s * 30, cy + s * 155], fill=BLACK, outline=STICK, width=2)


def draw_scales(d, cx, cy, scale, mood="happy"):
    """Altın terazi, yüzlü, kol ve ayaklı."""
    s = scale
    # Sap
    d.line([cx, cy - s * 70, cx, cy + s * 60], fill=(180, 140, 30), width=int(s * 3))
    # Üst çubuk
    d.line([cx - s * 55, cy - s * 70, cx + s * 55, cy - s * 70], fill=GOLD, width=int(s * 4))
    # Terazi kâşeleri
    for lx in (cx - s * 40, cx + s * 40):
        d.line([lx, cy - s * 70, lx, cy - s * 20], fill=(180, 140, 30), width=int(s * 2))
        d.ellipse([lx - s * 18, cy - s * 20, lx + s * 18, cy + s * 5], fill=GOLD, outline=BLACK, width=2)
    # Yüz (merkez)
    d.ellipse([cx - s * 22, cy - s * 30, cx + s * 22, cy + s * 10], fill=SKIN, outline=BLACK, width=2)
    face(d, cx, cy - s * 10, s * 0.25, mood)
    # Kol ve ayak
    d.line([cx - s * 25, cy - s * 10, cx - s * 50, cy + s * 40], fill=STICK, width=max(1, int(s * 3)))
    d.line([cx + s * 25, cy - s * 10, cx + s * 50, cy + s * 40], fill=STICK, width=max(1, int(s * 3)))
    d.ellipse([cx - s * 55, cy + s * 35, cx - s * 35, cy + s * 55], fill=BROWN, outline=BLACK, width=2)
    d.ellipse([cx + s * 35, cy + s * 35, cx + s * 55, cy + s * 55], fill=BROWN, outline=BLACK, width=2)


def draw_gavel(d, cx, cy, scale, mood="serious"):
    """Tozmak, yüzlü, kol ve ayaklı."""
    s = scale
    # Sap
    d.line([cx, cy - s * 50, cx, cy + s * 10], fill=WOOD, width=int(s * 4))
    # Baş
    d.rounded_rectangle([cx - s * 25, cy + s * 5, cx + s * 25, cy + s * 45], radius=s * 4, fill=WOOD, outline=BLACK, width=2)
    # Yüz (başın üst kısmına)
    d.ellipse([cx - s * 14, cy + s * 8, cx + s * 14, cy + s * 36], fill=SKIN, outline=BLACK, width=2)
    face(d, cx, cy + s * 20, s * 0.22, mood)
    # Kol ve ayak
    d.line([cx - s * 20, cy + s * 25, cx - s * 45, cy + s * 65], fill=STICK, width=max(1, int(s * 3)))
    d.line([cx + s * 20, cy + s * 25, cx + s * 45, cy + s * 65], fill=STICK, width=max(1, int(s * 3)))
    d.ellipse([cx - s * 50, cy + s * 60, cx - s * 30, cy + s * 80], fill=BROWN, outline=BLACK, width=2)
    d.ellipse([cx + s * 30, cy + s * 60, cx + s * 50, cy + s * 80], fill=BROWN, outline=BLACK, width=2)


def draw_book(d, cx, cy, scale, mood="wise"):
    """Kitap, gözlüklü, yüzlü, kol ve ayaklı."""
    s = scale
    # Gövde (kitap)
    d.rounded_rectangle([cx - s * 35, cy - s * 40, cx + s * 35, cy + s * 50], radius=s * 4, fill=(139, 90, 43), outline=BLACK, width=2)
    d.rectangle([cx - s * 30, cy - s * 35, cx + s * 30, cy - s * 25], fill=(200, 160, 100))
    # Yüz
    d.ellipse([cx - s * 20, cy - s * 10, cx + s * 20, cy + s * 30], fill=SKIN, outline=BLACK, width=2)
    face(d, cx, cy + s * 8, s * 0.24, mood)
    # Gözlük
    d.arc([cx - s * 18, cy + s * 2, cx - s * 2, cy + s * 20], start=180, end=360, fill=BLACK, width=3)
    d.arc([cx + s * 2, cy + s * 2, cx + s * 18, cy + s * 20], start=180, end=360, fill=BLACK, width=3)
    d.line([cx - s * 2, cy + s * 10, cx + s * 2, cy + s * 10], fill=BLACK, width=2)
    # Kol ve ayak
    d.line([cx - s * 22, cy + s * 15, cx - s * 40, cy + s * 55], fill=STICK, width=max(1, int(s * 3)))
    d.line([cx + s * 22, cy + s * 15, cx + s * 40, cy + s * 55], fill=STICK, width=max(1, int(s * 3)))
    d.ellipse([cx - s * 45, cy + s * 50, cx - s * 25, cy + s * 70], fill=BROWN, outline=BLACK, width=2)
    d.ellipse([cx + s * 25, cy + s * 50, cx + s * 45, cy + s * 70], fill=BROWN, outline=BLACK, width=2)


def draw_ali(d, cx, cy, scale, mood="worried"):
    """Genç Ali: kapüşonlu tişört, sırt çantası, yüksek bunaltı."""
    s = scale
    # Saç (karanık kahverengi)
    d.ellipse([cx - s * 35, cy - s * 60, cx + s * 35, cy - s * 15], fill=(60, 40, 20))
    # Yüz
    d.ellipse([cx - s * 28, cy - s * 35, cx + s * 28, cy + s * 10], fill=SKIN, outline=BLACK, width=2)
    face(d, cx, cy - s * 10, s * 0.3, mood)
    # Tişört (mavi gri)
    d.rounded_rectangle([cx - s * 40, cy + s * 5, cx + s * 40, cy + s * 90], radius=s * 6, fill=(90, 110, 130), outline=BLACK, width=2)
    # Kol (çasıt)
    d.line([cx - s * 40, cy + s * 25, cx - s * 15, cy + s * 55], fill=SKIN, width=int(s * 5))
    d.line([cx + s * 40, cy + s * 25, cx + s * 15, cy + s * 55], fill=SKIN, width=int(s * 5))
    # El (çıkıyı tutan)
    d.ellipse([cx - s * 22, cy + s * 45, cx + s * 22, cy + s + 70], fill=SKIN, outline=BLACK, width=2)
    # Pantolon (kahverengi)
    d.rectangle([cx - s * 28, cy + s * 85, cx + s * 28, cy + s * 165], fill=(140, 110, 80))
    # Ayakkabı (gri)
    d.ellipse([cx - s * 35, cy + s * 160, cx - s * 10, cy + s * 185], fill=(120, 100, 90), outline=BLACK, width=2)
    d.ellipse([cx + s * 10, cy + s * 160, cx + s * 35, cy + s * 185], fill=(120, 100, 90), outline=BLACK, width=2)
    # Sırt çantası
    d.ellipse([cx - s * 48, cy + s * 10, cx - s * 12, cy + s * 70], fill=(140, 120, 90), outline=BLACK, width=2)


def draw_steps(d, y_top, y_bottom, width_left, width_right, color=MARBLE):
    """Merdivenler."""
    d.polygon([(0, y_top), (W, y_top), (width_right, y_bottom), (width_left, y_bottom)], fill=color)
    # Merdiven düzlemleri
    n = 12
    step_h = (y_bottom - y_top) / n
    for i in range(n):
        yy = y_top + i * step_h
        xl = width_left + (width_right - width_left) * (i / n)
        xr = W - xl
        d.line([xl, yy + step_h, xr, yy + step_h], fill=(160, 160, 170), width=3)


def draw_courthouse(d, y_ground):
    """Adalet sarayı önyüzü."""
    # Ana bina
    d.rectangle([0, y_ground - 400, W, y_ground], fill=(180, 180, 190), outline=BLACK, width=2)
    # Sütunlar
    for cx in (W * 0.2, W * 0.5, W * 0.8):
        d.rectangle([cx - 35, y_ground - 350, cx + 35, y_ground], fill=(190, 190, 200), outline=BLACK, width=2)
        d.arc([cx - 40, y_ground - 400, cx + 40, y_ground - 350], start=180, end=360, fill=(190, 190, 200), width=2)
    # Zemin kat pencere
    d.rectangle([W * 0.65, y_ground - 200, W * 0.85, y_ground - 80], fill=(60, 40, 20))
    d.rectangle([W * 0.15, y_ground - 200, W * 0.35, y_ground - 80], fill=(60, 40, 20))
    # Üst fagüs
    d.polygon([(W * 0.35, y_ground - 400), (W * 0.5, y_ground - 520), (W * 0.65, y_ground - 400)], fill=(170, 170, 180), outline=BLACK, width=2)
    # Yazı
    draw_text(d, W * 0.5, y_ground - 460, "ADALET SARAYI", 40, anchor="mm")


def draw_text(d, cx, cy, text, size, anchor="mm", fill=BLACK):
    f = load_font(size, bold=True)
    d.text((cx, cy), text, font=f, fill=fill, anchor=anchor)


def sky(d, top_color, bottom_color):
    for y in range(H):
        t = y / H
        r = int(top_color[0] * (1 - t) + bottom_color[0] * t)
        g = int(top_color[1] * (1 - t) + bottom_color[1] * t)
        b = int(top_color[2] * (1 - t) + bottom_color[2] * t)
        d.line([(0, y), (W, y)], fill=(r, g, b))


def sun_rays(d, cx, cy, r, color=(255, 200, 50)):
    for ang in range(0, 360, 30):
        rad = math.radians(ang)
        x1 = cx + math.cos(rad) * r
        y1 = cy + math.sin(rad) * r
        x2 = cx + math.cos(rad) * (r + 40)
        y2 = cy + math.sin(rad) * (r + 40)
        d.line([x1, y1, x2, y2], fill=color, width=4)


# ============================================================
# SAHNE 1: Kahraman giriş (epic poster aynen, dikey)
# ============================================================
def scene1():
    img = Image.new("RGB", (W, H), SKY_NIGHT)
    d = ImageDraw.Draw(img)
    sky(d, SKY_NIGHT, (60, 60, 100))
    sun_rays(d, W * 0.75, H * 0.25, 80)
    draw_courthouse(d, H * 0.85)
    draw_steps(d, H * 0.78, H, W * 0.05, W * 0.05)
    draw_folder_hero(d, W * 0.45, H * 0.62, 1.0, mood="happy", bowtie=True)
    draw_scales(d, W * 0.75, H * 0.62, 0.9, mood="happy")
    draw_text(d, W * 0.5, H * 0.92, "Sahne 1: Kahraman Giriş", 40)
    img.save(f"{OUT}/scene-1.png")
    print("scene-1 saved")


# ============================================================
# SAHNE 2: Ali suçlanıyor (adliye koridoru)
# ============================================================
def scene2():
    img = Image.new("RGB", (W, H), (160, 140, 120))
    d = ImageDraw.Draw(img)
    # Koridor duvarı
    d.rectangle([0, 0, W, H * 0.4], fill=(140, 120, 100))
    d.rectangle([0, H * 0.4, W, H], fill=(180, 160, 140))
    # Kapı
    d.rounded_rectangle([W * 0.25, H * 0.2, W * 0.45, H * 0.75], radius=20, fill=(110, 70, 50), outline=BLACK, width=3)
    draw_text(d, W * 0.35, H * 0.3, "DURUŞMA SALONU 4B", 30, anchor="mm", fill=WHITE)
    draw_ali(d, W * 0.5, H * 0.55, 1.0, mood="worried")
    draw_text(d, W * 0.5, H * 0.9, "Sahne 2: Ali Haksız Yere Suçlandı", 40)
    img.save(f"{OUT}/scene-2.png")
    print("scene-2 saved")


# ============================================================
# SAHNE 3: Kahraman Ali'ye yardım ediyor
# ============================================================
def scene3():
    img = Image.new("RGB", (W, H), SKY_DAY)
    d = ImageDraw.Draw(img)
    sky(d, SKY_DAY, (220, 230, 250))
    draw_courthouse(d, H * 0.82)
    draw_steps(d, H * 0.75, H, W * 0.05, W * 0.05)
    draw_folder_hero(d, W * 0.35, H * 0.6, 0.95, mood="smile", bowtie=True)
    draw_ali(d, W * 0.65, H * 0.62, 0.9, mood="worried")
    draw_text(d, W * 0.5, H * 0.92, "Sahne 3: Kahraman Yardım Eder", 40)
    img.save(f"{OUT}/scene-3.png")
    print("scene-3 saved")


# ============================================================
# SAHNE 4: Helper ekibi (Terazi, Tokmak, Kitap)
# ============================================================
def scene4():
    img = Image.new("RGB", (W, H), SKY_DAY)
    d = ImageDraw.Draw(img)
    sky(d, SKY_DAY, (230, 235, 255))
    draw_courthouse(d, H * 0.85)
    draw_steps(d, H * 0.78, H, W * 0.05, W * 0.05)
    draw_scales(d, W * 0.3, H * 0.6, 0.85, mood="happy")
    draw_gavel(d, W * 0.5, H * 0.62, 0.8, mood="serious")
    draw_book(d, W * 0.7, H * 0.61, 0.8, mood="wise")
    draw_folder_hero(d, W * 0.5, H * 0.82, 0.6, mood="happy", bowtie=True)
    draw_text(d, W * 0.5, H * 0.92, "Sahne 4: Adalet Ekibi", 40)
    img.save(f"{OUT}/scene-4.png")
    print("scene-4 saved")


# ============================================================
# SAHNE 5: Mahkeme duruşması (tozmak vuruyor)
# ============================================================
def scene5():
    img = Image.new("RGB", (W, H), (170, 170, 180))
    d = ImageDraw.Draw(img)
    # Mahkeme salonu duvarı
    d.rectangle([0, 0, W, H * 0.35], fill=(150, 150, 160))
    d.rectangle([0, H * 0.35, W, H * 0.9], fill=(200, 200, 210))
    # Hakeme koltuğu / masası
    d.rectangle([W * 0.3, H * 0.35, W * 0.7, H * 0.6], fill=(130, 80, 50), outline=BLACK, width=2)
    draw_gavel(d, W * 0.5, H * 0.45, 0.7, mood="serious")
    draw_scales(d, W * 0.62, H * 0.5, 0.6, mood="happy")
    draw_folder_hero(d, W * 0.38, H * 0.72, 0.55, mood="smile", bowtie=True)
    draw_ali(d, W * 0.62, H * 0.75, 0.55, mood="smile")
    draw_text(d, W * 0.5, H * 0.92, "Sahne 5: Mahkeme Duruşması", 40)
    img.save(f"{OUT}/scene-5.png")
    print("scene-5 saved")


# ============================================================
# SAHNE 6: Zafer / güneş doğuşu
# ============================================================
def scene6():
    img = Image.new("RGB", (W, H), SKY_NIGHT)
    d = ImageDraw.Draw(img)
    sky(d, (40, 30, 70), (255, 140, 0))
    sun_rays(d, W * 0.5, H * 0.2, 120, color=(255, 180, 50))
    d.ellipse([W * 0.42, H * 0.1, W * 0.58, H * 0.28], fill=(255, 200, 60))
    draw_courthouse(d, H * 0.75)
    draw_steps(d, H * 0.68, H, W * 0.05, W * 0.05)
    draw_folder_hero(d, W * 0.35, H * 0.58, 0.85, mood="happy", bowtie=True)
    draw_scales(d, W * 0.65, H * 0.58, 0.75, mood="happy")
    draw_text(d, W * 0.5, H * 0.92, "Sahne 6: Adalet Zafer Kazandı", 40)
    img.save(f"{OUT}/scene-6.png")
    print("scene-6 saved")


if __name__ == "__main__":
    scene1()
    scene2()
    scene3()
    scene4()
    scene5()
    scene6()
    print("TÜM SAHNELER KODLA ÇİZİLDİ →", OUT)
