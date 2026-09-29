"""
app.py - Web GUI Affine Cipher (Flask)
Jembatan antara tampilan web (index.html) dan core logic (affine_core.py).
"""
import os
import re
from io import BytesIO

from flask import Flask, jsonify, render_template, request, send_file

import affine_core as core  # <-- SAMBUNGAN KE CORE LOGIC (Anggota 1)

app = Flask(__name__)
MAGIC = b"AFF1"  # penanda file hasil enkripsi aplikasi ini


def read_key():
    """Ambil kunci a dan b dari form. Error -> ValueError."""
    try:
        return int(request.form["a"]), int(request.form["b"])
    except (KeyError, ValueError):
        raise ValueError("Kunci a dan b harus diisi dengan bilangan bulat.")


@app.get("/")
def index():
    return render_template("index.html", valid_a=core.VALID_A_26)


@app.post("/api/text")
def api_text():
    """Enkripsi/dekripsi teks yang diketik."""
    try:
        a, b = read_key()
        text = request.form.get("text", "")
        if request.form.get("mode") == "encrypt":
            result = core.encrypt_text(text, a, b)        # <-- core
        else:
            result = core.decrypt_text(text, a, b)        # <-- core
        return jsonify(ok=True, result=result,
                       no_space=core.format_no_spaces(result),   # <-- core
                       groups=core.format_groups_of_5(result))   # <-- core
    except ValueError as e:  # termasuk KeyError_ dari core
        return jsonify(ok=False, error=str(e)), 400


@app.post("/api/file")
def api_file():
    """Enkripsi/dekripsi file byte-level (semua jenis file)."""
    try:
        a, b = read_key()
        f = request.files.get("file")
        if not f or not f.filename:
            raise ValueError("Pilih file terlebih dahulu.")
        data = f.read()
        name, ext = os.path.splitext(os.path.basename(f.filename))

        if request.form.get("mode") == "encrypt":
            ext_b = ext.encode()[:255]
            # Header: MAGIC + panjang ekstensi + ekstensi asli, lalu byte terenkripsi
            out = MAGIC + bytes([len(ext_b)]) + ext_b + core.encrypt_bytes(data, a, b)
            download = name + ".dat"
        else:
            if not data.startswith(MAGIC):
                raise ValueError("Bukan file hasil enkripsi dari aplikasi ini.")
            n = data[4]
            orig_ext = re.sub(r"[^A-Za-z0-9.]", "", data[5:5 + n].decode(errors="ignore"))
            out = core.decrypt_bytes(data[5 + n:], a, b)   # <-- core
            download = "hasil_dekripsi" + orig_ext
        return send_file(BytesIO(out), as_attachment=True, download_name=download)
    except ValueError as e:
        return jsonify(ok=False, error=str(e)), 400


if __name__ == "__main__":
    app.run(debug=True)
