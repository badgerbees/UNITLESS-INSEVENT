Gaya Desain Global: Modern, Flat UI, bersih, ramah (desain yang menyentuh hati dan mudah digunakan oleh ibu hamil).Font Primer (Judul/Header): 'Manrope' (image_3.png)
Font Sekunder (Bodi/Detail): 'Inter' (image_2.png)
Palet Warna Utama (Palette 1 - Mode Mela/Ibu):

Primary: Merah Muda (Pink) image_0.png

Background: Putih Gading image_0.png

Surface/Card: Putih Murni image_0.png

Text Primary: Abu-abu Gelap image_0.png

Alert/Danger: Merah Tua image_0.pngPalet Warna Alternatif (Palette 2 - Mode Suami/Pendamping):

Primary: Ungu Muda image_1.png

Background: Putih Gading image_1.png

Surface/Card: Putih Murni image_1.png

Text Primary: Abu-abu Gelap image_1.png

Alert/Danger: Ungu Tua image_1.png

Instruksi Figma Make:

Buatlah file Figma baru dengan struktur desain dan interaksi prototyping yang detail untuk tujuh layar aplikasi mobile utama beserta alur penggunanya. Gunakan visualisasi yang ramah dengan ilustrasi buah untuk perkembangan janin.

Master Screen 1: Dashboard Ibu (Mode Mela - Palette 1)
Sebuah dashboard harian terpersonalisasi. Header berisi logo 'Mela', avatar profil, dan notifikasi. Fitur utama:

Kalkulator HPL & Usia Kehamilan: Kartu info HPL dan usia kandungan aktif dalam format Minggu + Hari, didasarkan pada input tanggal HPHT/USG dokter.

Adaptive Daily/Weekly Timeline: Sebuah timeline visual harian dan mingguan yang menunjukkan perkembangan organ janin, estimasi berat/panjang, dan ilustrasi ukuran berbasis komparasi visual (contoh: sebesar buah alpukat).

Edukasi Perubahan Tubuh Ibu: Seksi tips harian mengenai fase perubahan hormonal, fisik, dan emosional sesuai trimester kehamilan.

Bottom Navigation Menu: Menu navigasi utama (Mela, Kalender, Laporan, Sumber Daya).

Master Screen 2: Dashboard Suami (Mode Pendamping - Palette 2)
Tampilan layar setelah sinkronisasi akun berhasil. Fitur utama:

Layar Pairing: Opsi "Masuk sebagai Pendamping" dan formulir input Kode Sinkronisasi Istri.

Dashboard Khusus Suami: Seksi tips harian "Apa yang Bisa Suami Lakukan" berisi panduan tindakan konkrit untuk mendampingi istri sesuai usia kehamilan.

Jadwal Bersama: Akses ke jadwal periksa kehamilan (ANC) dan riwayat konsumsi vitamin harian istri. Status kesehatan istri yang sinkron secara real-time.

Master Screen 3: Pemantauan Kesehatan Mandiri & AI Risk Engine (Mode Mela - Palette 1)
Layar log kesehatan harian. Fitur utama:

Log Gejala Harian: Formulir pilihan ganda untuk mencatat gejala (mual, pusing, bengkak kaki, bercak darah, dll.).

AI Risk Evaluation: Sebuah label risiko visual (Hijau: Normal, Kuning: Perhatian, Merah: Tanda Bahaya) dengan sistem logika evaluasi AI.

Hijau: Tips kenyamanan harian.

Kuning: Instruksi penanganan mandiri dan saran untuk ANC berikutnya.

Merah: Layar Alert Mode yang menampilkan tindakan darurat, nomor RS, dan tautan ke Checklist Tas.

Seksi Alat Mandiri: Tombol akses cepat ke Kick Counter dan Kontraksi Instan.

Kick Counter: Tombol one-tap 'Kick-of-10', timer 2 jam otomatis dengan target alarm gerakan.

Kontraksi Instan: Tombol Start/Stop, kalkulasi otomatis Frekuensi dan Durasi, algoritma deteksi Aturan 5-1-1 (Fase Persalinan Aktif).

Master Screen 4: Status Persalinan Aktif (Aturan 5-1-1) & Emergency Relay (Mode Alerts)
Sebuah keadaan peringatan aktif. Fitur utama:

Layar Alert Ibu: Peringatan Merah 5-1-1 "Saatnya ke Rumah Sakit/Klinik", tombol navigasi ke rumah sakit rujukan, dan tautan cepat ke Packing List.

Notifikasi Suami: Layar Push Notification besar dengan prioritas tinggi pada layar kunci dan dalam aplikasi dengan alarm bersuara nyaring. Menampilkan informasi spesifik pemicu darurat: Gejala Tanda Bahaya Merah tercatat, atau Kontraksi 5-1-1 resmi terpenuhi. Tombol konfirmasi dan siapkan kendaraan.

Master Screen 5: Prep, Logistics & Reminders (Mode Mela - Palette 1)
Modul daftar periksa interaktif dan jadwal. Fitur utama:

Packing List Interaktif: Checklist perlengkapan tas persalinan terbagi dalam kategori: Ibu, Bayi, Pendamping (Dokumen). Progres tracker kelengkapan (%) real-time.

Reminders & Schedule: Tracker jadwal Antenatal Care (ANC) sesuai rekomendasi standar medis. Alarm harian minum vitamin/suplemen (Asam Folat, Zat Besi, Kalsium) dengan tombol konfirmasi cepat "Sudah Minum".

Master Screen 6: Laporan Medis & Ekspor PDF (Mode Mela - Palette 1)
Modul Laporan Medis. Fitur utama:

Filter Tanggal: Pilihan rentang waktu laporan (1 Bulan Terakhir, Trimester 2, Seluruh Masa Kehamilan).

Generasi PDF: Mengompilasi tren vital, log gejala harian, log gerakan janin, dan grafik rekaman kontraksi menjadi berkas PDF terstruktur (Clinician Summary). Menampilkan tombol 'Download PDF' dan QR Code validasi untuk pendaftaran RS/IGD persalinan.

Master Screen 7: Pasca-Melahirkan (Transisi) & Administrasi (Lokal Indo)
Layar transisi pasca-persalinan. Fitur utama:

Pivot UI: Tombol "Bayi Telah Lahir" dengan input tanggal/waktu. Layar beralih secara otomatis dari Mode Kehamilan ke Mode Pasca-Melahirkan (Postpartum).

Panduan Administrasi Lokal (Indonesia): Modul edukasi dan checklist interaktif langkah demi langkah lokal: Surat Lahir (dokumen RS/Bidan), Administrasi Dukcapil (Akta Kelahiran, Pembaruan KK) dengan alur pengajuan, dan Pendaftaran BPJS Kesehatan Bayi Baru Lahir sebelum tenggat 28 hari.

Master User Flows & Interaksi Prototyping Figma:
Hubungkan layar-layar tersebut dengan alur pengguna berikut di Figma Prototyping Mode:

Flow 1 (Onboarding & Sync): Pendaftaran Ibu -> Kalkulasi HPL -> Generasi Kode Pairing -> Layar Login Suami -> Input Kode -> Dashboard Suami yang disinkronkan.

Flow 2 (Daily Health & Emergency Relay): Log Gejala Harian -> Evaluasi AI (Status Tanda Bahaya Merah) -> Layar Alert Ibu -> Layar Push Notification Suami (Emergency Relay).

Flow 3 (Contraction & 5-1-1 Deteksi): Pencatatan Kontraksi -> Kalkulasi 5-1-1 -> Layar Alert Ibu (Ke Rumah Sakit) -> Layar Push Notification Suami (Hospital Ready).

Flow 4 (Medical Reporting): Buka Modul Laporan -> Filter Rentang Tanggal -> Proses Rendering PDF -> Layar Download PDF/QR Code.

Flow 5 (Postpartum Transition & Admin Lokal): Tekan "Bayi Telah Lahir" -> Pivot UI Mode Pasca-Melahirkan -> Buka Modul Administrasi Lokal -> Langkah-langkah Administrasi (Surat Lahir, Dukcapil, BPJS).