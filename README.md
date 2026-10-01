# 🔐 Kriptosistem & Kriptanalisis: Affine Cipher

Repositori ini berisi implementasi algoritma **Affine Cipher** berbasis antarmuka web (GUI) menggunakan Flask (Python), serta dokumentasi hasil kriptanalisis (*Frequency Analysis*) untuk memecahkan sandi tanpa mengetahui kunci awal. Proyek ini disusun untuk memenuhi Tugas Mata Kuliah Kriptografi.

## 👥 Anggota Kelompok 6

| Nama | NIM | Tanggung Jawab |
| :--- | :--- | :--- |
| **Aprillia Wulandari** | L0124040 | Frontend, File Handling (Byte-level), Integrasi Web |
| **Saskya Aliya Azizah** | L0124076 | Frequency Analysis, Kriptanalisis |
| **Calista Salsabila** | L0124092 | Kriptanalisis, Testing, Laporan, GitHub & Dokumentasi |
| **Queen Nika Prahara Mutiara Phasya** | L0124115 | Core Logic (Enkripsi/Dekripsi, Extended Euclidean) |

---

## ✨ Fitur Utama

Sistem web ini berfokus pada pengimplementasian penuh **Affine Cipher** dengan fitur-fitur berikut:
- **Enkripsi & Dekripsi Teks (Mod 26):** Memproses karakter alfabet (A-Z) dengan output format teks tanpa spasi dan format grup 5 huruf.
- **Enkripsi & Dekripsi File Biner (Mod 256):** Memproses manipulasi dokumen di tingkat *byte* (mendukung gambar `.jpg`, dokumen `.docx`, audio, dll.) tanpa menyebabkan korupsi data (*file corrupted*).
- **Validasi Kunci Otomatis (Extended Euclidean):** Sistem akan menolak dan memberikan notifikasi *error* apabila pengguna memasukkan kunci $a$ yang tidak saling prima (koprima) dengan modulus (26 atau 256).

---

## 🛠️ Teknologi yang Digunakan

- **Backend:** Python 3.x, Flask
- **Frontend:** HTML, CSS, Vanilla JS
- **Core Cryptography:** Modul kustom `affine_core.py` (Math, Byte Manipulation)

---

## 🚀 Cara Instalasi dan Penggunaan

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi web secara lokal:

### 1. Persiapan (*Prerequisites*)
Pastikan Python telah terinstal. Jika belum, unduh di [python.org](https://www.python.org/).

### 2. Clone Repositori
```bash
git clone [https://github.com/QueenNikaPraharaMutiaraPhasya/affine_web.git]
cd affine_web