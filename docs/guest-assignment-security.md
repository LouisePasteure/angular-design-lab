# Keamanan akses guest penugasan

Implementasi akses guest Joki Tugass saat ini adalah prototipe frontend-only. Assignment, token digest, status, dan rate-limit berada di state browser; hash token di browser tidak menjadikannya batas keamanan. Jangan gunakan implementasi ini untuk melindungi dokumen produksi.

Sebelum rilis produksi, pindahkan seluruh validasi dan otorisasi ke backend:

- Verifikasi token di server dan simpan digest menggunakan secret server-side.
- Terapkan rate limiting server-side berdasarkan IP dan identitas, serta cegah enumeration dengan respons generik.
- Tukarkan token valid dengan session terbatas-satu-assignment melalui cookie `HttpOnly`, `Secure`, dan `SameSite`.
- Periksa status, expiry, revocation, kepemilikan WhatsApp, dan hak assignment pada setiap permintaan.
- Otorisasi setiap unduhan di server dan terbitkan signed download URL yang singkat masa berlakunya.
- Catat pembuatan, penggunaan, rotasi, pencabutan, dan perubahan akses pada audit log server.
- Terapkan expiry dan revocation token/session secara server-side; jangan mengandalkan sessionStorage atau validasi route client.
- Jangan mencatat token mentah di log, URL, analitik, atau pesan error.

Guest session prototype menggunakan `sessionStorage` dan berlaku maksimal 30 menit. Ini hanya membantu demonstrasi alur UI, bukan kontrol akses yang dapat dipercaya.
