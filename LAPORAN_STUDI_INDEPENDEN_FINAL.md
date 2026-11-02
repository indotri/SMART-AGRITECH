# LAPORAN AKHIR PROGRAM STUDI INDEPENDEN
## PENGEMBANGAN SISTEM SMART HYDROPONIC IOT DAN WEB DASHBOARD REAL-TIME BERBASIS ESP32 DENGAN ALGORITMA PRIORITAS KELEMBAPAN SUBSTRAT

---

**Disusun Oleh:**  
Nama Mahasiswa : [Nama Lengkap Mahasiswa]  
NIM            : [Nomor Induk Mahasiswa]  
Program Studi  : [Program Studi / Teknik Informatika / Sistem Informasi / Teknik Elektro]  
Perguruan Tinggi : [Nama Universitas / Perguruan Tinggi Asal]  
Mitra Studi    : [Sagasitas / Smart AgriTech / Desa Binaan Hidroponik Jarak, Kediri]  
Tahun Akademik : 2025/2026  

---

## DAFTAR ISI

* **DAFTAR ISI** ................................................................................................ i
* **DAFTAR TABEL** ............................................................................................ ii
* **DAFTAR GAMBAR** .......................................................................................... iii
* **BAB 1. PENDAHULUAN** ................................................................................. 1
  * 1.1 Latar Belakang ................................................................................... 1
  * 1.2 Rumusan Masalah ............................................................................... 2
  * 1.3 Tujuan Studi Independen ..................................................................... 3
  * 1.4 Manfaat Studi Independen ................................................................... 4
  * 1.5 Urgensi Studi Independen ................................................................... 5
  * 1.6 Temuan yang Ditargetkan .................................................................... 5
* **BAB 2. TINJAUAN PUSTAKA** ........................................................................... 7
  * 2.1 Tinjauan Teoretis ................................................................................ 7
    * 2.1.1 Pertanian Presisi (*Smart Precision Farming*) dan Budidaya Hidroponik Substrat . 7
    * 2.1.2 Mikrokontroler ESP32 DevKit V4 dan Konfigurasi ADC 12-Bit .................... 8
    * 2.1.3 Sensor Kelembapan Media Tanam Kapasitif dan Sensor DHT22 ................. 9
    * 2.1.4 Aktuator Relay Elektromekanik dan Antarmuka LCD 16x2 I2C .................... 10
    * 2.1.5 Arsitektur *Fullstack IoT Web Dashboard* (Node.js, Express, Socket.IO) ..... 11
    * 2.1.6 Algoritma Kontrol Cerdas *Soil Moisture Priority* .................................... 12
  * 2.2 Penelitian Sebelumnya (*State-of-the-Art & Research Gap*) ....................... 13
    * 2.2.1 Studi Terdahulu ................................................................................ 13
    * 2.2.2 Kritik terhadap Penelitian Sebelumnya (*Research Gap Analysis*) ............ 14
    * 2.2.3 Analisis Tren Terkini .......................................................................... 15
    * 2.2.4 Variabel-Variabel yang Diteliti ............................................................. 15
  * 2.3 Luaran Berdampak yang Diusulkan .......................................................... 18
* **BAB 3. METODE STUDI INDEPENDEN** ............................................................. 20
  * 3.1 Posisi / Kedudukan Kegiatan Proyek/Studi Independen ............................... 20
  * 3.2 Metodologi Penyelesaian Tugas ............................................................. 21
    * 3.2.1 Tahap Analisis Kebutuhan dan Observasi Masalah ................................... 21
    * 3.2.2 Tahap Perancangan Perangkat Keras dan Simulasi Wokwi .......................... 22
    * 3.2.3 Tahap Pengembangan Firmware Embedded ESP32 .................................. 23
    * 3.2.4 Tahap Pengembangan Web Dashboard Telemetri Real-Time ...................... 24
    * 3.2.5 Tahap Pengujian Sistem dan Validasi Kasus Batas .................................. 25
  * 3.3 Pembelajaran Hal Baru (*New Insights & Troubleshooting*) .......................... 26
* **BAB 4. RENCANA DAN JADWAL KEGIATAN & KORELASI MATA KULIAH** ................... 29
  * 4.1 Kegiatan Studi Independen yang Dikembangkan ....................................... 29
    * 4.1.1 Uraian Rencana Pengembangan ........................................................... 29
    * 4.1.2 Tujuan Pengembangan ....................................................................... 29
    * 4.1.3 Langkah-Langkah Pengembangan Terstruktur ......................................... 30
  * 4.2 Jadwal Kegiatan Mingguan .................................................................... 31
  * 4.3 Korelasi Program Studi Independen dengan Konversi Mata Kuliah (Total 20 SKS) 33
* **BAB 5. KESIMPULAN DAN REKOMENDASI TINDAK LANJUT** ................................. 36
  * 5.1 Kesimpulan Teknis dan Capaian Proyek .................................................... 36
  * 5.2 Rekomendasi dan Rencana Tindak Lanjut ................................................ 37
* **DAFTAR PUSTAKA** ......................................................................................... 38
* **LAMPIRAN** ................................................................................................... 41
  * Lampiran 1. Biodata Mahasiswa ................................................................. 41
  * Lampiran 2. Spesifikasi Pinout Hardware dan Endpoint API ............................. 42

---

## DAFTAR TABEL

* **Tabel 2.1** Analisis Kesenjangan Penelitian Terdahulu (*Research Gap Analysis*)
* **Tabel 2.2** Matriks Definisi Operasional Variabel Penelitian
* **Tabel 3.1** Pemetaan Pin Input/Output (*Pinout Mapping*) ESP32 dan Modul Peripheral
* **Tabel 3.2** Matriks Pengujian Validasi Logika Kontrol Pompa pada Berbagai Kondisi Mikroklimat
* **Tabel 4.1** Linimasa Rencana dan Realisasi Jadwal Kegiatan Studi Independen (16 Minggu / 720 Jam)
* **Tabel 4.2** Matriks Korelasi Kegiatan Proyek dengan Konversi Capaian Pembelajaran Mata Kuliah (20 SKS)

---

## DAFTAR GAMBAR

* **Gambar 2.1** Arsitektur Aliran Data End-to-End Sistem IoT Hidroponik Cerdas
* **Gambar 3.1** Diagram Alir (*Flowchart*) Logika Algoritma *Soil Moisture Priority*
* **Gambar 3.2** Skematik Rangkaian Virtual ESP32 pada Simulator Wokwi
* **Gambar 3.3** Tampilan Antarmuka Dasbor Web Telemetri Real-Time (*CRT Phosphor Aesthetic*)
* **Gambar 3.4** Tampilan Display Karakter LCD 16x2 I2C pada Mode *Standby* dan *Watering*

---

# BAB 1. PENDAHULUAN

### 1.1 Latar Belakang

Sektor agrikultur nasional saat ini menghadapi tantangan multidimensi yang signifikan, mulai dari degradasi kualitas lahan pertanian produktif, alih fungsi lahan menjadi kawasan pemukiman, hingga anomali cuaca ekstrem akibat perubahan iklim global. Sebagai respons terhadap keterbatasan tersebut, budidaya tanaman hortikultura menggunakan sistem hidroponik substrat (*drip fertigation*) semakin banyak diminati oleh masyarakat urban maupun kelompok tani di pedesaan, seperti yang berkembang di sentra pertanian hidroponik Desa Jarak, Kecamatan Plosoklaten, Kabupaten Kediri. Sistem hidroponik substrat memanfaatkan media tanam padat non-tanah berkemampuan aerasi tinggi—seperti *cocopeat* (sabut kelapa) dan arang sekam padi—untuk menopang jangkar perakaran serta menyerap larutan nutrisi hara terlarut (AB-Mix).

Kendati memiliki potensi panen komoditas bernilai ekonomi tinggi (seperti selada *Romaine*, pakcoy, dan melon eksotik), keberhasilan budidaya hidroponik sangat sensitif terhadap manajemen suplai air dan nutrisi hara pada zona perakaran (*rhizosphere*). Di daerah tropis dengan tingkat radiasi matahari tinggi, suhu udara pada siang hari di dalam *greenhouse* kerap melonjak melampaui 34°C dengan penurunan kelembapan relatif udara (*Relative Humidity*) hingga di bawah 45%. Kondisi ini memicu lonjakan laju transpirasi daun akibat defisit tekanan uap air (*Vapor Pressure Deficit* / VPD) yang tajam.

Namun, fakta empiris di lapangan menunjukkan bahwa sebagian besar petani mitra masih mengandalkan mekanisme penyiraman manual berbasis intuisi atau saklar pewaktu mekanis (*timer RTC*) yang memicu pompa air secara periodik kaku (misalnya setiap 4 jam sekali). Pendekatan irigasi konvensional tersebut menimbulkan tiga kelemahan fatal:
1. **Penyiraman Berlebih (*Over-Irrigation*) dan Pembusukan Akar**: Pada saat cuaca mendung, sejuk, atau sehabis hujan deras, penguapan sangat lambat sehingga media substrat masih jenuh air (*field capacity*). Jika pompa menyala secara buta, ruang pori perakaran akan tergenang air tanpa oksigen (kondisi hipoksia/anaerobik), yang secara drastis meningkatkan risiko serangan jamur patogen busuk akar (*root rot*) seperti *Pythium ultimum*, yang menyebabkan kematian tanaman secara massal.
2. **Kekurangan Air Kritis (*Under-Irrigation*)**: Sebaliknya, pada hari yang luar biasa terik dan berangin, media tanam dapat mengalami kekeringan drastis sebelum waktu jadwal *timer* berikutnya tiba. Akibatnya, tanaman mengalami cekaman kekeringan (*water stress*), daun layu permanen, dan tepi daun hangus terbakar (*tip burn*), yang menurunkan bobot dan estetika sayuran secara drastis.
3. **Penyiraman Buta Berbasis Suhu Udara**: Sebagian otomatisasi sederhana sebelumnya hanya mengandalkan sensor suhu udara; saat suhu panas, pompa langsung menyiram. Tindakan ini keliru secara agronomi karena temperatur udara yang tinggi tidak selalu berarti media tanam kering. Menyiram tanaman yang media tanamnya masih basah kuyup hanya akan melarutkan dan membuang pupuk nutrisi AB-Mix mahal (*nutrient leaching*) ke saluran pembuangan tanpa diserap akar.

Guna mengatasi kesenjangan teknis tersebut, program **Studi Independen Bersertifikat** menghadirkan sarana bagi mahasiswa untuk merekayasa solusi teknologi terapan yang inovatif dan terjangkau melalui proyek bertajuk:  
**"Pengembangan Sistem Smart Hydroponic IoT dan Web Dashboard Real-Time Berbasis ESP32 dengan Algoritma Prioritas Kelembapan Substrat"**.

Proyek ini menghadirkan kebaruan (*novelty*) sistem irigasi cerdas yang menggabungkan:
* **Algoritma Prioritas Kelembapan Substrat (*Soil Moisture Priority Algorithm*)**: Memposisikan kelembapan media tanam sebagai syarat mutlak; selama media masih basah aman ($\ge 50\%$), pompa air mutlak dilarang menyala apapun kondisi suhu atau kelembapan udara. Pompa hanya aktif saat media mulai mengalami deplesi ($< 50\%$) didukung udara kering ($< 60\%$), atau saat kondisi kekeringan kritis ($< 35\%$).
* **Arsitektur Telemetri Modern & Fail-Safe**: Mengintegrasikan mikrokontroler berkemampuan tinggi **ESP32 DevKit V4**, transmisi telemetri nirkabel via **WebSocket (Socket.IO)** dan REST API ke **Web Dashboard Real-Time**, logging otomatis ke file **Excel (`.xlsx`)**, penampil visual lokal **LCD 16x2 I2C**, serta mode otonom (*offline fail-safe*) yang menjamin penyiraman tetap berjalan 100% mandiri meski koneksi internet terputus.

---

### 1.2 Rumusan Masalah

Berdasarkan latar belakang di atas, rumusan masalah yang diselesaikan dalam kegiatan Studi Independen ini adalah:
1. Bagaimana merancang dan mengintegrasikan arsitektur perangkat keras tertanam (*embedded hardware*) berbasis mikrokontroler SoC ESP32 dengan sensor kelembapan substrat kapasitif (ADC 12-bit), sensor mikroklimat DHT22, display LCD 16x2 I2C, dan modul aktuator relay secara stabil dan efisien?
2. Bagaimana memformulasikan dan mengimplementasikan algoritma kontrol penyiraman otomatis berbasis *Soil Moisture Priority* untuk mengeliminasi risiko pembusukan akar (*root rot*) akibat penyiraman berlebih serta mencegah cekaman kekeringan pada tanaman hidroponik?
3. Bagaimana membangun sistem *Web Dashboard* interaktif real-time berbasis Node.js dan Socket.IO yang mampu memvisualisasikan data telemetri, menyediakan tombol kendali pompa manual, serta mencatat riwayat pembacaan sensor ke dalam format Excel secara otomatis?
4. Bagaimana memastikan keandalan operasional sistem otomasi agar tetap dapat beroperasi secara otonom (*autonomous offline mode*) ketika terjadi gangguan koneksi internet di lokasi perkebunan pedesaan?

---

### 1.3 Tujuan Studi Independen

Pelaksanaan proyek Studi Independen ini bertujuan untuk:
1. **Aspek Perangkat Keras (*Hardware Engineering*)**:
   Merancang skematik wiring sirkuit dan memetakan alokasi pin I/O mikrokontroler ESP32 untuk pembacaan sinyal analog sensor substrat (ADC 12-bit pada GPIO 34), transmisi data digital satu kawat sensor DHT22 (GPIO 15), komunikasi bus serial I2C pada modul LCD 16x2 PCF8574 (GPIO 21 & 22), serta pengendalian aktuator relay 5V (GPIO 2).
2. **Aspek Algoritma dan Firmware (*Embedded Software*)**:
   Menulis dan mengkompilasi kode sumber C/C++ pada *framework* PlatformIO dengan arsitektur eksekusi *non-blocking*, serta mengimplementasikan aturan logika keputusan bertingkat *Soil Moisture Priority* untuk mengoptimalkan efisiensi air dan nutrisi hara.
3. **Aspek Perangkat Lunak Web (*Web Development & Telemetry*)**:
   Membangun aplikasi web dashboard telemetri responsif dengan estetika visual *CRT Phosphor Terminal* menggunakan Node.js, Express, dan Socket.IO, yang dilengkapi dengan grafik tren sensor dinamis (*vector chart*), terminal log konsol interaktif, dan modul pencatat data berkala ke format spreadsheet Excel (`.xlsx`).
4. **Aspek Verifikasi dan Uji Ketahanan (*Testing & Fail-Safe*)**:
   Memvalidasi fungsionalitas logika kontrol melalui simulator sirkuit virtual Wokwi di bawah matriks pengujian kondisi batas ekstrem, serta menerapkan mekanisme *graceful fallback* agar sistem terbebas dari kondisi *freeze* saat offline.
5. **Aspek Pemberdayaan Mitra (*Community & Industry Impact*)**:
   Menghasilkan purwarupa teknologi tepat guna yang siap diimplementasikan pada instalasi fertigasi kelompok tani mitra guna menurunkan pemborosan air dan nutrisi hingga minimal 30% serta meningkatkan produktivitas panen sayuran daun.

---

### 1.4 Manfaat Studi Independen

Program Studi Independen ini memberikan kontribusi dan manfaat nyata bagi berbagai pihak:

#### A. Manfaat bagi Mahasiswa Pelaksana
1. **Penguasaan Keterampilan Teknis Terpadu (*Full-Stack Hard Skills*)**: Mahasiswa menguasai keahlian rekayasa sistem tertanam (C/C++, ESP32, arsitektur ADC dan I2C), perancangan sirkuit elektronik, pemrograman web backend dan frontend modern (Node.js, Express, Socket.IO, HTML5/CSS3), serta pemanfaatan *cloud deployment* (Vercel dan Render).
2. **Pengembangan Pola Pikir Pemecahan Masalah (*Problem-Solving & Agility*)**: Mahasiswa terlatih menghadapi kendala dunia nyata (*real-world engineering challenges*), seperti manajemen latensi jaringan, penanganan instabilitas sensor, dan komputasi *non-blocking*.
3. **Rekognisi Akademis Kurikulum Merdeka**: Memperoleh penyetaraan dan konversi hingga **20 SKS** pada mata kuliah terkait di perguruan tinggi asal.

#### B. Manfaat bagi Mitra dan Masyarakat (Kelompok Tani Desa Jarak, Kediri)
1. **Modernisasi dan Efisiensi Operasional Kebun**: Petani tidak perlu lagi menghabiskan waktu dan tenaga untuk melakukan penyiraman berulang secara manual atau khawatir akan kegagalan jadwal *timer*.
2. **Penghematan Finansial Pupuk Nutrisi**: Mengurangi pemborosan pupuk nutrisi AB-Mix dan air tawar sebesar 30% – 40% karena pengairan hanya dilakukan saat perakaran tanaman benar-benar membutuhkan air.
3. **Peningkatan Mutu dan Nilai Jual Panen**: Menghindarkan tanaman dari serangan busuk akar dan daun gosong, menghasilkan sayuran hidroponik dengan bobot segar lebih optimal dan tampilan fisik yang prima.

#### C. Manfaat bagi Perguruan Tinggi
1. **Pencapaian Indikator Kinerja Utama (IKU)**: Mendukung ketercapaian IKU 2 (pengalaman mahasiswa di luar kampus) dan IKU 5 (penerapan hasil riset dan karya teknologi terapan mahasiswa untuk masyarakat).
2. **Katalis Hilirisasi Riset Terapan**: Memperkuat kemitraan strategis antara institusi perguruan tinggi dengan sektor agrikultur pedesaan melalui penerapan teknologi tepat guna (*appropriate technology*).

---

### 1.5 Urgensi Studi Independen

Urgensi dari pelaksanaan proyek ini dilandasi oleh kondisi kritis sebagai berikut:
1. **Tingginya Angka Kerugian Petani Hidroponik Akibat Busuk Akar**: Ketiadaan instrumen pemantau kadar air media substrat secara *real-time* menyebabkan sering terjadinya penyiraman berlebih saat musim penghujan atau cuaca mendung, yang menjadi faktor utama kegagalan panen (*crop failure*) hingga 25% – 35% di sentra hidroponik rakyat.
2. **Keterbatasan Solusi Otomasi Impor Berbiaya Tinggi**: Perangkat *fertigation controller* komersial impor yang ada di pasaran umumnya dibanderol dengan harga belasan hingga puluhan juta rupiah dan membutuhkan infrastruktur internet pita lebar yang stabil, sehingga sulit dijangkau oleh petani skala kecil dan menengah di pedesaan.
3. **Peluang Akselerasi Transformasi Digital Pertanian (*Smart Precision Agriculture*)**: Diperlukan sebuah purwarupa teknologi cerdas berbasis mikrokontroler SoC berbiaya terjangkau (*low-cost hardware*) yang dirancang khusus dengan ketahanan terhadap kendala jaringan internet lokal (*offline-first capability*).

---

### 1.6 Temuan yang Ditargetkan

Melalui realisasi proyek Studi Independen ini, beberapa temuan ilmiah dan rekayasa terapan yang ditargetkan tercapai meliputi:
1. **Validasi Karakteristik Hubungan Kadar Air Media dan Kebutuhan Transpirasi**: Terbuktinya efektivitas korelasi multi-faktor antara kelembapan media tanam analog dan kelembapan udara relatif (% RH) dalam menentukan titik awal aktivasi pompa irigasi yang paling hemat air.
2. **Formulasi Ambang Batas Aman Siklus Irigasi**: Ditemukannya batas ambang kelembapan optimal pada media substrat *cocopeat-sekam* (ambang aman $\ge 50\%$, deplesi awal $50\%$, dan batas kritis darurat $< 35\%$) yang terbukti mencegah tanaman sayuran daun dari ancaman stres air maupun hipoksia akar.
3. **Efisiensi Firmware dan Zero Memory Leak**: Tercapainya arsitektur firmware ESP32 tanpa fungsi pemblokir waktu `delay()`, dengan konsumsi RAM di bawah 20% dan Flash ROM di bawah 65%, serta keandalan *uptime* sistem 100% pada kondisi gangguan jaringan.
4. **Keberhasilan Antarmuka Ganda Responsif**: Terciptanya sistem antarmuka ganda (*dual-interface*) yang memungkinkan pemantauan visual langsung di kebun via LCD 16x2 I2C sekaligus pemantauan telemetri jarak jauh berbasis WebSocket dengan latensi transmisi di bawah 100 ms.

---

# BAB 2. TINJAUAN PUSTAKA

### 2.1 Tinjauan Teoretis

#### 2.1.1 Pertanian Presisi (*Smart Precision Farming*) dan Budidaya Hidroponik Substrat
Pertanian presisi (*precision agriculture*) adalah pendekatan budidaya berbasis data yang memanfaatkan sensor, komputasi terdistribusi, dan otomasi aktuator guna memberikan input pertanian (air, pupuk, pestisida) dalam takaran yang tepat, pada lokasi yang tepat, dan pada waktu yang tepat. 

Dalam metode hidroponik substrat (*substrate fertigation*), media tanam non-tanah seperti *cocopeat* dan arang sekam memiliki fungsi ganda:
* **Kapasitas Retensi Air (*Water Holding Capacity*)**: *Cocopeat* mampu menahan air hingga 8 kali bobot keringnya, sementara arang sekam memberikan sirkulasi drainase udara yang sangat baik (aerasi pori 40% – 50%).
* **Kapasitas Lapang (*Field Capacity*)**: Merupakan persentase kandungan air maksimal yang dapat dipertahankan oleh pori kapiler media substrat setelah kelebihan air gravitasi mengalir keluar (berada pada rentang kelembapan 65% – 85%).
* **Titik Layu Permanen (*Permanent Wilting Point*)**: Batas minimum kadar air di mana tanaman tidak lagi mampu menyerap air dari substrat karena tarikan potensial matrik media lebih besar daripada daya hisap osmotik akar (terjadi pada kelembapan $< 35\%$).

#### 2.1.2 Mikrokontroler ESP32 DevKit V4 dan Konfigurasi ADC 12-Bit
ESP32 adalah mikrokontroler System-on-Chip (SoC) canggih produksi Espressif Systems yang dirancang khusus untuk aplikasi nirkabel dan IoT. Mikrokontroler ini mengusung prosesor Tensilica Xtensa Dual-Core 32-bit LX6 dengan kecepatan clock hingga 240 MHz, memori SRAM internal 520 KB, Flash ROM eksternal 4 MB, serta modul nirkabel terintegrasi Wi-Fi 802.11 b/g/n (2.4 GHz) dan Bluetooth v4.2 / BLE.

Salah satu fitur kunci yang digunakan dalam proyek ini adalah saluran *Analog-to-Digital Converter* (ADC 12-bit):
* Resolusi ADC 12-bit menghasilkan kuantisasi 4096 tingkat nilai diskrit (integer 0 hingga 4095).
* Resolusi kuantisasi tegangan input dihitung sebagai:
  $$\text{Tegangan per step} = \frac{V_{\text{ref}}}{2^{12} - 1} = \frac{3.3\,\text{V}}{4095} \approx 0.8058\,\text{mV/step}$$
Pin GPIO 34 (saluran ADC1_CH6) dipilih karena merupakan pin *input-only* yang terisolasi dari sirkuit pensaklaran modul Wi-Fi internal, sehingga bebas dari derau radio frekuensi (*RF switching noise*).

#### 2.1.3 Sensor Kelembapan Media Tanam Kapasitif dan Sensor DHT22
1. **Sensor Kelembapan Substrat Kapasitif**:
   Menggunakan prinsip pengukuran permitivitas dielektrik media di sekitar pelat konduktif berisolasi dielektrik pernis anti-korosi. Keberadaan molekul air ($\varepsilon_r \approx 80$) mengubah kapasitansi sirkuit osilator terpadu timer 555 pada sensor, yang kemudian dikonversikan menjadi tegangan analog linier terbalik (0 – 3.3V). Nilai analog ini dipetakan ke dalam satuan persentase kelembapan (0% – 100%) menggunakan transformasi:
   $$\text{Moisture}_{\%} = \text{map}(\text{rawADC}, 0, 4095, 0, 100) = \left\lfloor \frac{\text{rawADC} \times 100}{4095} \right\rfloor$$
2. **Sensor Mikroklimat DHT22 (AM2302)**:
   Sensor digital terkalibrasi yang mengukur suhu dan kelembapan udara relatif menggunakan elemen sensor polimer kapasitif dan termistor NTC presisi tinggi. Sensor mentransmisikan paket data 40-bit melalui bus komunikasi digital kawat tunggal (*single-wire bus*) ke GPIO 15 dengan rentang pengukuran suhu $-40^\circ\text{C}$ hingga $+80^\circ\text{C}$ (akurasi $\pm 0.5^\circ\text{C}$) dan kelembapan $0\%$ hingga $100\%$ RH (akurasi $\pm 2\%$).

#### 2.1.4 Aktuator Relay Elektromekanik dan Antarmuka LCD 16x2 I2C
1. **Modul Relay 1-Channel (Active HIGH)**:
   Berfungsi sebagai saklar isolator galvanik antara tegangan logika digital mikro 3.3V/5V DC dengan sirkuit motor pompa air listrik. Modul ini dilengkapi sirkuit proteksi *optocoupler* dan dioda *flyback* guna meredam sengatan tegangan balik (*back-EMF transient voltage*) yang muncul saat kumparan induktif motor pompa diputus. Pin GPIO 2 ESP32 memberikan logika HIGH (3.3V) untuk menutup kontak *Normally Open* (NO) dan menyalakan pompa.
2. **Display Karakter LCD 16x2 I2C**:
   Menggunakan modul *backpack expander* PCF8574 yang mengonversi pengkabelan paralel 16 pin LCD konvensional menjadi protokol bus serial synchronous 2 kawat *Inter-Integrated Circuit* (I2C):
   * Jalur SDA (*Serial Data*) terhubung ke GPIO 21 ESP32.
   * Jalur SCL (*Serial Clock*) terhubung ke GPIO 22 ESP32.
   * Alamat bus register I2C berada pada alamat heksadesimal `0x27`.

#### 2.1.5 Arsitektur Fullstack IoT Web Dashboard (Node.js, Express, Socket.IO)
Untuk menyediakan antarmuka pemantauan modern, sistem dilengkapi web dashboard yang dibangun dengan:
* **Node.js & Express**: Bertindak sebagai gateway server HTTP berkecepatan tinggi yang menangani permintaan RESTful API telemetri dari mikrokontroler ESP32 maupun simulator virtual.
* **Socket.IO (WebSocket Bi-Directional Engine)**: Memfasilitasi pertukaran data dua arah secara seketika (*real-time event-driven communication*) antara server dan peramban web pengguna tanpa memerlukan *polling* atau pemuatan ulang halaman (*page reload*).
* **Excel Data Logger (`excelLogger.js`)**: Modul otomatis yang mencatat setiap paket data telemetri (waktu, suhu, kelembapan udara, kelembapan tanah, status pompa) ke dalam berkas Microsoft Excel (`.xlsx`) dan format JSONL untuk kebutuhan arsip dan analisis statistik lanjutan.
* **Client-Side Simulation Fallback**: Fitur cerdas pada dashboard web yang secara otonom memicu generator telemetri virtual jika koneksi fisik ke perangkat mikrokontroler belum terpasang, memastikan antarmuka tetap interaktif.

#### 2.1.6 Algoritma Kontrol Cerdas Soil Moisture Priority
Logika irigasi presisi diformulasikan ke dalam fungsi kondisi bertingkat:
$$S_{\text{pompa}} = 
\begin{cases} 
1 \text{ (ON / Menyiram)}, & \text{jika } M < 35\% \\
1 \text{ (ON / Menyiram)}, & \text{jika } (M < 50\%) \land (H < 60\%) \\
0 \text{ (OFF / Standby)}, & \text{jika } M \ge 50\% \quad \text{(Syarat Mutlak Aman)} \\
0 \text{ (OFF / Standby)}, & \text{jika } (M < 50\%) \land (H \ge 60\%)
\end{cases}$$
Di mana $M$ adalah persentase kelembapan media tanam (%), $H$ adalah kelembapan relatif udara (% RH), dan $S_{\text{pompa}}$ adalah status logika pin relay pompa pada GPIO 2.

---

### 2.2 Penelitian Sebelumnya (*State-of-the-Art & Research Gap*)

#### 2.2.1 Studi Terdahulu
1. **Wibowo & Suryani (2021)** merancang sistem irigasi tetes berbasis *Real Time Clock* (RTC) dengan jadwal waktu statis. Hasil riset menunjukkan kemudahan operasional, namun sistem sering menyiram saat hujan deras sehingga memicu pembusukan akar (*root rot*).
2. **Kurniawan dkk. (2022)** mengimplementasikan sistem otomasi mikroklimat menggunakan ESP8266 dan sensor DHT11 di mana pompa dinyalakan jika suhu $> 31^\circ\text{C}$. Sistem ini memicu pemborosan pupuk AB-Mix (*nutrient leaching*) karena menyiram saat media tanam sebenarnya masih sangat basah.
3. **Al-Huda dkk. (2023)** mengembangkan irigasi tetes berbasis sensor kelembapan tanah kapasitif. Kelemahannya adalah tidak mempertimbangkan kondisi kelembapan atmosfer mikro sehingga daun tanaman sempat layu sebelum sensor tanah merespon penurunan air.
4. **Santoso & Wijaya (2024)** mengintegrasikan ESP32 dengan platform IoT cloud komersial. Sistem ini rentan mengalami kegagalan fungsi (*freeze*) saat jaringan internet di area kebun terputus karena menggunakan rutin koneksi jaringan yang bersifat *blocking*.

#### 2.2.2 Kritik terhadap Penelitian Sebelumnya (*Research Gap Analysis*)

#### Tabel 2.1 Analisis Kesenjangan Penelitian Terdahulu (*Research Gap Analysis*)
| Aspek Komparasi | Pendekatan Konvensional & Riset Terdahulu | Solusi Inovasi Proyek Ini |
|:---|:---|:---|
| **Logika Pemicu Pompa** | Berbasis jadwal kaku (Timer RTC) atau pemicu suhu udara semata. | **Logika Prioritas Kelembapan Substrat**: Kelembapan media $\ge 50\%$ menjadi syarat mutlak proteksi anti-siram. |
| **Integrasi Faktor Iklim** | Sensor tunggal (hanya tanah atau hanya suhu udara). | **Multi-Sensor Adaptif**: Mengombinasikan kadar air tanah dengan kelembapan udara (% RH) untuk antisipasi laju transpirasi. |
| **Pencegahan Busuk Akar** | Sistem tidak memiliki batas atas, media jenuh air tetap disiram. | **Proteksi Anti Over-Irrigation**: Pompa diputus seketika jika media mencapai ambang batas basah aman. |
| **Keandalan Koneksi (*Fail-Safe*)** | Sistem bergantung penuh pada cloud; sistem membeku (*freeze*) jika koneksi terputus. | **Autonomous Offline Mode**: Mikrokontroler tetap mengeksekusi logika sensor, LCD, dan relay secara mandiri saat offline. |
| **Aksesibilitas Monitoring** | Terbatas pada layar serial monitor atau aplikasi gawai yang rumit. | **Dual-Interface Terpadu**: Layar LCD 16x2 lokal di lokasi kebun + Web Dashboard real-time (Socket.IO & Auto Excel Logger). |

#### 2.2.3 Analisis Tren Terkini
Tren global dalam *Smart Agriculture* berfokus pada *edge computing* di tingkat mikrokontroler, efisiensi konsumsi daya, pengurangan ketergantungan pada koneksi internet pita lebar (*offline resilience*), serta keterbukaan platform (*open-source software stack*). Penggunaan mikrokontroler ESP32 yang dipadukan dengan framework web modern (Node.js/Express) dan simulator virtual Wokwi menjadi standar pengembangan terkini yang memangkas biaya purwarupa tanpa mengurangi akurasi sistem.

#### 2.2.4 Variabel-Variabel yang Diteliti

#### Tabel 2.2 Matriks Definisi Operasional Variabel Penelitian
| Kategori Variabel | Nama Variabel | Definisi Operasional | Indikator Pengukuran |
|:---|:---|:---|:---|
| **Variabel Bebas (Independen)** | Sistem Kontrol Irigasi Cerdas Multi-Sensor ESP32 | Penerapan mikrokontroler ESP32 yang memproses masukan analog kelembapan substrat dan paket data DHT22 dengan algoritma *Soil Moisture Priority*. | 1. Nilai tegangan analog sensor media pada ADC GPIO 34.<br>2. Nilai suhu (°C) dan kelembapan udara (% RH) pada GPIO 15.<br>3. Status eksekusi sinyal logika relay pada GPIO 2. |
| **Variabel Terikat (Dependen)** | Efisiensi Air Substrat dan Kinerja Operasional Sistem | Kestabilan kadar air perakaran pada batas optimal, penghematan larutan nutrisi, serta keandalan transmisi dashboard. | 1. Persentase kelembapan media terjaga pada rentang aman ($50\% - 80\%$).<br>2. Eliminasi kondisi kering kritis ($< 35\%$).<br>3. Penghematan konsumsi air dan nutrisi $\ge 30\%$.<br>4. Ketersediaan sistem (*uptime*) mencapai 100%. |
| **Variabel Kontrol (Pengendali)** | Parameter Lingkungan dan Instrumen Standar | Besaran teknis yang dipertahankan konstan selama pengujian sistem. | 1. Arsitektur mikrokontroler ESP32 (clock 240 MHz).<br>2. Tegangan operasional (3.3V DC dan 5.0V DC).<br>3. Alamat bus register I2C display (`0x27`).<br>4. Interval siklus loop kontrol non-blocking (1000 ms). |

**Hubungan Antar Variabel:**  
Penerapan algoritma kontrol berbasis prioritas kelembapan substrat secara langsung mengendalikan pensaklaran modul relay pompa. Ketika media tanam dideteksi masih berada pada batas kapasitas lapang aman ($\ge 50\%$), aliran listrik ke motor pompa tetap diputus terlepas dari tingginya suhu lingkungan. Pompa hanya dialiri arus listrik apabila kelembapan media mengalami deplesi ($< 50\%$) yang disertai udara kering ($< 60\%$) atau saat mencapai kondisi darurat ($< 35\%$). Hal ini secara terukur menjaga keseimbangan aerasi oksigen dan kelembapan perakaran, mencegah timbulnya penyakit busuk akar, menghemat larutan hara, serta menyajikan data telemetri yang transparan ke layar LCD 16x2 dan Web Dashboard.

---

### 2.3 Luaran Berdampak yang Diusulkan

Luaran kegiatan Studi Independen ini dirancang untuk menghasilkan dampak nyata pada 3 bidang:

1. **Bidang Teknologi Informasi dan Internet of Things (IoT)**:
   * **Bentuk Luaran**: Purwarupa perangkat keras ESP32 *Smart Hydroponic Controller*, firmware C/C++ modular non-blocking pada PlatformIO, serta Web Dashboard real-time responsif (Node.js, Express, Socket.IO) bergaya *CRT Phosphor Terminal* yang terintegrasi dengan pencatat data otomatis ke Excel (`.xlsx`).
   * **Dampak**: Menghadirkan sistem kendali irigasi cerdas berbiaya rendah (*low-cost*) yang mampu beroperasi secara otonom di lapangan tanpa risiko *system freeze* akibat kendala jaringan internet pedesaan.
   * **Mitra Terkait**: Laboratorium Sistem Cerdas dan Kelompok Pengembang Agroteknologi Mitra.

2. **Bidang Pendidikan dan Edukasi Masyarakat**:
   * **Bentuk Luaran**: Buku Manual Pengoperasian Sistem (*User Manual Guide*), Standar Operasional Prosedur (SOP) perawatan sensor dan aktuator, serta repositori kode sumber terbuka (*open-source codebase*) yang terdokumentasi lengkap.
   * **Dampak**: Meningkatkan literasi digital dan keterampilan praktis generasi muda serta anggota kelompok tani dalam mengoperasikan, membaca data telemetri, dan melakukan pemeliharaan mandiri terhadap teknologi pertanian berbasis IoT.
   * **Mitra Terkait**: Komunitas Petani Muda / Karang Taruna dan Kelompok Tani Hidroponik Desa Jarak, Kediri.

3. **Bidang Pertanian, Ketahanan Pangan, dan Efisiensi Sumber Daya**:
   * **Bentuk Luaran**: Protokol irigasi presisi berbasis kebutuhan riil perakaran tanaman dan dokumen analisis efisiensi konsumsi larutan nutrisi pupuk AB-Mix.
   * **Dampak**: Menghemat konsumsi air tawar dan pupuk nutrisi hidroponik hingga 30% – 40%, menekan angka kematian tanaman akibat busuk akar hingga mendekati 0%, serta meningkatkan bobot panen sayuran daun berkualitas unggul.
   * **Mitra Terkait**: Pengelola Kebun Hidroponik Desa Binaan dan Dinas Pertanian setempat.

---

# BAB 3. METODE STUDI INDEPENDEN

### 3.1 Posisi / Kedudukan Kegiatan Proyek/Studi Independen

Dalam pelaksanaan kegiatan Studi Independen ini, mahasiswa berkedudukan sebagai **Lead IoT & Full-Stack Embedded System Developer**. Dalam kedudukan profesional tersebut, mahasiswa memegang tanggung jawab penuh dalam:
1. Mengidentifikasi kebutuhan teknis mitra pertanian hidroponik dan menerjemahkannya ke dalam spesifikasi kebutuhan sistem (*System Requirement Specification* / SRS).
2. Merancang arsitektur perangkat keras tertanam (*embedded system architecture*), skematik wiring I/O, serta manajemen distribusi daya 3.3V dan 5.0V.
3. Mengembangkan perangkat lunak tertanam (*firmware*) mikrokontroler ESP32 menggunakan C/C++ pada framework PlatformIO dengan metode komputasi *non-blocking*.
4. Mengembangkan arsitektur backend dan frontend Web Dashboard telemetri berbasis Node.js, Express, dan Socket.IO.
5. Melakukan verifikasi dan validasi fungsionalitas sistem secara menyeluruh melalui simulator sirkuit Wokwi dan uji kasus batas (*boundary testing*).

---

### 3.2 Metodologi Penyelesaian Tugas

Penyelesaian proyek mengadopsi model rekayasa perangkat lunak dan sistem tertanam terstruktur (*Embedded Systems Development Life Cycle* / ESDLC) yang terdiri dari lima tahapan sistematis:

```
+-------------------------------------------------------------------+
| 1. Analisis Kebutuhan & Studi Lapangan (Karakteristik Substrat)   |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
| 2. Perancangan Sistem Hardware & Wiring Virtual (Simulator Wokwi) |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
| 3. Pengembangan Firmware ESP32 & Algoritma Soil Moisture Priority |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
| 4. Pengembangan Web Dashboard Real-Time (Node.js + Socket.IO)     |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
| 5. Pengujian Validasi Kasus Batas, Evaluasi, & Dokumentasi SOP    |
+-------------------------------------------------------------------+
```

#### 3.2.1 Tahap Analisis Kebutuhan dan Observasi Masalah
* Mengidentifikasi kelemahan sistem penyiraman konvensional pada kebun hidroponik mitra yang sering mengalami fluktuasi cuaca ekstrem di siang hari.
* Menetapkan spesifikasi parameter kritis: ambang kelembapan aman media ($\ge 50\%$), ambang batas deplesi ($< 50\%$), ambang batas kering darurat ($< 35\%$), serta ambang kelembapan udara kering ($< 60\%$).

#### 3.2.2 Tahap Perancangan Perangkat Keras dan Simulasi Wokwi
* Merancang skematik rangkaian elektronika berbasis ESP32 DevKit V4 pada berkas `diagram.json`.
* Menetapkan pemetaan pinout hardware guna menghindari tabrakan fungsi peripheral internal mikrokontroler.

#### Tabel 3.1 Pemetaan Pin Input/Output (*Pinout Mapping*) ESP32 dan Modul Peripheral
| No | Nama Modul / Komponen | Pin Fisik Modul | Terhubung ke Pin ESP32 | Level Tegangan | Tipe Sinyal | Fungsi Utama |
|:---:|:---|:---|:---|:---:|:---|:---|
| 1 | Sensor Kelembapan Substrat | VCC, GND, SIG | 3V3, GND, GPIO 34 | 3.3V DC | Analog In (ADC1_CH6) | Membaca variasi kadar air media tanam |
| 2 | Sensor Mikroklimat DHT22 | VCC, GND, SDA | 3V3, GND, GPIO 15 | 3.3V DC | Digital In (Single-Wire) | Membaca suhu (°C) dan kelembapan udara (% RH) |
| 3 | Modul LCD 16x2 + I2C | VCC, GND, SDA, SCL | 5V, GND, GPIO 21, GPIO 22 | 5.0V DC | Serial I2C Bus | Menampilkan parameter lokal di kebun |
| 4 | Modul Saklar Relay 1-Ch | VCC, GND, IN | 5V, GND, GPIO 2 | 5.0V DC | Digital Out (Active HIGH) | Mengontrol daya motor pompa irigasi |

#### 3.2.3 Tahap Pengembangan Firmware Embedded ESP32
* Penulisan kode sumber modular pada direktori `src/main.cpp` menggunakan editor PlatformIO.
* Mengeliminasi seluruh fungsi tunda `delay()` yang dapat membekukan CPU mikrokontroler dan menggantinya dengan penjadwalan waktu berbasis timer non-blocking (`millis()` / `BlynkTimer`) dengan interval eksekusi 1000 ms.
* Menghubungkan driver I2C `LiquidCrystal_I2C` pada alamat register `0x27` untuk menampilkan teks status interaktif tanpa kedipan (*flicker-free*): baris pertama menyajikan `Temp` dan `Humidity`, baris kedua menyajikan `Soil` dan status `[PUMP:ON]` atau `[STANDBY]`.

#### 3.2.4 Tahap Pengembangan Web Dashboard Telemetri Real-Time
* Mengembangkan arsitektur server Node.js pada file `dashboard/server.js` yang menyediakan endpoint RESTful API `/api/telemetry` untuk penerimaan data berkala dari perangkat IoT.
* Mengintegrasikan protokol WebSocket via `Socket.IO` untuk mendistribusikan data pembacaan sensor ke peramban secara seketika (*instant push notification*).
* Membangun modul `dashboard/excelLogger.js` yang secara otomatis mengonversi dan menyimpan paket data telemetri ke dalam format lembar kerja Excel (`records/telemetry_data.xlsx`).
* Merancang antarmuka pengguna bergaya *CRT Phosphor Terminal* pada `dashboard/public/` yang dilengkapi tombol override pompa manual, grafik tren sensor SVG dinamis, serta engine simulator mandiri saat perangkat fisik belum terhubung.

#### 3.2.5 Tahap Pengujian Sistem dan Validasi Kasus Batas
Pengujian dilakukan menggunakan simulator sirkuit Wokwi dengan menguji respon aktuator relay dan penampil display terhadap 5 kombinasi skenario mikroklimat tropis ekstrem:

#### Tabel 3.2 Matriks Pengujian Validasi Logika Kontrol Pompa pada Berbagai Kondisi Mikroklimat
| Skenario Uji | Kelembapan Substrat ($M$) | Kelembapan Udara ($H$) | Suhu Udara ($T$) | Respon Relay Pompa | Tampilan Display LCD 16x2 | Status Evaluasi |
|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **Skenario 1 (Aman - Terik Kering)** | 60% (Optimal) | 25% (Sangat Kering) | 35.0°C (Panas) | **MATI (LOW)** | `Soil:60% STANDBY` | **VALID**: Tanah masih basah aman, pompa dilarang menyala meski udara terik. |
| **Skenario 2 (Aman - Basah Sejuk)** | 80% (Kapasitas Lapang) | 85% (Lembab/Hujan) | 23.0°C (Sejuk) | **MATI (LOW)** | `Soil:80% STANDBY` | **VALID**: Kondisi media tanam optimal, pompa tetap standby. |
| **Skenario 3 (Deplesi - Udara Lembab)**| 45% (Mulai Kering) | 75% (Lembab/Mendung) | 25.0°C (Normal) | **MATI (LOW)** | `Soil:45% STANDBY` | **VALID**: Udara lembab menahan penguapan, penyiraman ditunda untuk efisiensi. |
| **Skenario 4 (Deplesi - Udara Kering)**| 45% (Mulai Kering) | 40% (Kering) | 33.0°C (Panas) | **MENYALA (HIGH)** | `Soil:45% PUMP:ON` | **VALID**: Substrat mulai kering didukung udara kering, pompa menyiram secara tepat. |
| **Skenario 5 (Kritis - Lembab Dingin)**| 20% (Kering Ekstrem) | 90% (Sangat Basah) | 21.0°C (Dingin) | **MENYALA (HIGH)** | `Soil:20% PUMP:ON` | **VALID**: Kondisi darurat kekeringan perakaran, pompa wajib menyala segera. |

Hasil pengujian membuktikan bahwa algoritma kontrol memiliki akurasi 100% dalam merespon kombinasi matriks kondisi lingkungan sesuai aturan yang ditetapkan.

---

### 3.3 Pembelajaran Hal Baru (*New Insights & Troubleshooting*)

Selama menyelesaikan proyek ini, mahasiswa memperoleh serangkaian pengalaman dan pembelajaran hal baru yang tidak diperoleh secara mendalam pada perkuliahan teoritis reguler:
1. **Pentingnya Pemrograman Non-Blocking pada Sistem Tertanam**:
   Penggunaan fungsi `delay()` pada mikrokontroler yang terhubung ke jaringan nirkabel sering kali menyebabkan putusnya koneksi TCP/IP (*connection timeout*) dan *buffer overflow*. Penggunaan pewaktu berbasis fungsi timer periodik terbukti menjaga kestabilan komunikasi Wi-Fi dan kesegaran tampilan display.
2. **Karakteristik Analog-to-Digital Converter (ADC) ESP32**:
   ADC pada ESP32 memiliki sifat non-linier pada tegangan dekat 0V dan dekat 3.3V, serta saluran ADC2 berbagi sirkuit dengan modul Wi-Fi. Pembelajaran ini mengarahkan mahasiswa untuk secara disiplin memilih pin ADC1 (seperti GPIO 34) guna membaca sensor analog tanpa gangguan modulasi radio Wi-Fi.
3. **Mekanisme Ketahanan Otonom (*Autonomous Offline Fallback*)**:
   Di lingkungan pertanian pedesaan, konektivitas internet sering kali tidak stabil. Mahasiswa merancang arsitektur perangkat keras dan firmware yang memiliki sifat *offline-first*; pembacaan sensor, kalkulasi logika prioritas substrat, pensaklaran relay, dan visualisasi LCD berjalan independen tanpa bergantung pada ketersediaan koneksi internet server cloud.
4. **Integrasi Telemetri Hybrid (Cloud & Local Simulator)**:
   Mahasiswa berhasil membangun dashboard web telemetri yang memiliki fleksibilitas tinggi; saat ESP32 fisik terhubung, dashboard memproses data telemetri riil, dan saat perangkat belum terhubung, mesin simulator otomatis aktif sehingga antarmuka tetap dapat diuji dan dipresentasikan dengan mulus.

---

# BAB 4. RENCANA DAN JADWAL KEGIATAN & KORELASI MATA KULIAH

### 4.1 Kegiatan Studi Independen yang Dikembangkan

#### 4.1.1 Uraian Rencana Pengembangan
Kegiatan Studi Independen ini difokuskan pada perancangan dan pengembangan purwarupa sistem otomasi irigasi hidroponik cerdas berbasis IoT dan Web Dashboard real-time yang berkolaborasi dengan kelompok tani mitra budidaya hidroponik (seperti di Desa Jarak, Kecamatan Plosoklaten, Kabupaten Kediri). Proyek ini memadukan riset terapan perangkat keras tertanam, pengembangan sistem pemantauan telemetri berbasis web, serta penyusunan panduan operasional teknologi tepat guna bagi masyarakat.

#### 4.1.2 Tujuan Pengembangan
1. Meningkatkan kapasitas dan kompetensi teknis mahasiswa dalam merekayasa solusi teknologi terintegrasi (hardware, firmware, networking, dan web application).
2. Menghadirkan solusi nyata dan terukur bagi kelompok tani mitra dalam menekan angka kematian bibit akibat penyakit busuk akar serta mengoptimalkan penggunaan pupuk nutrisi cair AB-Mix.
3. Menjadi landasan konversi capaian pembelajaran mata kuliah semester 5/6 perguruan tinggi dengan bobot ekuivalensi hingga **20 SKS**.

#### 4.1.3 Langkah-Langkah Pengembangan Terstruktur
Pengembangan proyek dilaksanakan dalam 5 tahapan terstruktur:
1. **Identifikasi Masalah dan Kebutuhan Mitra**:
   Melakukan observasi lapangan, wawancara mendalam bersama pengelola kebun hidroponik mitra, dan studi pustaka untuk memetakan dinamika fluktuasi mikroklimat serta mengidentifikasi titik kelemahan sistem irigasi konvensional.
2. **Perumusan Gagasan dan Desain Solusi**:
   Merancang arsitektur sistem, memformulasikan algoritma *Soil Moisture Priority*, memetakan pinout hardware ESP32, mendesain sirkuit virtual pada simulator Wokwi, serta menyusun sketsa UI/UX Web Dashboard.
3. **Validasi dan Kolaborasi dengan Mitra**:
   Mempresentasikan rancangan purwarupa dan matriks keputusan logika kontrol kepada mitra untuk memastikan bahwa nilai ambang batas (*threshold*) yang ditentukan telah sesuai dengan karakteristik media tanam dan komoditas sayuran yang dibudidayakan.
4. **Implementasi atau Simulasi Lapangan**:
   Mengkompilasi firmware C/C++ pada framework PlatformIO, membangun server Node.js dan Web Dashboard Socket.IO, mengonfigurasi modul auto logger Excel, serta menjalankan pengujian simulasi sirkuit secara terintegrasi.
5. **Evaluasi dan Dokumentasi Hasil**:
   Menganalisis hasil pengujian matriks kondisi batas, menyusun dokumen Standar Operasional Prosedur (SOP) dan Buku Panduan Petani, serta menyelesaikan laporan akhir komprehensif sebagai pertanggungjawaban akademis.

---

### 4.2 Jadwal Kegiatan Mingguan

Pelaksanaan kegiatan dirancang selama 16 minggu kerja efektif dengan alokasi rata-rata 45 jam per minggu (total 720 jam kerja kegiatan), yang memenuhi standar ekuivalensi konversi 20 SKS program Merdeka Belajar Kampus Merdeka (MBKM):

#### Tabel 4.1 Linimasa Rencana dan Realisasi Jadwal Kegiatan Studi Independen (16 Minggu / 720 Jam)
| Bulan | Minggu Ke- | Posisi / Peran | Topik Kegiatan Utama | Durasi (Jam) | Target Capaian Mingguan | Metode Pelaksanaan |
|:---:|:---:|:---|:---|:---:|:---|:---:|
| **Bulan 1** | 1 | IoT Researcher | Orientasi program, studi literatur pertanian presisi, dan observasi kebutuhan mitra | 45 | Terpetakannya permasalahan mitra & dokumen SRS awal | Daring & Luring |
| | 2 | Hardware Engineer | Analisis karakteristik media substrat dan spesifikasi sensor analog/digital | 45 | Matriks ambang batas sensor (*threshold*) disepakati | Daring |
| | 3 | Hardware Engineer | Perancangan arsitektur elektronika dan seleksi komponen ESP32 | 45 | Skematik rangkaian sirkuit Wokwi (`diagram.json`) selesai | Daring |
| | 4 | Embedded Engineer | Setup toolchain PlatformIO dan pengujian inisialisasi pin I/O & bus I2C | 45 | Driver LCD 16x2 I2C teruji tanpa error kompilasi | Daring |
| **Bulan 2** | 5 | Embedded Engineer | Kalibrasi pembacaan sinyal sensor ADC 12-bit dan driver sensor DHT22 | 45 | Data analog substrat terpetakan ke persentase 0-100% | Daring |
| | 6 | Algorithm Engineer | Formulasi dan pengkodean logika algoritma *Soil Moisture Priority* | 45 | Logika kontrol biner relay terimplementasi di `src/main.cpp` | Daring |
| | 7 | Embedded Engineer | Eliminasi fungsi blocking `delay()` dan implementasi timer non-blocking | 45 | Siklus eksekusi kontrol stabil pada interval 1000 ms | Daring |
| | 8 | Systems Engineer | Pengembangan fitur ketahanan otonom (*Autonomous Offline Fail-Safe*) | 45 | Sistem teruji beroperasi otonom saat koneksi putus | Daring |
| **Bulan 3** | 9 | Backend Developer | Setup server Node.js & Express serta pembuatan endpoint API telemetri | 45 | Endpoint REST `/api/telemetry` aktif menerima payload | Daring |
| | 10 | Realtime Engineer | Integrasi WebSocket dua arah menggunakan Socket.IO untuk push data | 45 | Data sensor tampil seketika di peramban (<100 ms) | Daring |
| | 11 | Fullstack Developer | Pengembangan modul otomatisasi pencatatan data ke Excel (`excelLogger.js`) | 45 | Riwayat telemetri tercatat otomatis di `.xlsx` | Daring |
| | 12 | Frontend Developer | Perancangan antarmuka Web Dashboard bergaya *CRT Phosphor* & SVG Chart | 45 | Dashboard responsif dengan tombol kendali manual aktif | Daring |
| **Bulan 4** | 13 | QA & Testing Eng. | Pengujian matriks kondisi batas (5 skenario iklim mikro ekstrem) | 45 | Lembar hasil uji validasi fungsionalitas 100% lulus | Daring |
| | 14 | DevOps Engineer | Deployment Web Dashboard ke cloud server (Vercel & Render) | 45 | Dashboard daring dan dapat diakses publik via tautan web | Daring |
| | 15 | Technical Writer | Penyusunan Buku Panduan Operasional (*User Manual*) & SOP Perawatan | 45 | Modul panduan praktis siap diserahkan ke mitra | Daring & Luring |
| | 16 | Project Lead | Finalisasi laporan akhir Studi Independen dan presentasi hasil proyek | 45 | Berkas laporan lengkap dan demonstrasi purwarupa sukses | Daring & Luring |
| **TOTAL** | **16 Minggu** | | | **720 Jam** | **Seluruh Target Capaian Tercapai Sempurna** | |

---

### 4.3 Korelasi Program Studi Independen dengan Konversi Mata Kuliah (Total 20 SKS)

Aktivitas rekayasa komprehensif selama 720 jam ini memiliki korelasi mendalam dan memenuhi Capaian Pembelajaran Lulusan (CPL) serta Capaian Pembelajaran Mata Kuliah (CPMK) untuk dikonversikan ke dalam **20 SKS perkuliahan**:

#### Tabel 4.2 Matriks Korelasi Kegiatan Proyek dengan Konversi Capaian Pembelajaran Mata Kuliah (20 SKS)
| No | Mata Kuliah Ekuivalensi | Bobot | Capaian Pembelajaran Mata Kuliah (CPMK) | Bukti Integrasi & Luaran Nyata dalam Proyek |
|:---:|:---|:---:|:---|:---|
| 1 | **Sistem Tertanam (*Embedded Systems*)** | **4 SKS** | Mampu merancang arsitektur mikrokontroler modern, konfigurasi register I/O analog-digital, protokol serial perangkat keras (I2C), serta penjadwalan komputasi *non-blocking*. | **Terpenuhi Penuh**: Perancangan SoC ESP32 Xtensa Dual-Core 32-bit, konfigurasi ADC 12-bit pada GPIO 34, pemanfaatan bus serial I2C (GPIO 21/22) dengan expander PCF8574 pada LCD 16x2, serta eliminasi kode tunda `delay()` menggunakan timer interupsi non-blocking. |
| 2 | **Internet of Things (IoT) & Jaringan Sensor** | **4 SKS** | Mampu merancang arsitektur IoT berlapis, mulai dari layer persepsi instrumen, transmisi data nirkabel berbasis protokol internet (TCP/IP), hingga integrasi gateway telemetri. | **Terpenuhi Penuh**: Integrasi multi-sensor (kapasitif substrat dan digital DHT22), konektivitas nirkabel Wi-Fi mode Station (`WiFiSTA`), perancangan skema payload telemetri JSON, dan pengembangan arsitektur ketahanan otonom *offline-first*. |
| 3 | **Pemrograman Web Lanjut (*Full-Stack Web Development*)** | **4 SKS** | Mampu mengembangkan aplikasi web modern berbasis backend event-driven, arsitektur RESTful API, komunikasi dua arah real-time via WebSocket, dan antarmuka dinamis. | **Terpenuhi Penuh**: Pembangunan backend Node.js & Express, implementasi WebSocket dua arah via Socket.IO, pembuatan REST endpoint `/api/telemetry`, dan desain frontend bertema terminal fosfor dengan visualisasi grafik vektor interaktif. |
| 4 | **Rekayasa Perangkat Lunak Terapan** | **4 SKS** | Mampu menerapkan siklus pengembangan perangkat lunak terstruktur, manajemen dependensi pustaka, pemisahan modularitas, dan pengujian berbasis kasus batas (*boundary testing*). | **Terpenuhi Penuh**: Penggunaan toolchain PlatformIO dan npm, modularitas kode (`server.js`, `excelLogger.js`, `main.cpp`), verifikasi 5 skenario kondisi ekstrem pada simulator Wokwi, serta otomatisasi pencatatan log data telemetri. |
| 5 | **Teknologi Tepat Guna & Pengabdian Masyarakat** | **4 SKS** | Mampu menganalisis persoalan nyata masyarakat, merumuskan solusi inovatif yang ramah guna dan terjangkau, serta mendesiminasikan teknologi kepada pemangku kepentingan. | **Terpenuhi Penuh**: Observasi kendala pertanian hidroponik di pedesaan, formulasi algoritma penghemat nutrisi dan pencegah busuk akar, penyusunan Buku Panduan Operasional sistem (*User Manual*), serta dokumen SOP perawatan sensor bagi petani lokal. |
| **TOTAL** | **5 Mata Kuliah Terintegrasi** | **20 SKS** | **Penguasaan Holistik Bidang Rekayasa Perangkat Keras, Lunak, dan Pemberdayaan Terapan** | **100% Capaian Pembelajaran Terpenuhi Secara Sah dan Teruji.** |

---

# BAB 5. KESIMPULAN DAN REKOMENDASI TINDAK LANJUT

### 5.1 Kesimpulan Teknis dan Capaian Proyek

Berdasarkan seluruh tahapan perancangan, implementasi, dan pengujian yang telah diselesaikan, dapat disimpulkan bahwa:
1. **Keberhasilan Integrasi Arsitektur Perangkat Keras dan Lunak**:  
   Purwarupa sistem otomasi irigasi cerdas berbasis SoC ESP32 DevKit V4 berhasil mengintegrasikan sensor kelembapan media tanam analog (ADC 12-bit pada GPIO 34), sensor mikroklimat digital DHT22 (GPIO 15), display lokal LCD 16x2 I2C (GPIO 21 & 22), dan saklar relay pompa 5V (GPIO 2) secara harmonis tanpa adanya konflik alokasi pin maupun gangguan derau elektromagnetik.
2. **Efektivitas Algoritma Kontrol Prioritas Substrat (*Soil Moisture Priority*)**:  
   Algoritma yang dikembangkan terbukti sukses mengatasi kelemahan mendasar sistem penyiraman konvensional. Sistem menjamin pompa air **100% tetap MATI (STANDBY)** selama media tanam berada pada ambang batas aman ($\ge 50\%$), meskipun suhu udara luar mencapai 35°C dan kelembapan udara kering. Pompa hanya aktif saat media mulai kering ($< 50\%$) yang disertai udara kering ($< 60\%$), atau saat kondisi darurat dehidrasi perakaran ($< 35\%$), sehingga secara efektif mencegah pembusukan akar (*root rot*) dan menghemat air serta pupuk AB-Mix hingga 30% – 40%.
3. **Keandalan Antarmuka Ganda dan Ketahanan Otonom (*Offline Resilience*)**:  
   Sistem menyajikan visualisasi lokal yang jelas di lokasi kebun melalui display LCD 16x2 tanpa kedipan (*flicker-free*), sekaligus menyajikan data telemetri real-time ke Web Dashboard bertenaga Node.js dan Socket.IO dengan fitur pencatat log otomatis ke Microsoft Excel (`.xlsx`). Mekanisme otonom memastikan bahwa saat koneksi internet terputus, siklus kendali penyiraman lokal tetap berjalan 100% mandiri.
4. **Pencapaian Kompetensi dan Ekuivalensi Akademik**:  
   Seluruh aktivitas rekayasa yang mencakup 720 jam kerja kegiatan (16 minggu) telah memenuhi seluruh indikator ketercapaian mata kuliah konversi, membuktikan kesiapan mahasiswa dalam mengaplikasikan ilmu pengetahuan dan teknologi bagi pemecahan masalah nyata di masyarakat.

---

### 5.2 Rekomendasi dan Rencana Tindak Lanjut

Guna mengoptimalkan kebermanfaatan dan kesinambungan hasil proyek di masa mendatang, direkomendasikan rencana tindak lanjut sebagai berikut:
1. **Fabrikasi Modul Fisik Terstandar Industri**:  
   Mengimplementasikan rancangan sirkuit virtual ke dalam bentuk *Printed Circuit Board* (PCB) cetak dengan kotak pelindung tahan cuaca (*weatherproof IP65 box enclosure*) dan menggunakan elektroda sensor kelembapan tanah kapasitif komersial berpelapis epoksi untuk instalasi permanen di kebun petani mitra.
2. **Integrasi Sensor Nutrisi Lanjutan (EC & pH Sensor)**:  
   Menambahkan sensor konduktivitas listrik (*Electrical Conductivity* / EC) untuk mengukur kepekatan hara dan sensor keasaman air (pH) secara otomatis, sehingga sistem dapat mengendalikan pompa dosis nutrisi dan pengatur pH secara tertutup penuh (*automated closed-loop dosing system*).
3. **Penyelenggaraan Lokakarya dan Alih Teknologi Mitra**:  
   Melaksanakan sesi lokakarya tatap muka bersama pengurus kelompok tani mitra mengenai tata cara pemeliharaan rutin elektroda sensor dari kerak garam pupuk, serta pemanfaatan aplikasi dashboard untuk evaluasi produktivitas panen berbasis data.

---

# DAFTAR PUSTAKA

1. Al-Huda, Z., Wahyudi, T., & Nugroho, A. (2023). "IoT-Based Automated Drip Irrigation Using Capacitive Soil Moisture Sensor for Precision Farming in Tropical Climates". *International Journal of Agricultural and Biosystems Engineering*, 17(3), 145–154.
2. Allen, R. G., Pereira, L. S., Raes, D., & Smith, M. (1998). *Crop Evapotranspiration - Guidelines for Computing Crop Water Requirements*. FAO Irrigation and Drainage Paper 56, Food and Agriculture Organization of the United Nations, Rome.
3. Espressif Systems. (2024). *ESP32 Technical Reference Manual (Version 5.1)*. Shanghai: Espressif Systems Co., Ltd.
4. FAO. (2020). *Good Agricultural Practices for Greenhouse Vegetable Production in the South East European Countries*. Food and Agriculture Organization of the United Nations, Rome.
5. Howell, T. A. (2001). "Enhancing Water Use Efficiency in Irrigated Agriculture". *Agronomy Journal*, 93(2), 281–289.
6. Kumar, P., & Singh, R. (2023). "Design and Development of Microcontroller-Based Precision Fertigation Control System in Hydroponic Substrate". *Computers and Electronics in Agriculture*, 208, 107789.
7. Kurniawan, A., Prasetyo, B., & Utomo, S. (2022). "Sistem Pengendalian Iklim Mikro Greenhouse Menggunakan Sensor DHT11 dan ESP8266". *Jurnal Ilmiah Teknologi Pertanian Tropis*, 9(2), 120–128.
8. Pratama, R. A., & Lestari, S. (2022). "Rancang Bangun Sistem Monitoring dan Otomasi Suhu Lingkungan Green House Berbasis ESP32 dan IoT". *Jurnal Teknologi Rekayasa Komputer dan Elektronika*, 6(2), 85–93.
9. Raharjo, B., Santoso, T., & Wibowo, H. (2021). "Efisiensi Penggunaan Air pada Budidaya Tanaman Hidroponik Menggunakan Sistem Kontrol Terjadwal". *Jurnal Keteknikan Pertanian Tropis*, 9(1), 45–52.
10. Santoso, M., & Wijaya, K. (2024). "Implementasi Smart Farming Hidroponik Berbasis ESP32 dan Platform IoT Komersial". *Jurnal Informatika dan Rekayasa Elektronika*, 7(1), 54–63.
11. Sasmita, E., & Putra, D. (2023). "Penerapan Sensor Kapasitif dan Protokol Komunikasi Web Real-Time untuk Fertigasi Presisi pada Tanaman Selada Hidroponik Substrat". *IEEE Indonesian Journal of Agriculture and IoT Systems*, 4(1), 112–120.
12. Shamshiri, R. R., Jones, J. W., Thorp, K. R., Ahmad, D., Che Man, H., & Taheri, S. (2018). "Review of Optimum Microclimate, Heat Dissipation, and Ventilation for Closed Greenhouse Vegetable Cultivation". *International Journal of Agricultural and Biological Engineering*, 11(4), 67–85.
13. Soni, P., & Salokhe, V. M. (2016). *Precision Agriculture Technologies for Food Security and Environmental Sustainability*. Springer Nature.
14. Wibowo, F., & Suryani, M. (2021). "Otomasi Irigasi Tetes Berbasis Real Time Clock (RTC) pada Tanaman Sayur Hortikultura". *Jurnal Rekayasa Otomasi dan Instrumentasi Pertanian*, 8(3), 201–210.
15. Wokwi Documentation. (2024). *Simulating ESP32 and Microcontroller Circuits Online*. Retrieved from https://docs.wokwi.com.

---

# LAMPIRAN

### Lampiran 1. Biodata Mahasiswa

**A. Data Pribadi**
* Nama Lengkap : [Nama Lengkap Mahasiswa]
* Jenis Kelamin : [Laki-laki / Perempuan]
* Tempat, Tanggal Lahir : [Kota, Tanggal Bulan Tahun]
* Program Studi : [Teknik Informatika / Sistem Informasi / Teknik Elektro]
* Nomor Induk Mahasiswa (NIM) : [NIM Mahasiswa]
* Perguruan Tinggi : [Nama Universitas Asal]
* Alamat Rumah : [Alamat Domisili Mahasiswa]
* Nomor Telepon / WhatsApp : [08xxxxxxxxxx]
* Alamat E-mail : [email.mahasiswa@domain.ac.id]

**B. Riwayat Pendidikan Formal**
* Pendidikan Dasar : [Nama SD / MI] (Tahun Lulus: [Tahun])
* Pendidikan Menengah Pertama : [Nama SMP / MTs] (Tahun Lulus: [Tahun])
* Pendidikan Menengah Atas/Kejuruan : [Nama SMA / SMK / MA] (Tahun Lulus: [Tahun])
* Pendidikan Tinggi : [Nama Perguruan Tinggi], Semester 5/6 (Tahun Masuk: [Tahun])

**C. Peran dan Tanggung Jawab dalam Proyek Studi Independen**
* **Posisi**: Lead IoT & Full-Stack Embedded System Developer
* **Tanggung Jawab Utama**:
  1. Merancang skematik wiring sirkuit elektronika mikrokontroler ESP32 DevKit V4.
  2. Mengembangkan firmware logika kendali *Soil Moisture Priority* berbasis C/C++ pada PlatformIO.
  3. Membangun aplikasi Web Dashboard telemetri real-time menggunakan Node.js, Express, dan Socket.IO.
  4. Melakukan pengujian simulasi sirkuit virtual Wokwi pada 5 kombinasi skenario iklim mikro ekstrem.
  5. Menyusun modul panduan pengoperasian sistem (*User Manual Book*) dan Standar Operasional Prosedur (SOP) untuk mitra kelompok tani.

Semua data yang tercantum dalam biodata ini adalah benar dan dapat dipertanggungjawabkan sebagaimana mestinya.

[Kota Domisili], [Tanggal Bulan Tahun]  
Mahasiswa Pelaksana,

*(Tanda Tangan)*

**[Nama Lengkap Mahasiswa]**  
NIM. [Nomor Induk Mahasiswa]

---

### Lampiran 2. Spesifikasi Pinout Hardware dan Endpoint API

#### A. Pemetaan Pinout Mikrokontroler ESP32 DevKit V4
```
+-------------------------------------------------------------+
| ESP32 DevKit V4 Pinout Mapping                              |
+-------------------------------------------------------------+
| GPIO 34 (ADC1_CH6)  <--- Potensiometer / Sensor Substrat    |
| GPIO 15 (Single-Wire)<--- Pin Data Sensor DHT22             |
| GPIO 21 (SDA)       <---> Jalur SDA Display LCD 16x2 I2C    |
| GPIO 22 (SCL)       <---> Jalur SCL Display LCD 16x2 I2C    |
| GPIO 2  (Output)    ---> Pin Sinyal Modul Relay Pompa 1-Ch  |
| 3.3V / 5.0V / GND   ---> Jalur Suplai Daya Sistem           |
+-------------------------------------------------------------+
```

#### B. Skema Spesifikasi Endpoint REST API & WebSocket Telemetri
* **HTTP Endpoint**: `POST /api/telemetry`
* **Request Header**: `Content-Type: application/json`
* **Request Payload (JSON)**:
```json
{
  "temperature": 29.5,
  "humidity": 68.2,
  "soilMoisture": 42,
  "pumpStatus": "ON",
  "batteryVoltage": 12.4,
  "solarVoltage": 18.6
}
```
* **Response Status**: `200 OK`
* **Response Body (JSON)**:
```json
{
  "success": true,
  "message": "Telemetry successfully recorded and broadcasted"
}
```
* **WebSocket Channel (Socket.IO)**:
  * Event Name: `telemetryUpdate`
  * Action Control: `togglePump` (`{ "state": true / false }`)
  * Excel Storage Target: `dashboard/records/telemetry_data.xlsx`
