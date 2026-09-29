"""
affine_core.py - Core logic Affine Cipher (Anggota 1)

Dipakai oleh Anggota 2 (GUI + file handling).

Rumus:
    Enkripsi : C = (a*P + b) mod m
    Dekripsi : P = a^-1 * (C - b) mod m
    m = 26  -> teks (huruf a-z)
    m = 256 -> file / byte-level
"""

# Nilai a yang valid untuk mod 26 (koprima dengan 26)
VALID_A_26 = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]


class KeyError_(ValueError):
    """Error untuk kunci yang tidak valid."""


# ---------------------------------------------------------------
# 1. Extended Euclidean Algorithm
# ---------------------------------------------------------------
def extended_gcd(a, b):
    """Mengembalikan (g, x, y) sehingga a*x + b*y = g = gcd(a, b)."""
    if b == 0:
        return a, 1, 0
    g, x1, y1 = extended_gcd(b, a % b)
    return g, y1, x1 - (a // b) * y1


def mod_inverse(a, m):
    """Invers a terhadap modulus m. Error jika a tidak koprima dengan m."""
    g, x, _ = extended_gcd(a % m, m)
    if g != 1:
        raise KeyError_(f"a={a} tidak punya invers mod {m} (tidak koprima).")
    return x % m


# ---------------------------------------------------------------
# 2. Validasi kunci
# ---------------------------------------------------------------
def validate_key(a, b, m=26):
    """Lempar KeyError_ jika kunci tidak valid. Mengembalikan True jika valid."""
    if not isinstance(a, int) or not isinstance(b, int):
        raise KeyError_("Kunci a dan b harus bilangan bulat.")
    g, _, _ = extended_gcd(a % m, m)
    if g != 1:
        if m == 26:
            raise KeyError_(
                f"Kunci a={a} tidak valid. a harus koprima dengan 26: {VALID_A_26}"
            )
        raise KeyError_(f"Kunci a={a} tidak valid. a harus koprima dengan {m}.")
    if not (0 <= b < m):
        raise KeyError_(f"Kunci b harus di antara 0 dan {m - 1}.")
    return True


def is_valid_key(a, b, m=26):
    """Versi bool dari validate_key (untuk dipakai di GUI)."""
    try:
        return validate_key(a, b, m)
    except KeyError_:
        return False


# ---------------------------------------------------------------
# 3. Teks (mod 26) - hanya huruf a-z, karakter lain dibiarkan
# ---------------------------------------------------------------
def _transform_text(text, mapper):
    hasil = []
    for ch in text:
        if "a" <= ch <= "z":
            hasil.append(chr(mapper(ord(ch) - ord("a")) + ord("a")))
        elif "A" <= ch <= "Z":
            hasil.append(chr(mapper(ord(ch) - ord("A")) + ord("A")))
        else:
            hasil.append(ch)  # spasi, angka, tanda baca dibiarkan
    return "".join(hasil)


def encrypt_text(text, a, b):
    validate_key(a, b, 26)
    return _transform_text(text, lambda p: (a * p + b) % 26)


def decrypt_text(text, a, b):
    validate_key(a, b, 26)
    a_inv = mod_inverse(a, 26)
    return _transform_text(text, lambda c: (a_inv * (c - b)) % 26)


# ---------------------------------------------------------------
# 4. Format output ciphertext (2 format sesuai soal)
# ---------------------------------------------------------------
def format_no_spaces(ciphertext):
    """Ciphertext tanpa spasi (hanya huruf, huruf kapital)."""
    return "".join(ch for ch in ciphertext if ch.isalpha()).upper()


def format_groups_of_5(ciphertext):
    """Ciphertext dikelompokkan per 5 huruf, dipisah spasi."""
    s = format_no_spaces(ciphertext)
    return " ".join(s[i:i + 5] for i in range(0, len(s), 5))


# ---------------------------------------------------------------
# 5. Byte-level (mod 256) - untuk file; dipanggil Anggota 2
# ---------------------------------------------------------------
def encrypt_bytes(data, a, b):
    validate_key(a, b, 256)
    return bytes((a * x + b) % 256 for x in data)


def decrypt_bytes(data, a, b):
    validate_key(a, b, 256)
    a_inv = mod_inverse(a, 256)
    return bytes((a_inv * (x - b)) % 256 for x in data)


if __name__ == "__main__":
    c = encrypt_text("HELLO", 5, 8)
    print("Enkripsi HELLO (a=5,b=8):", c)
    print("Dekripsi               :", decrypt_text(c, 5, 8))
    print("Grup 5                 :", format_groups_of_5("Attack at dawn now"))
