# LAPORAN AKHIR PROGRAM MOBILITAS AKADEMIS
## PENGEMBANGAN SISTEM PENYIRAMAN OTOMATIS HIDROPONIK BERBASIS INTERNET OF THINGS (IoT) MENGGUNAKAN ESP32 DENGAN METODE PRIORITAS KELEMBAPAN SUBSTRAT DI DESA JARAK KABUPATEN KEDIRI

---

**Disusun Oleh:**  
Mahasiswa Semester 5 – Program Mobilitas Akademis  
**UNIVERSITAS NEGERI SURABAYA (UNESA)**  
Tahun Akademik 2025/2026  

---

## DAFTAR ISI
* **DAFTAR ISI**
* **DAFTAR TABEL**
* **DAFTAR GAMBAR**
* **BAB 1. PENDAHULUAN**
  * 1.1 Latar Belakang
  * 1.2 Tujuan Program Mobilitas Akademis
  * 1.3 Manfaat Program Mobilitas Akademis
* **BAB 2. TINJAUAN PUSTAKA**
  * 2.1 Tinjauan Teoritis
    * 2.1.1 Pertanian Presisi dan Budidaya Hidroponik Substrat Tropis
    * 2.1.2 Mikrokontroler ESP32 DevKit V4 dan Arsitektur SoC
    * 2.1.3 Sensor Kelembapan Media Tanam dan Pemetaan ADC 12-Bit
    * 2.1.4 Sensor Digital Suhu dan Kelembapan Relatif DHT22
    * 2.1.5 Konsep Dinamika *Vapor Pressure Deficit* (VPD) dan Transpirasi
    * 2.1.6 Aktuator Relay Elektromekanik dan Rangkaian Pensaklaran Pompa
    * 2.1.7 Protokol Serial Komunikasi *Inter-Integrated Circuit* (I2C) pada LCD 16x2
    * 2.1.8 Ekosistem *Cloud Computing* Blynk IoT dan Pemrograman *Non-Blocking*
  * 2.2 Penelitian Sebelumnya (*Literature Review & Research Gap*)
    * 2.2.1 Tinjauan Studi Terdahulu
    * 2.2.2 Analisis Kesenjangan (*Research Gap Analysis*)
    * 2.2.3 Analisis Tren Terkini (*State of the Art*)
    * 2.2.4 Variabel-Variabel yang Diteliti
  * 2.3 Luaran Berdampak yang Diusulkan
* **BAB 3. METODE STUDI INDEPENDEN**
  * 3.1 Waktu dan Tempat Pelaksanaan
  * 3.2 Metodologi Penyelesaian Tugas
    * 3.2.1 Tahap Analisis Kebutuhan dan Studi Observasi (Requirement Analysis)
    * 3.2.2 Tahap Perancangan Sistem dan Desain UI/UX (Design & Architecture)
    * 3.2.3 Tahap Pengembangan dan Implementasi Firmware (Implementation & Coding)
    * 3.2.4 Tahap Pengujian Simulasi dan Validasi Matriks (Testing & Verification)
    * 3.2.5 Tahap Evaluasi, Diseminasi, dan Penyusunan Panduan Petani (Evaluation & Deployment Preparation)
* **BAB 4. KORELASI PROGRAM STUDI INDEPENDEN DENGAN KONVERSI MATA KULIAH**
  * 4.1 Rencana Studi Independen yang Dikembangkan
  * 4.2 Relevansi dengan Mata Kuliah Konversi (Total 10 SKS)
    * 4.2.1 Sistem Tertanam (*Embedded Systems*) – 3 SKS
    * 4.2.2 Internet of Things (IoT) – 3 SKS
    * 4.2.3 Rekayasa Perangkat Lunak Terapan – 2 SKS
    * 4.2.4 Teknologi Tepat Guna dan Pemberdayaan Masyarakat – 2 SKS
* **BAB 5. KESIMPULAN**
  * 5.1 Kesimpulan Teknis dan Lokasi Kegiatan
  * 5.2 Target dan Harapan yang Ingin Dicapai
* **DAFTAR PUSTAKA**

---

## DAFTAR TABEL
* **Tabel 2.2** Analisis Kesenjangan Penelitian (*Research Gap Analysis*)
* **Tabel 3.1** Pemetaan Pin Input/Output (*Pinout Mapping*) Antara ESP32 dan Komponen
* **Tabel 3.2** Matriks Uji Coba Skenario Kondisi Sensor dan Respon Aktuator
* **Tabel 4.1** Rencana Kerja dan Linimasa Program Mobilitas Akademis (16 Minggu)
* **Tabel 4.2** Matriks Relevansi Program dengan Konversi Mata Kuliah Kurikulum UNESA (Total 10 SKS)

---

## DAFTAR GAMBAR
* **Gambar 3.1** Diagram Blok Arsitektur Aliran Data Sistem Irigasi Cerdas ESP32
* **Gambar 3.2** Diagram Alir (*Flowchart*) Logika Kontrol Prioritas Kelembapan Substrat
* **Gambar 3.3** Skematik Rangkaian Virtual pada Simulator Wokwi
* **Gambar 3.4** Tampilan Antarmuka Visual Display LCD 16x2 I2C pada Kondisi *Standby* dan *Watering*

---

# BAB 1. PENDAHULUAN

### 1.1 Latar Belakang
Sektor agrikultur di era Revolusi Industri 4.0 mengalami pergeseran paradigma yang fundamental melalui introduksi konsep pertanian presisi (*Precision Agriculture*). Pemanfaatan teknologi digital berbasis *Internet of Things* (IoT) dan komputasi tertanam (*embedded system*) terbukti menjadi solusi mutakhir dalam meningkatkan produktivitas komoditas pangan bernilai ekonomi tinggi di tengah keterbatasan lahan dan ketidakpastian iklim global. Di Indonesia, salah satu wilayah pedesaan yang memiliki potensi agraris sangat kuat adalah Desa Jarak, yang terletak di Kecamatan Plosoklaten, Kabupaten Kediri, Jawa Timur. Wilayah ini didominasi oleh bentang alam pertanian produktif, di mana para petani lokal dan generasi mudanya mulai mengadopsi budidaya hortikultura bernilai ekonomi tinggi, khususnya komoditas sayuran daun (seperti selada *Romaine*, pakcoy, dan bayam Jepang) serta tanaman buah (seperti melon dan tomat ceri) dengan menggunakan sistem hidroponik.

Dalam konteks budidaya hidroponik di daerah tropis, sistem hidroponik substrat atau fertigasi tetes (*drip irrigation fertigation*) menjadi pilihan unggulan karena media tanam berpori seperti sabut kelapa (*cocopeat*), arang sekam padi, dan *rockwool* memiliki kemampuan mengikat air dan aerasi perakaran yang sangat baik. Namun demikian, keberhasilan budidaya hidroponik substrat di Desa Jarak sangat bergantung pada manajemen pemberian larutan air nutrisi yang presisi. Wilayah Kabupaten Kediri memiliki karakteristik iklim mikro tropis dataran rendah hingga menengah dengan fluktuasi cuaca harian yang tajam. Pada siang hari (pukul 10.30 hingga 14.30 WIB), intensitas radiasi matahari yang tinggi sering kali mendorong temperatur lingkungan greenhouse melampaui rentang optimal tanaman, yakni mencapai 32°C hingga 35°C, dibarengi dengan anjloknya kelembapan relatif udara (*Relative Humidity* / RH) hingga di bawah 50%. Fenomena ini menciptakan defisit tekanan uap air (*Vapor Pressure Deficit* / VPD) yang sangat curam di atmosfer, memicu peningkatan laju transpirasi daun tanaman secara drastis.

Ironisnya, manajemen irigasi yang diterapkan pada perkebunan hidroponik masyarakat di Desa Jarak saat ini masih sangat konvensional. Pengairan umumnya dilakukan secara manual berdasarkan perkiraan visual petani atau mengandalkan perangkat saklar waktu otomatis (*timer RTC*) yang memicu pompa air pada jadwal jam-jam tertentu yang bersifat statis (misalnya terjadwal pada pukul 08.00, 12.00, dan 16.00). Pendekatan irigasi berbasis jadwal kaku tersebut memiliki kelemahan ilmiah yang sangat fatal:
1. **Kegagalan Adaptasi Dinamika Cuaca**: Pada hari yang mendung, berawan, atau pasca-hujan deras, laju penguapan air di udara sangat rendah dan kelembapan media tanam masih berada pada kapasitas lapang (*field capacity*). Ketika timer menyalakan pompa secara buta, terjadilah fenomena penyiraman berlebih (*over-irrigation*). Kondisi substrat yang jenuh air total (*waterlogged*) dalam durasi lama akan mengusir oksigen terlarut (*dissolved oxygen*) dari pori-pori media, memicu kondisi anaerobik (hipoksia akar) yang menjadi sarang ideal berkembangnya jamur patogen perusak akar seperti *Pythium ultimum* dan *Phytophthora sp.* (busuk akar/*root rot*).
2. **Kekurangan Air Kritis (*Under-irrigation*)**: Sebaliknya, pada hari yang terik ekstrem dengan hembusan angin kencang, media tanam dapat mengering jauh lebih cepat daripada siklus penyiraman timer berikutnya. Hal ini menyebabkan tanaman mengalami cekaman kekeringan (*water deficit stress*), yang mengakibatkan sel-sel penjaga stomata menutup, fotosintesis terhenti, layu sementara, hingga nekrosis pada tepi daun (*tip burn*) yang menurunkan kualitas dan harga jual hasil panen secara signifikan.
3. **Kelemahan Sistem Otomasi Suhu Sederhana**: Beberapa inovasi otomasi yang pernah diperkenalkan sebelumnya hanya mengandalkan sensor suhu udara (seperti DHT11/LM35). Ketika suhu udara panas melampaui 30°C, pompa otomatis menyiram. Hal ini terbukti keliru karena suhu udara yang panas tidak selalu berarti akar tanaman kehabisan air. Jika media tanam masih basah kuyup akibat penyiraman sebelumnya, penambahan air hanya akan membuang-buang pupuk nutrisi AB-Mix terlarut (*leaching*) dan merusak struktur perakaran.

Berdasarkan realitas permasalahan empiris tersebut, diperlukan sebuah terobosan teknologi tepat guna yang cerdas, efisien, dan andal. Universitas Negeri Surabaya (UNESA) melalui program **Mobilitas Akademis bagi Mahasiswa Semester 5** memfasilitasi mahasiswa untuk mengintegrasikan keilmuan akademis teoritis dengan aksi nyata pemberdayaan masyarakat pedesaan. Melalui program ini, dikembangkan sebuah proyek rekayasa berjudul **"Pengembangan Sistem Penyiraman Otomatis Hidroponik Berbasis Internet of Things (IoT) Menggunakan ESP32 dengan Metode Prioritas Kelembapan Substrat di Desa Jarak Kabupaten Kediri"**.

Sistem yang dibangun ini memperkenalkan kebaruan (*novelty*) berupa **Algoritma Kontrol Cerdas Berbasis Prioritas Substrat (*Soil Moisture Priority Algorithm*)**. Dalam algoritma ini, kondisi kelembapan media tanam ditetapkan sebagai syarat mutlak (*absolute condition*): selama media tanam masih berada pada ambang batas basah yang aman ($\ge 50\%$), pompa air **mutlak dilarang menyala**, seberapa pun panas atau keringnya kondisi udara di luar. Pompa hanya diizinkan aktif apabila media tanam terdeteksi mulai mengalami deplesi air ($< 50\%$) yang diperparah oleh kondisi udara kering ($< 60\%$), atau saat media mencapai batas kritis darurat ($< 35\%$). Sistem ini ditenagai oleh mikrokontroler canggih berkecepatan tinggi **ESP32**, dilengkapi dengan sensor lingkungan **DHT22**, potensiometer terkalibrasi sebagai simulator sensor media, modul aktuator **Relay**, display antarmuka visual **LCD 16x2 berbasis bus serial I2C**, serta konektivitas telemetri nirkabel ke platform **Blynk IoT**. Luaran proyek ini tidak hanya memecahkan kendala pertanian presisi bagi kelompok tani Desa Jarak, tetapi juga direkognisi secara akademik setara dengan **10 Satuan Kredit Semester (SKS)** pada kurikulum semester 5 di Universitas Negeri Surabaya.

---

### 1.2 Tujuan Program Mobilitas Akademis
Pelaksanaan program Mobilitas Akademis UNESA pada semester 5 ini memiliki tujuan komprehensif yang dirumuskan secara akademis dan teknologis sebagai berikut:
1. **Tujuan Rekayasa Perangkat Keras (*Hardware Engineering*)**:
   Merancang, memetakan, dan menyusun arsitektur sistem elektronika tertanam berbasis System on Chip (SoC) ESP32 DevKit V4 yang mengintegrasikan jalur analog-to-digital converter (ADC 12-bit) untuk sensor media tanam, jalur transmisi sinyal digital satu kawat (*single-wire bus*) untuk sensor lingkungan DHT22, antarmuka serial synchronous *Inter-Integrated Circuit* (I2C) untuk display LCD 16x2, dan pin logika aktuasi modul relay 5V.
2. **Tujuan Pengembangan Perangkat Lunak (*Software & Algorithm Development*)**:
   Mengembangkan arsitektur perangkat lunak tertanam (*firmware*) yang efisien, terstruktur, dan berbasis *non-blocking execution* menggunakan lingkungan PlatformIO, serta memformulasikan logika keputusan bertingkat (*hierarchical decision logic*) berbasis *Soil Moisture Priority* guna mengoptimasi siklus buka-tutup katup penyiraman hidroponik.
3. **Tujuan Integrasi Antarmuka Telemetri dan Fail-Safe Offline**:
   Membangun sistem antarmuka ganda (*dual interface*) yang mencakup visualisasi data lokal pada layar LCD 16x2 di lokasi kebun hidroponik Desa Jarak serta dasbor telemetri nirkabel berbasis *cloud* Blynk IoT, dilengkapi dengan mekanisme proteksi *autonomous offline fail-safe* agar sistem kendali tetap berfungsi secara otonom meskipun jaringan internet pedesaan mengalami *down*.
4. **Tujuan Validasi dan Pengujian Sistem (*System Verification*)**:
   Menguji reliabilitas respon aktuator dan akurasi pembacaan data instrumen melalui simulator virtual sirkuit Wokwi di bawah berbagai matriks kombinasi iklim mikro ekstrem, serta memastikan kode sumber terbebas dari kebocoran memori (*memory leak*) maupun tabrakan pengalamatan bus I2C.
5. **Tujuan Pengabdian dan Penerapan Teknologi Tepat Guna**:
   Menghadirkan cetak biru (*prototype blueprint*) teknologi tepat guna berbiaya terjangkau (*low-cost smart farming*) yang siap diterapkan langsung pada instalasi fertigasi kelompok tani Desa Jarak, Kabupaten Kediri, guna mendukung peningkatan efisiensi air dan nutrisi tanaman.

---

### 1.3 Manfaat Program Mobilitas Akademis
Program Mobilitas Akademis ini dirancang untuk memberikan dampak positif yang nyata, terukur, dan berkelanjutan bagi berbagai pemangku kepentingan (*stakeholders*):

#### A. Manfaat bagi Mahasiswa Pelaksana
1. **Peningkatan Kompetensi Keteknikan (*Hard Skills*)**: Memberikan pengalaman komprehensif dalam rekayasa sistem tertanam (*embedded system*), pemrograman mikrokontroler 32-bit dengan bahasa C/C++, penguasaan protokol komunikasi serial I2C, perancangan sirkuit elektronika, serta integrasi ekosistem IoT modern.
2. **Peningkatan Soft Skills dan Problem Solving**: Melatih kemampuan berpikir kritis, pemecahan masalah empiris di lapangan (*evidence-based problem solving*), manajemen waktu rekayasa proyek, serta komunikasi teknis kepada masyarakat non-akademisi di pedesaan.
3. **Penyetaraan Capaian Pembelajaran Lulusan (CPL)**: Mendapatkan rekognisi akademis penuh setara dengan **10 SKS** yang dikonversikan ke dalam mata kuliah kurikulum semester 5 di Universitas Negeri Surabaya.

#### B. Manfaat bagi Universitas Negeri Surabaya (UNESA)
1. **Penguatan Indikator Kinerja Utama (IKU)**: Berkontribusi secara langsung pada ketercapaian IKU 2 (mahasiswa mendapatkan pengalaman di luar kampus) dan IKU 5 (hasil kerja dosen dan mahasiswa diterapkan oleh masyarakat).
2. **Hilirisasi Inovasi Riset Perguruan Tinggi**: Menjadi wujud nyata penerapan riset terapan kampus ke masyarakat daerah, memperkuat peran UNESA sebagai episentrum inovasi IPTEKS yang adaptif terhadap kebutuhan agrikultur Jawa Timur.
3. **Kemitraan Strategis Berkelanjutan**: Membuka jejaring kemitraan riset dan pengabdian masyarakat jangka panjang antara Fakultas Teknik UNESA dengan Pemerintah Kabupaten Kediri dan kelompok tani lokal.

#### C. Manfaat bagi Kelompok Tani dan Masyarakat Desa Jarak Kabupaten Kediri
1. **Modernisasi Sistem Pengairan Hidroponik**: Menyediakan solusi teknologi otomasi penyiraman yang cerdas, menggantikan metode konvensional yang melelahkan dan rawan salah.
2. **Efisiensi Penggunaan Air dan Nutrisi**: Mengurangi pemborosan pupuk AB-Mix terlarut dan konsumsi air hingga 35% – 45% karena penyiraman hanya berlangsung pada saat media tanam benar-benar membutuhkannya.
3. **Peningkatan Mutu dan Kapasitas Hasil Panen**: Mengeliminasi risiko gagal panen akibat penyakit busuk akar (*root rot*) dan kekeringan daun (*tip burn*), sehingga bobot segar, kesegaran, dan nilai jual sayuran hidroponik meningkat secara konsisten.

---

# BAB 2. TINJAUAN PUSTAKA

### 2.1 Tinjauan Teoritis

#### 2.1.1 Pertanian Presisi dan Budidaya Hidroponik Substrat Tropis
Pertanian presisi (*Precision Agriculture*) adalah konsep manajemen budidaya pertanian yang bertumpu pada observasi, pengukuran, dan tindakan terukur terhadap variabilitas mikroklimat tanaman secara spasial dan temporal. Pada sistem hidroponik substrat (drip fertigation), tanaman ditanam pada media padat anorganik atau organik yang berfungsi murni sebagai penopang jangkar perakaran (*root anchor*) dan penyerap larutan hara, bukan sebagai penyedia unsur hara alami seperti tanah lempung. 

Karakteristik fisik media substrat populer di wilayah Kediri meliputi:
* **Cocopeat (Sabut Kelapa Halus)**: Memiliki kapasitas retensi air (*water holding capacity*) hingga 8 – 9 kali bobot keringnya dan aerasi pori sebesar 15% – 20%. Namun, cocopeat rentan menjadi terlalu basah jika drainase dan frekuensi penyiraman tidak terkontrol ketat.
* **Arang Sekam Padi**: Memiliki kapasitas drainase yang sangat cepat dengan aerasi pori tinggi (mencapai 40% – 50%), namun retensi airnya lebih rendah dibandingkan cocopeat. Sering dicampur dengan rasio 1:1 bersama cocopeat untuk menciptakan media perakaran yang seimbang.

Dalam agronomi presisi tanaman sayuran daun tropis:
* **Kapasitas Lapang (*Field Capacity*)**: Terjadi pada kelembapan media 70% – 85%. Pada rentang ini, pori kapiler terisi penuh larutan hara sementara pori non-kapiler terisi udara oksigen.
* **Batas Deplesi Air Aman (*Management Allowed Depletion* / MAD)**: Ditetapkan pada batas kelembapan 50% – 55%. Jika kadar air media turun di bawah batas ini, ketersediaan air mulai berkurang namun tanaman belum mengalami kerusakan jaringan permanen.
* **Titik Layu Kritis (*Permanent Wilting Point*)**: Berada pada rentang kadar air media $< 35\%$. Pada titik ini, energi hisap air oleh akar (*root osmotic potential*) kalah oleh gaya kapiler partikel substrat yang mengikat air, memicu kerusakan seluler stomata yang tidak dapat pulih kembali jika tidak segera disiram.

#### 2.1.2 Mikrokontroler ESP32 DevKit V4 dan Arsitektur SoC
ESP32 merupakan System on Chip (SoC) mikro berbiaya rendah dan berkemampuan komputasi tinggi yang dikembangkan oleh Espressif Systems. Mikrokontroler ini mengintegrasikan mikroprosesor 32-bit Xtensa Dual-Core LX6 dengan frekuensi clock operasional variabel hingga 240 MHz, menghasilkan daya komputasi hingga 600 DMIPS. ESP32 dilengkapi dengan memori internal 520 KB SRAM, memori flash eksternal 4 MB untuk penyimpanan firmware, modul transceiver Wi-Fi terintegrasi (802.11 b/g/n pada frekuensi 2.4 GHz), dan Bluetooth ganda (v4.2 BR/EDR dan Bluetooth Low Energy / BLE).

Pada proyek ini, keunggulan fitur arsitektural ESP32 yang dimanfaatkan meliputi:
1. **Konverter Analog-ke-Digital (ADC 12-Bit)**: Memiliki resolusi pembacaan hingga 4096 tingkat diskrit (rentang nilai mentah integer 0 hingga 4095), yang menghasilkan presisi kuantisasi tegangan sebesar:
   $$\text{Resolusi ADC} = \frac{V_{\text{ref}}}{2^{12} - 1} = \frac{3.3\,\text{V}}{4095} \approx 0.8058\,\text{mV/step}$$
   Tingkat presisi ini sangat unggul dibandingkan mikrokontroler konvensional berbasis AVR (seperti Arduino Uno) yang hanya memiliki ADC 10-bit (resolusi 4.88 mV/step). Pin GPIO 34 (saluran ADC1_CH6) dipilih karena merupakan pin *input-only* yang tidak terpengaruh oleh transisi logika modul Wi-Fi internal.
2. **Fleksibilitas Pin Multiplexing**: Jalur input/output serbaguna yang mendukung konfigurasi bus perangkat keras I2C, SPI, dan UART secara simultan tanpa konflik antar saluran.

#### 2.1.3 Sensor Kelembapan Media Tanam dan Pemetaan ADC 12-Bit
Sensor kelembapan media tanam bertugas mendeteksi kandungan air volumetrik (*Volumetric Water Content* / VWC) pada zona perakaran. Dalam implementasi lapangan, digunakan modul sensor kelembapan tipe kapasitif (*Capacitive Soil Moisture Sensor v1.2*). Berbeda dengan sensor resistif tipe garpu tembaga yang cepat rusak akibat proses korosi elektrokimia (*galvanic corrosion*) karena kontak langsung dengan larutan garam nutrisi hidroponik, sensor kapasitif memanfaatkan pelat tembaga berinsulasi pernis dielektrik yang mengukur perubahan konstanta permitivitas dielektrik relatif ($\varepsilon_r$) di sekitar sensor:
* Air murni memiliki konstanta dielektrik relatif $\approx 80$.
* Udara memiliki konstanta dielektrik relatif $\approx 1$.
* Partikel padat substrat kering memiliki konstanta dielektrik relatif $\approx 3 - 5$.

Perubahan kelembapan media tanam menyebabkan osilator sirkuit timer 555 pada sensor menghasilkan perubahan tegangan analog linier terbalik. Dalam lingkungan perancangan dan simulasi Wokwi, dinamika ini disimulasikan menggunakan potensiometer linier 10 kΩ yang menghasilkan tegangan keluaran 0 – 3.3V, kemudian dipetakan ke dalam format persentase kelembapan 0% hingga 100% menggunakan formula transformasi affine:
$$\text{Moisture}_{\%} = \text{map}(\text{rawADC}, 0, 4095, 0, 100) = \left\lfloor \frac{\text{rawADC} \times 100}{4095} \right\rfloor$$

#### 2.1.4 Sensor Digital Suhu dan Kelembapan Relatif DHT22
Sensor DHT22 (dikenal pula dengan nama komersial AM2302) adalah sensor mikroklimat terkalibrasi yang menghasilkan sinyal digital paket data 40-bit melalui satu kawat bus dua arah (*single-wire bi-directional bus*). Sensor ini mengintegrasikan komponen sensor kelembapan kapasitif dan termistor koefisien temperatur negatif (NTC) presisi tinggi yang terhubung ke mikrokontroler 8-bit internal terdedikasi.
* **Rentang Pengukuran Suhu**: $-40^\circ\text{C}$ hingga $+80^\circ\text{C}$ dengan akurasi $\pm 0.5^\circ\text{C}$ dan resolusi $0.1^\circ\text{C}$.
* **Rentang Pengukuran Kelembapan Relatif**: $0\%$ hingga $100\%$ RH dengan akurasi $\pm 2\%$ RH dan resolusi $0.1\%$ RH.

Protokol transmisi data sensor DHT22 diawali dengan sinyal *Start* berlogika LOW selama minimal 18 ms oleh mikrokontroler host (ESP32), diikuti respon konfirmasi dari DHT22 berupa sinyal LOW 80 µs dan HIGH 80 µs. Selanjutnya, DHT22 mengirimkan 40 bit data yang terdiri dari 16 bit data kelembapan relatif, 16 bit data temperatur, dan 8 bit data *checksum* parity untuk memastikan integritas data terbebas dari derau (*noise*).

#### 2.1.5 Konsep Dinamika *Vapor Pressure Deficit* (VPD) dan Transpirasi
Dalam agrometeorologi tropis, kelembapan relatif udara (RH) dan suhu udara tidak dapat dipisahkan dalam mengevaluasi kebutuhan air tanaman. Fenomena utama yang mengendalikan laju penyerapan air dari akar ke daun adalah Defisit Tekanan Uap Air (*Vapor Pressure Deficit* / VPD), yakni selisih antara tekanan uap jenuh air di dalam stomata daun ($VPsat$) dengan tekanan uap air aktual di udara bebas ($VPact$):
$$VPD = VP_{sat}(T) - VP_{act}(T, RH) = 0.61078 \times e^{\left(\frac{17.27 \times T}{T + 237.3}\right)} \times \left(1 - \frac{RH}{100}\right)\quad [\text{kPa}]$$
* Pada kondisi **VPD Rendah ($< 0.4\,\text{kPa}$)** (udara dingin dan sangat basah/lembab): Laju transpirasi terhenti, air tidak terpompa ke pucuk tanaman, dan risiko serangan penyakit jamur meningkat.
* **VPD Optimal Tanaman Sayur ($0.8 - 1.2\,\text{kPa}$)**: Transpirasi berjalan lancar, stomata membuka optimal, dan asimilasi karbon terjadi maksimal.
* Pada kondisi **VPD Sangat Tinggi ($> 1.6 - 2.0\,\text{kPa}$)** (kondisi siang hari terik di Kediri dengan suhu $> 32^\circ\text{C}$ dan RH $< 50\%$): Atmosfer "menghisap" air dari daun dengan kecepatan sangat tinggi. Jika kelembapan media tanam mulai menurun ($< 50\%$), tanaman tidak akan mampu mengimbangi laju penguapan tersebut, memicu *cavitation* (terputusnya kolom air pada pembuluh xilem) dan layu permanen. Oleh karena itu, logika irigasi pada proyek ini membenarkan bahwa penyiraman harus dipercepat jika kelembapan tanah $< 50\%$ bertemu dengan kelembapan udara yang kering ($< 60\%$).

#### 2.1.6 Aktuator Relay Elektromekanik dan Rangkaian Pensaklaran Pompa
Modul relay 1-channel bertindak sebagai saklar isolasi galvanik antara sirkuit kendali logika digital ESP32 berdaya rendah (3.3V/5V DC) dengan sirkuit beban daya aktuator pompa air induktif (pompa submersibel 12V DC atau 220V AC). Modul relay ini dilengkapi dengan optocoupler internal untuk melindungi pin GPIO mikrokontroler dari sengatan arus balik (*transient back-EMF spike*) yang dihasilkan oleh kumparan motor pompa saat dimatikan. Pada proyek ini, pin GPIO 2 ESP32 mengendalikan modul relay dengan konfigurasi logika aktif tinggi (*Active HIGH*), di mana pemberian sinyal `HIGH` (logika 1 / 3.3V) akan mengaktifkan kumparan elektromekanik, menghubungkan kontak saklar *Normally Open* (NO) ke terminal *Common* (COM), dan menyalakan pompa air secara seketika.

#### 2.1.7 Protokol Serial Komunikasi *Inter-Integrated Circuit* (I2C) pada LCD 16x2
Layar penampil karakter dot-matrix LCD 16x2 konvensional umumnya memerlukan 6 hingga 10 jalur kabel sinyal (RS, EN, D4, D5, D6, D7, R/W, Backlight). Pengkabelan paralel tersebut sangat memboroskan alokasi pin I/O pada mikrokontroler ESP32. Dengan menambahkan modul konverter serial berbasis chip expander I/O **PCF8574**, antarmuka tampilan dipadatkan menjadi protokol serial 2 kawat synchronous I2C:
* **SDA (*Serial Data Line*)**: Terhubung ke GPIO 21 ESP32, berfungsi mentransmisikan data perintah dan karakter byte secara sekuensial bit per bit sinkron dengan pulsa clock.
* **SCL (*Serial Clock Line*)**: Terhubung ke GPIO 22 ESP32, berfungsi sebagai jalur pulsa clock master sinkronisasi berkecepatan standar 100 kHz (*Standard Mode*).
* **Pengalamatan Register I2C**: Modul PCF8574 beroperasi pada alamat default heksadesimal `0x27` (atau `0x3F`), memungkinkan integrasi display tanpa mengganggu peripheral lain pada bus I2C yang sama.

#### 2.1.8 Ekosistem *Cloud Computing* Blynk IoT dan Pemrograman *Non-Blocking*
Blynk IoT merupakan platform arsitektur platform-as-a-service (PaaS) berbasis cloud yang dirancang khusus untuk memfasilitasi komunikasi bidirectional machine-to-machine (M2M) pada aplikasi mikrokontroler. ESP32 berkomunikasi dengan Blynk Cloud Server melalui jaringan Wi-Fi berbasis protokol TCP/IP ringan dengan pertukaran data melalui abstraksi saluran saluran perangkat lunak yang disebut **Virtual Pins**:
* **Virtual Pin 0 (V0)**: Saluran pengiriman data integer kelembapan media tanam (0 – 100%) ke widget Gauge.
* **Virtual Pin 1 (V1)**: Saluran pengiriman data float temperatur udara (°C) ke widget Value Display.
* **Virtual Pin 2 (V2)**: Saluran pengiriman data float kelembapan relatif udara (% RH) ke widget Gauge.
* **Virtual Pin 3 (V3)**: Saluran pengiriman status biner relay pompa (0 = MATI, 255 = MENYIRAM) ke widget LED indikator.

Salah satu kaidah rekayasa perangkat lunak terpenting yang diterapkan dalam proyek ini adalah penghindaran total fungsi pemblokir waktu `delay()`. Fungsi `delay()` bersifat *blocking*, yakni memaksa CPU mengeksekusi instruksi kosong (*idle cycle*), yang dapat menyebabkan kegagalan respon komunikasi TCP/IP pada modul Wi-Fi dan antarmuka display. Sebagai gantinya, digunakan objek perangkat lunak pewaktu terdedikasi **`BlynkTimer`** yang mengeksekusi fungsi callback logika sensor secara periodik (setiap 1000 ms) berbasis komputasi *non-blocking*.

### 2.2 Penelitian Sebelumnya (*Literature Review & Research Gap*)

#### 2.2.1 Tinjauan Studi Terdahulu
Terdapat beberapa penelitian terdahulu yang mengkaji otomatisasi sistem irigasi, sistem kendali mikroklimat greenhouse, dan penerapan Internet of Things (IoT) pada sektor agrikultur presisi:
1. **Wibowo & Suryani (2021)** dalam penelitiannya tentang *"Otomasi Irigasi Tetes Berbasis Real Time Clock (RTC) pada Tanaman Sayur Hortikultura"* menemukan bahwa penggunaan timer RTC mampu menggantikan tenaga manusia dalam menyiram secara periodik dan menghemat waktu operasional hingga 50%. Namun, sistem yang dikembangkan belum adaptif terhadap dinamika iklim riil; penyiraman tetap berjalan meski terjadi hujan atau media tanam masih basah kuyup, sehingga memicu pembusukan akar (*root rot*) akibat kelebihan air (*over-irrigation*).
2. **Kurniawan, Prasetyo, & Utomo (2022)** dalam penelitian *"Sistem Pengendalian Iklim Mikro Greenhouse Menggunakan Sensor DHT11 dan NodeMCU ESP8266"* menunjukkan bahwa pemantauan suhu dan kelembapan udara efektif menurunkan temperatur greenhouse saat cuaca terik. Namun, penelitian ini memiliki kelemahan mendasar karena pompa penyiraman diaktifkan semata-mata berdasarkan suhu udara ($> 31^\circ\text{C}$), tanpa membaca kadar air aktual di zona perakaran. Akibatnya, tanaman sering kali disiram saat media tanam masih berada pada kapasitas lapang, menyebabkan pemborosan air dan pencucian larutan nutrisi hara (*nutrient leaching*).
3. **Al-Huda, Wahyudi, & Nugroho (2023)** dalam penelitian *"IoT-Based Automated Drip Irrigation Using Capacitive Soil Moisture Sensor for Precision Farming in Tropical Climates"* membuktikan bahwa penggunaan sensor kelembapan tanah kapasitif lebih tahan terhadap korosi elektrokimia dan mampu memicu pompa saat kelembapan tanah turun di bawah ambang 40%. Namun, sistem tersebut hanya mengandalkan sensor tunggal pada tanah tanpa mengintegrasikan parameter kelembapan atmosfer mikro. Pada iklim tropis yang sangat terik, tanaman sempat mengalami stres dehidrasi daun (*water stress*) sebelum sensor tanah mendeteksi penurunan kadar air.
4. **Santoso & Wijaya (2024)** dalam penelitian *"Implementasi Smart Farming Hidroponik Berbasis ESP32 dan Platform IoT Komersial"* berhasil mengintegrasikan transmisi data telemetri ke cloud server secara real-time. Namun, sistem tersebut memiliki kelemahan kritis pada ketergantungan koneksi jaringan; mikrokontroler mengalami kondisi *stuck/freeze* saat jaringan internet pedesaan terputus akibat fungsi pemanggilan koneksi cloud yang bersifat *blocking*, sehingga sistem otomasi penyiraman gagal berfungsi secara mandiri di lokasi perkebunan.

#### 2.2.2 Analisis Kesenjangan (*Research Gap Analysis*)
Berdasarkan telaah kritis terhadap studi-studi terdahulu, diidentifikasi beberapa celah penelitian (*research gap*) utama yang menjadi landasan inovasi proyek ini:

#### Tabel 2.2 Analisis Kesenjangan Penelitian (*Research Gap Analysis*)
| No. | Aspek Komparasi | Sistem Konvensional / Penelitian Sebelumnya | Solusi Inovasi Proyek Ini (Desa Jarak, Kab. Kediri) |
|:---:|:---|:---|:---|
| 1. | **Logika Pemicu Penyiraman (Presisi Pengairan)** | Mengandalkan jadwal waktu kaku (*timer RTC*) atau pemicu suhu udara semata, tanpa memeriksa apakah perakaran tanaman masih memiliki cadangan air yang cukup. | **Logika Prioritas Kelembapan Substrat (*Soil Moisture Priority*)**: Kelembapan media tanam dijadikan syarat mutlak; selama tanah aman ($\ge 50\%$), pompa **mutlak dilarang menyala** apapun kondisi udaranya. |
| 2. | **Dinamika Iklim Mikro Tropis** | Menggunakan sensor tunggal (hanya tanah atau hanya suhu), sehingga gagal mengantisipasi laju penguapan ekstrem saat siang terik di daerah tropis. | **Integrasi Multi-Sensor Adaptif (Dual-Factor)**: Mengombinasikan sensor tanah analog ADC 12-bit dan DHT22; jika tanah mulai kering ($< 50\%$) didukung udara kering ($< 60\%$), penyiraman langsung aktif secara dini. |
| 3. | **Pencegahan Penyakit Busuk Akar (*Root Rot*)** | Sistem tetap menyiram pada saat media masih jenuh air, menyebabkan hilangnya aerasi oksigen pada pori media dan memicu infeksi jamur patogen akar. | **Proteksi Anti Over-Irrigation**: Pompa secara otomatis diputus arusnya saat media mencapai batas basah aman, menjaga keseimbangan kadar air dan aerasi oksigen terlarut (*dissolved oxygen*). |
| 4. | **Keandalan Konektivitas Lapangan (*Fail-Safe*)** | Sistem mengandalkan koneksi cloud penuh dan rentan mengalami *freeze/crash* saat jaringan internet pedesaan mengalami *down* atau sinyal terputus. | **Autonomous Offline Mode**: Arsitektur *fail-safe* non-blocking yang mendeteksi status token; sistem tetap mengeksekusi logika sensor, LCD, dan pompa 100% mandiri tanpa koneksi internet. |
| 5. | **Antarmuka Visual Pemantauan Petani** | Data hanya dapat dipantau melalui aplikasi smartphone yang membingungkan bagi petani konvensional, atau tidak memiliki penampil visual di lokasi kebun. | **Dual Interface Terintegrasi**: Menyediakan layar display lokal LCD 16x2 I2C di green house Desa Jarak untuk pembacaan instan di lapangan, sekaligus dasbor telemetri grafis Blynk IoT di smartphone. |

#### 2.2.3 Analisis Tren Terkini (*State of the Art*)
Tren digitalisasi sektor pertanian presisi saat ini bergerak ke arah *Open Agriculture Data*, *IoT Edge Computing*, dan *Autonomous Resource Optimization*. Petani menuntut solusi otomasi irigasi yang hemat air, presisi, berbiaya terjangkau (*low-cost*), dan dapat beroperasi secara otonom tanpa memerlukan keahlian komputasi tingkat tinggi. Penggunaan mikrokontroler SoC berkecepatan tinggi seperti ESP32 (Xtensa Dual-Core 32-bit, 240 MHz) dengan protokol komunikasi serial hemat pin I2C (*Inter-Integrated Circuit*) serta ekosistem kompilasi modern berbasis PlatformIO menjadi standar mutakhir yang menjamin kecepatan *response time*, konsumsi memori rendah, serta fleksibilitas pemeliharaan jangka panjang tanpa biaya lisensi perangkat lunak yang mahal (*zero software license cost*).

#### 2.2.4 Variabel-Variabel yang Diteliti
**1. Definisi Operasional Variabel**  
Dalam penelitian dan pengembangan purwarupa sistem irigasi cerdas hidroponik di Desa Jarak ini, variabel-variabel yang diteliti diklasifikasikan sebagai berikut:

**A. Variabel Bebas (Variabel Independen)**
* **Nama Variabel**: SISTEM PENYIRAMAN OTOMATIS BERBASIS IOT DENGAN ALGORITMA PRIORITAS SUBSTRAT
* **Definisi**: Penerapan sistem otomasi berbasis mikrokontroler ESP32 yang memproses masukan data analog kelembapan media tanam dan paket data digital kelembapan udara secara berkelanjutan (*real-time*) untuk menentukan waktu dan durasi pensaklaran relay pompa air secara adaptif.
* **Indikator Pengukuran**:
  1. Kecepatan respon pembacaan sinyal tegangan analog sensor media tanam pada ADC 12-bit (GPIO 34).
  2. Akurasi pembacaan paket data kelembapan relatif udara (% RH) dan suhu (°C) dari sensor digital DHT22 (GPIO 15).
  3. Ketepatan eksekusi logika kontrol bertingkat (*Soil Moisture Priority*) pada pin sinyal aktuator relay (GPIO 2).
  4. Efisiensi penjadwalan fungsi non-blocking via `BlynkTimer` dengan interval pemanggilan periodik konstan 1000 ms.

**B. Variabel Terikat (Variabel Dependen)**
* **Nama Variabel**: EFISIENSI KADAR AIR SUBSTRAT DAN KEANDALAN OPERASIONAL SISTEM HIDROPONIK
* **Definisi**: Kestabilan tingkat kejenuhan air pada zona perakaran media tanam, efisiensi konsumsi larutan nutrisi pupuk, serta keandalan operasional sistem otomasi saat diterapkan pada instalasi hidroponik.
* **Indikator Pengukuran**:
  1. Kestabilan nilai kelembapan media tanam pada rentang kapasitas lapang aman ($50\% - 80\%$).
  2. Pencegahan kondisi dehidrasi kritis media tanam ($< 35\%$) dan pencegahan penyiraman berlebih (*over-irrigation*) saat media masih basah ($\ge 50\%$).
  3. Penurunan rasio durasi aktif pompa air per hari (efisiensi konsumsi larutan hara AB-Mix hingga 30% – 40%).
  4. Keandalan operasional sistem (*uptime*) saat terjadi pemutusan jaringan internet (*Offline Fail-Safe Availability* mencapai 100%).
  5. Keterbacaan dan kestabilan refresh parameter pada antarmuka visual LCD 16x2 I2C tanpa fenomena kedipan (*flicker-free*).

**C. Variabel Kontrol (Variabel Pengendali)**
* **Nama Variabel**: SPESIFIKASI INSTRUMEN DAN KONDISI MEDIA TANAM
* **Definisi**: Parameter-parameter teknis dan fisik yang dikendalikan konstan selama siklus pengujian sistem guna menjaga validitas evaluasi algoritma.
* **Indikator Pengendalian**:
  1. Jenis media tanam hidroponik substrat yang distandarkan (campuran partikel *cocopeat* dan arang sekam dengan rasio volume 1:1).
  2. Arsitektur mikrokontroler uji (ESP32 DevKit V4 berkecepatan clock 240 MHz).
  3. Tegangan suplai daya operasional sistem (ditetapkan konstan pada 3.3V DC untuk sensor dan 5.0V DC untuk modul relay dan LCD).
  4. Alamat bus register I2C pada modul display (ditetapkan konstan pada alamat heksadesimal `0x27`).

**2. Hubungan Antar Variabel (Kerangka Pemikiran)**  
Hubungan sebab-akibat antar-variabel dalam proyek ini dijelaskan melalui alur pemikiran berikut:
1. **Pengaruh Sistem Otomasi Berbasis Prioritas Substrat terhadap Kestabilan Kadar Air dan Kesehatan Tanaman**: Ketersediaan logika kontrol bertingkat (*Soil Moisture Priority*) berbasis mikrokontroler ESP32 secara langsung mengeliminasi risiko *over-irrigation* pada saat media tanam masih berada pada batas aman ($\ge 50\%$). Sensor kapasitif dan DHT22 memantau kondisi aktual perakaran dan laju penguapan mikroklimat tropis, sehingga pompa hanya aktif pada saat tanaman benar-benar membutuhkan air (kondisi deplesi $< 50\%$ saat udara kering $< 60\%$ atau kondisi kritis $< 35\%$). Kadar air media tanam terjaga konsisten pada kapasitas lapang ($50\% - 80\%$) dengan aerasi oksigen pori yang seimbang, yang secara terukur mampu mencegah hipoksia perakaran dan meminimalisasi infeksi jamur patogen busuk akar (*root rot*) seperti *Pythium sp.* pada perkebunan hidroponik Desa Jarak.
2. **Pengaruh Kestabilan Irigasi dan Pemantauan Dual Interface terhadap Efisiensi Sumber Daya dan Kepuasan Petani**: Ketika proses penyiraman tanaman dapat dieksekusi secara otomatis dan akurat sesuai kebutuhan biologis tanaman, serta dinamika parameter lingkungan (suhu, kelembapan udara, kelembapan media) dapat dipantau secara transparan baik melalui layar visual LCD 16x2 I2C di lokasi greenhouse maupun dasbor telemetri Blynk IoT di gawai petani, pemborosan larutan nutrisi pupuk AB-Mix dan air dapat ditekan secara signifikan hingga 30% – 40%. Peningkatan efisiensi sumber daya dan berkurangnya beban kerja manual harian ini secara nyata meningkatkan produktivitas panen sayuran berkualitas prima serta mendorong kepuasan dan adopsi teknologi oleh kelompok tani di Desa Jarak, Kabupaten Kediri.

### 2.3 Luaran Berdampak yang Diusulkan
Rencana luaran berdampak dari proyek Program Mobilitas Akademis ini diklasifikasikan ke dalam 3 bidang utama yang dirancang untuk memberikan kemanfaatan teknologi, edukasi, dan keberlanjutan ekonomi bagi masyarakat Desa Jarak, Kabupaten Kediri:

#### 1. Bidang Teknologi Pertanian Presisi dan Internet of Things (IoT)
* **Bentuk Luaran**:
  * **Purwarupa Hardware Controller Irigasi Cerdas ESP32**: Modul perangkat keras pengendali otomatis tertanam yang mengintegrasikan mikrokontroler SoC ESP32 DevKit V4, sensor kelembapan media tanam analog (ADC 12-bit), sensor digital mikroklimat DHT22, dan modul aktuator saklar relay pompa air 1-channel.
  * **Firmware Tertanam Non-Blocking & Fail-Safe Offline**: Kode program modular C/C++ berbasis framework PlatformIO yang menerapkan algoritma *Soil Moisture Priority* serta fitur ketahanan otonom tanpa internet (*autonomous offline fallback*).
  * **Sistem Antarmuka Pemantauan Ganda (Dual Interface Monitoring)**: Layar display visual lokal LCD 16x2 berbasis bus I2C (PCF8574) di lokasi green house serta dasbor telemetri nirkabel Blynk IoT (Virtual Pin V0, V1, V2, V3) untuk pemantauan parameter suhu, kelembapan udara, kelembapan tanah, dan status pompa secara *real-time*.
* **Indikator Keberhasilan**: Sistem dapat beroperasi stabil 24 jam nonstop dengan waktu siklus eksekusi logika kontrol periodik setiap 1 detik (1000 ms), pembacaan instrumen berakurasi tinggi (tingkat kesalahan/error sensor $< 3\%$), pembaharuan tampilan LCD tanpa fenomena kedipan (*flicker-free*), serta ketersediaan sistem (*uptime*) mencapai 100% baik pada kondisi online maupun saat terjadi pemutusan jaringan internet.
* **Dampak Nyata**: Menggantikan metode penyiraman manual dan timer statis yang memakan waktu dan tenaga fisik petani, mempercepat respon penanganan kebutuhan air tanaman dari yang sebelumnya memerlukan pengecekan manual berulang kali menjadi hitungan detik secara otomatis, serta mengeliminasi risiko kelalaian manusia (*human error*) yang memicu gagal panen akibat busuk akar maupun kekeringan daun.
* **Mitra Terkait**: Kelompok Tani Hidroponik Desa Jarak (Ketua Kelompok Tani, Pengelola Kebun Hidroponik Dusun Krajan dan Dusun Pertanian), serta Pemerintah Desa Jarak, Kecamatan Plosoklaten, Kabupaten Kediri.

#### 2. Bidang Pendidikan, Edukasi, dan Literasi Teknologi Pertanian
* **Bentuk Luaran**:
  * **Modul Panduan Penggunaan Sistem (*User Manual Book*)**: Buku panduan komprehensif berformat digital interaktif (*e-book/PDF*) dan cetak ringkas yang memuat tata cara instalasi alat, pengoperasian sistem, interpretasi kode tampilan LCD, serta langkah-langkah kalibrasi sensor bagi warga dan pengelola kebun.
  * **Dokumen Standar Operasional Prosedur (SOP) Perawatan Instrumen**: Dokumen SOP pemeliharaan preventif berkala, panduan pembersihan elektroda sensor media tanam dari kerak deposit garam nutrisi pupuk, dan tata cara penanganan kendala teknis (*troubleshooting* mandiri).
  * **Video Panduan Singkat dan Infografis Ringkas**: Media edukasi visual berdurasi singkat mengenai alur kerja sistem irigasi cerdas, cara membaca status pompa (`[PUMP:ON]` vs `[STANDBY]`), serta panduan konfigurasi pemantauan aplikasi Blynk IoT melalui ponsel pintar.
* **Indikator Keberhasilan**: Tersosialisasikannya teknologi sistem otomasi irigasi kepada minimal 85% perwakilan anggota kelompok tani hidroponik Desa Jarak, terlaksananya pelatihan mandiri pengoperasian alat dengan tingkat pemahaman peserta $\ge 80\%$, serta terwujudnya kemampuan petani dalam melakukan troubleshooting ringan secara independen tanpa ketergantungan teknisi luar.
* **Dampak Nyata**: Meningkatkan literasi digital dan keterbukaan adopsi teknologi pertanian cerdas (*Smart Precision Farming*) di tingkat pedesaan, mentransformasi pola pikir petani dari agrikultur konvensional menuju pertanian berbasis data (*data-driven agriculture*), serta menumbuhkan kapasitas kemandirian teknologi masyarakat lokal.
* **Mitra Terkait**: Pengurus RT/RW, Karang Taruna Agrobisnis Desa Jarak, Penyuluh Pertanian Lapangan (PPL) Dinas Pertanian Kecamatan Plosoklaten, serta Laboratorium Sistem Cerdas Fakultas Teknik Universitas Negeri Surabaya (UNESA).

#### 3. Bidang Efisiensi Ekonomi Agribisnis dan Keberlanjutan Lingkungan
* **Bentuk Luaran**:
  * **Model Formula Irigasi Presisi Berbasis Kebutuhan Tanaman**: Protokol penyiraman adaptif berbasis prioritas kelembapan media yang menjamin pemberian air dan nutrisi hara hanya terjadi pada saat zona perakaran tanaman benar-benar membutuhkannya.
  * **Laporan Evaluasi Efisiensi Sumber Daya dan Produktivitas Panen**: Dokumen data komparatif efisiensi penggunaan larutan nutrisi pupuk AB-Mix dan air tawar serta catatan kenaikan bobot panen sayuran hidroponik per siklus tanam.
* **Indikator Keberhasilan**: Terjadinya penghematan konsumsi air dan larutan pupuk nutrisi hidroponik sebesar 30% hingga 40% dibandingkan metode konvensional, angka mortalitas tanaman akibat penyakit busuk akar (*root rot*) turun hingga mendekati 0%, serta peningkatan bobot segar panen sayuran daun berkualitas prima (seperti selada dan pakcoy) sebesar 15% – 20%.
* **Dampak Nyata**: Menurunkan biaya pengeluaran operasional harian petani untuk pembelian pupuk nutrisi dan konsumsi listrik pompa secara terukur, meningkatkan margin laba bersih penjualan hasil panen bagi kelompok tani Desa Jarak, serta mewujudkan prinsip pertanian ramah lingkungan (*sustainable green farming*) melalui penghematan cadangan air tanah pedesaan.
* **Mitra Terkait**: Badan Usaha Milik Desa (BUMDes) Jarak, Unit Pemasaran Hortikultura Kelompok Tani Desa Jarak, serta Dinas Pertanian dan Perkebunan Kabupaten Kediri.

---

# BAB 3. METODE STUDI INDEPENDEN

### 3.1 Waktu dan Tempat Pelaksanaan
* **Waktu Pelaksanaan**: Program Mobilitas Akademis ini dilaksanakan selama 1 semester penuh pada Semester Gasal/Genap Tahun Akademik 2025/2026, berdurasi 16 minggu kerja efektif yang setara dengan beban penyetaraan perkuliahan 10 SKS.
* **Tempat Pelaksanaan**:
  1. **Lokasi Lapangan Mitra**: Kebun Hidroponik Percontohan Kelompok Tani Desa Jarak, Kecamatan Plosoklaten, Kabupaten Kediri, Jawa Timur.
  2. **Laboratorium Perancangan & Simulasi**: Laboratorium Rekayasa Perangkat Lunak dan Sistem Cerdas, Fakultas Teknik, Universitas Negeri Surabaya (UNESA), serta lingkungan komputasi awan *Wokwi Simulator* dan *PlatformIO Embedded Engine*.

---

### 3.2 Metodologi Penyelesaian Tugas
Penyelesaian tugas akhir studi independen ini menggunakan pendekatan **Project-Based Learning (PBL)** dan **Riset Terapan (*Applied Research*)** melalui kerangka kerja pengembangan sistem rekayasa perangkat tertanam (*Embedded Systems Development Life Cycle* / ESDLC) yang dipadukan dengan teori adopsi teknologi (*Technology Acceptance Model* / TAM) serta analisis dinamika mikroklimat presisi berbasis IoT.

Adapun tahapan metodologi penyelesaian tugas diuraikan sebagai berikut:

#### 1. Tahap Analisis Kebutuhan dan Studi Observasi (*Requirement Analysis*)
* **Identifikasi Masalah**: Mahasiswa melakukan studi observasi lapangan dan diskusi terarah bersama perangkat desa dan kelompok tani (Kepala Desa Jarak, Sekretaris Desa, serta Pengelola Kebun Hidroponik Dusun Krajan dan Dusun Pertanian) guna mengidentifikasi hambatan dalam mekanisme irigasi konvensional yang masih bersifat manual dan timer statis yang kaku, boros nutrisi hara, serta rawan memicu pembusukan akar (*root rot*).
* **Pengumpulan Data Mikroklimat & Karakteristik Media**: Mengumpulkan data awal terkait fluktuasi suhu dan kelembapan udara harian di green house Desa Jarak, kapasitas retensi air media substrat (*cocopeat* dan arang sekam), batas deplesi air aman ($\ge 50\%$), batas kritis kekeringan ($< 35\%$), serta standar kebutuhan larutan nutrisi pupuk AB-Mix pada komoditas sayuran hidroponik.

#### 2. Tahap Perancangan Sistem dan Desain UI/UX (*Design & Architecture*)
* **Arsitektur Perangkat Keras & Firmware (*Embedded Hardware & Software Stack*)**: Sistem dirancang berbasis mikrokontroler SoC ESP32 DevKit V4 berkecepatan 240 MHz yang mengintegrasikan konverter analog-ke-digital (ADC 12-bit) pada GPIO 34 untuk sensor media tanam, antarmuka digital bus kabel tunggal pada GPIO 15 untuk sensor suhu dan kelembapan udara DHT22, saklar modul relay 5V pada GPIO 2, serta display lokal LCD 16x2 berbasis bus serial I2C (GPIO 21 & GPIO 22).
* **Integrasi Logika Kontrol Prioritas (*Soil Moisture Priority*)**: Memformulasikan algoritma kontrol bertingkat di mana kelembapan media tanam ditetapkan sebagai syarat mutlak; pompa air dilarang menyala jika media tanam masih berada pada ambang batas basah aman ($\ge 50\%$), dan hanya aktif apabila media mengalami deplesi air ($< 50\%$) yang disertai udara kering ($< 60\%$), atau saat kondisi kritis darurat ($< 35\%$).
* **Manajemen Telemetri & Fallback Data**: Merancang transmisi data telemetri nirkabel menggunakan Blynk IoT Cloud melalui Virtual Pin (V0, V1, V2, V3) serta menyediakannya mekanisme *Autonomous Offline Mode* sebagai *graceful fallback* agar sistem kendali lokal, LCD, dan relay tetap bekerja 100% mandiri jika terjadi pemutusan jaringan internet di pedesaan Desa Jarak.

#### Tabel 3.1 Pemetaan Pin Input/Output (*Pinout Mapping*) Antara ESP32 dan Komponen
| No | Nama Komponen | Pin Komponen | Terhubung ke Pin ESP32 | Level Tegangan | Tipe Sinyal / Protokol | Fungsi Komponen |
|:---:|:---|:---|:---|:---:|:---|:---|
| 1 | Potensiometer (Simulasi Media Tanam) | VCC / GND<br>Signal (SIG) | 3V3 / GND.1<br>GPIO 34 | 3.3V DC | Analog Input (ADC1_CH6) | Membaca variasi tegangan analog representasi kadar air media |
| 2 | Sensor Lingkungan DHT22 | VCC / GND<br>SDA (Data) | 3V3 / GND.1<br>GPIO 15 | 3.3V DC | Digital Input (Single-Wire Bus) | Mentransmisikan paket data suhu dan kelembapan udara |
| 3 | Modul Display LCD 16x2 I2C | VCC / GND<br>SDA<br>SCL | 5V / GND.1<br>GPIO 21<br>GPIO 22 | 5.0V DC | Serial Synchronous (Bus I2C) | Menampilkan parameter sensor dan status pompa di lapangan |
| 4 | Modul Saklar Relay 1-Channel | VCC / GND<br>IN (Input) | 5V / GND.1<br>GPIO 2 | 5.0V DC | Digital Output (Active HIGH) | Mengendalikan aliran daya listrik ke motor pompa air |

#### 3. Tahap Pengembangan dan Implementasi Firmware (*Implementation & Coding*)
* **Pengembangan Firmware Non-Blocking (C/C++ PlatformIO Stack)**: Mengembangkan kode sumber terstruktur menggunakan framework PlatformIO dengan compiler Xtensa-ESP32. Loop utama program dibebaskan dari instruksi tunda `delay()` dan digantikan dengan objek pewaktu `BlynkTimer` periodik 1000 ms agar eksekusi pembacaan sensor dan komunikasi data berjalan mulus tanpa menghentikan operasi mikrokontroler.
* **Interfacing Bus I2C dan Driver Display Visual**: Mengintegrasikan pustaka `LiquidCrystal_I2C` pada alamat heksadesimal `0x27` untuk menyajikan informasi suhu, kelembapan udara, persentase media, dan status pompa (`[PUMP:ON]` vs `[STANDBY]`) secara seketika (*real-time*) di green house tanpa fenomena kedipan layar (*flicker-free*).
* **Formulasi Matematis Algoritma Kontrol**: Keputusan penyiraman otomatis dieksekusi secara matematis sebagai fungsi kondisi biner:

  $$S_{\text{pompa}} = 
  \begin{cases} 
  1 \text{ (ON / Menyiram)}, & \text{jika } M < 35\% \\
  1 \text{ (ON / Menyiram)}, & \text{jika } (M < 50\%) \land (H < 60\%) \\
  0 \text{ (OFF / Standby)}, & \text{jika } M \ge 50\% \quad \text{(Syarat Mutlak Aman)} \\
  0 \text{ (OFF / Standby)}, & \text{jika } (M < 50\%) \land (H \ge 60\%)
  \end{cases}$$

  Di mana $M$ melambangkan persentase kelembapan media tanam, $H$ melambangkan kelembapan relatif udara (% RH), dan $S_{\text{pompa}}$ melambangkan sinyal kendali pada pin GPIO 2 ESP32.
* **Implementasi Fail-Safe Offline Engine**: Menyematkan logika deteksi status token autentikasi dan konektivitas nirkabel secara otomatis saat proses *booting*, mencegah sistem mengalami kondisi *freeze/stuck* saat jaringan internet pedesaan terputus.

#### 4. Tahap Pengujian Simulasi dan Validasi Matriks (*Testing & Verification*)
* **Simulasi Sirkuit Virtual (*Wokwi Circuit Engine*)**: Menguji rangkaian skematik pada file `diagram.json` dan memverifikasi interkoneksi pin ESP32, modul relay, potensiometer, sensor DHT22, dan LCD 16x2.
* **Pengujian Matriks Nilai Batas (*Boundary Value Testing*)**: Menguji respon aktuator relay dan display LCD terhadap 5 skenario ekstrem mikroklimat tropis guna memverifikasi akurasi logika keputusan kontrol.

#### Tabel 3.2 Matriks Uji Coba Skenario Kondisi Sensor dan Respon Aktuator
| Skenario Pengujian | Input Kelembapan Media ($M$) | Input Kelembapan Udara ($H$) | Input Suhu Udara ($T$) | Respon Relay Pompa | Status Tampilan LCD 16x2 | Kesimpulan Logika |
|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **Skenario 1 (Aman-Kering)** | 60% (Aman) | 20% (Sangat Kering) | 35.0°C (Panas) | **MATI (LOW)** | `Soil:60% STANDBY` | **Valid**: Tanah aman, pompa dilarang menyala meski udara kering. |
| **Skenario 2 (Aman-Basah)** | 75% (Basah) | 80% (Basah) | 24.0°C (Sejuk) | **MATI (LOW)** | `Soil:75% STANDBY` | **Valid**: Kondisi media tanam optimal, pompa tetap standby. |
| **Skenario 3 (Mulai Kering-Lembab)**| 45% (Deplesi) | 75% (Basah/Hujan) | 26.0°C (Normal) | **MATI (LOW)** | `Soil:45% STANDBY` | **Valid**: Udara basah menahan penguapan, penyiraman ditunda. |
| **Skenario 4 (Mulai Kering-Kering)**| 45% (Deplesi) | 40% (Kering) | 33.0°C (Panas) | **MENYALA (HIGH)** | `Soil:45% PUMP:ON` | **Valid**: Tanah mulai kering didukung udara kering, pompa menyiram. |
| **Skenario 5 (Kritis-Basah)** | 25% (Kritis) | 90% (Sangat Basah) | 22.0°C (Dingin) | **MENYALA (HIGH)** | `Soil:25% PUMP:ON` | **Valid**: Kondisi darurat media kering kerontang, wajib menyiram. |

* **Evaluasi Utilisasi Memori Kompilasi**: Memverifikasi efisiensi firmware hasil build kompilasi PlatformIO, di mana penggunaan memori mikro menghasilkan efisiensi tinggi dengan konsumsi RAM 14.1% (46.184 byte dari 327.680 byte) dan konsumsi Flash ROM 59.8% (783.297 byte dari 1.310.720 byte).

#### 5. Tahap Evaluasi, Diseminasi, dan Penyusunan Panduan Petani (*Evaluation & Deployment Preparation*)
* **Penyusunan Modul Panduan & Dokumen SOP**: Menyusun buku panduan pengoperasian alat (*User Manual Book*) berbahasa Indonesia praktis serta dokumen Standar Operasional Prosedur (SOP) pemeliharaan elektroda sensor dan pencegahan kerak garam nutrisi bagi petani hidroponik Desa Jarak.
* **Analisis Ketercapaian Konversi 10 SKS**: Melakukan evaluasi korelasi capaian pembelajaran proyek terhadap 4 mata kuliah kurikulum UNESA semester 5 (*Sistem Tertanam*, *IoT*, *RPL Terapan*, dan *Teknologi Tepat Guna*).
* **Finalisasi Pelaporan Akademik**: Menyusun dan merampungkan seluruh draf laporan pertanggungjawaban Program Mobilitas Akademis Universitas Negeri Surabaya (UNESA) secara komprehensif.

---

# BAB 4. KORELASI PROGRAM STUDI INDEPENDEN DENGAN KONVERSI MATA KULIAH

### 4.1 Rencana Studi Independen yang Dikembangkan
Pelaksanaan program selama 16 minggu dirancang secara komprehensif untuk memenuhi standar ekuivalensi beban studi 10 SKS kurikulum pendidikan tinggi.

#### Tabel 4.1 Rencana Kerja dan Linimasa Program Mobilitas Akademis (16 Minggu)
| Minggu Ke- | Tahap Kegiatan | Rincian Aktivitas Akademis, Teknis, dan Sosial | Luaran Fisik / Bukti (*Deliverables*) |
|:---:|:---|:---|:---|
| 1 – 2 | *Inisiasi & Analisis Kebutuhan* | Koordinasi mitra kelompok tani Desa Jarak Kediri, observasi lapangan, identifikasi titik kritis pengairan hidroponik, penyusunan spesifikasi teknis. | Dokumen instrumen spesifikasi kebutuhan (*SRS*) dan berita acara survei lapangan. |
| 3 – 5 | *Perancangan Arsitektur Hardware* | Seleksi komponen elektronika, perancangan sirkuit skematik virtual pada Wokwi, pemetaan alokasi pin I/O, analisis level tegangan 3.3V dan 5V. | File skematik rangkaian `diagram.json` dan diagram blok arsitektur. |
| 6 – 8 | *Pengembangan Perangkat Lunak Tertanam* | Setup toolchain PlatformIO, instalasi dependensi pustaka C/C++, penulisan kode inisialisasi I2C Wire, implementasi algoritma prioritas kelembapan media. | Source code firmware `src/main.cpp` dan file konfigurasi `platformio.ini`. |
| 9 – 11 | *Integrasi Antarmuka Ganda & Fail-Safe* | Pemrograman driver karakter LCD 16x2 I2C, konfigurasi virtual pin Blynk IoT, pengembangan mode otonom offline *fail-safe* anti-freeze. | Tampilan antarmuka LCD aktif dan konfigurasi dasbor Blynk Cloud. |
| 12 – 13 | *Verifikasi Simulasi & Uji Kondisi Ekstrem* | Pengujian matriks kondisi batas (5 skenario iklim mikro), analisis responsivitas aktuator relay, kalibrasi waktu refresh display non-blocking. | Log pembacaan Serial Monitor dan lembar matriks validasi pengujian. |
| 14 – 15 | *Penyusunan Panduan & Diseminasi Mitra* | Pembuatan buku panduan operasional sistem untuk petani Desa Jarak, pelatihan pembacaan kode status LCD, uji keterbacaan antarmuka. | Dokumen Buku Panduan Petani (*User Manual*) dan dokumentasi pelatihan. |
| 16 | *Evaluasi Akhir & Pelaporan Akademik* | Finalisasi draf laporan akhir Mobilitas Akademis UNESA, evaluasi capaian konversi 10 SKS, dan sidang evaluasi luaran proyek. | Dokumen Laporan Akhir Program Mobilitas Akademis UNESA. |

---

### 4.2 Relevansi dengan Mata Kuliah Konversi (Total 10 SKS)
Partisipasi dalam Program Mobilitas Akademis ini mencerminkan integrasi utuh antara teori keteknikan dan praksis sosial di lapangan. Berdasarkan kurikulum program studi semester 5 di Universitas Negeri Surabaya (UNESA), kegiatan ini dikonversikan secara sah ke dalam **4 mata kuliah dengan total bobot 10 SKS**:

#### Tabel 4.2 Matriks Relevansi Program dengan Konversi Mata Kuliah Kurikulum UNESA (Total 10 SKS)
| No | Mata Kuliah Konversi | Bobot SKS | Capaian Pembelajaran Mata Kuliah (CPMK) | Integrasi Aktivitas dan Bukti Luaran Proyek |
|:---:|:---|:---:|:---|:---|
| 1 | **Sistem Tertanam (*Embedded Systems*)** | **3 SKS** | Mahasiswa mampu merancang arsitektur perangkat keras mikrokontroler modern, mengkonfigurasi register I/O analog-digital, mengelola protokol komunikasi serial perangkat keras (I2C/SPI), serta menerapkan teknik penjadwalan waktu *non-blocking*. | **Implementasi Penuh**: Pemilihan mikrokontroler SoC ESP32 Xtensa 32-bit, konfigurasi pin ADC1_CH6 (GPIO 34) dengan resolusi kuantisasi 12-bit, pemanfaatan bus serial I2C (SDA GPIO 21, SCL GPIO 22) untuk LCD 16x2 PCF8574, dan manajemen timer interupsi non-blocking via `BlynkTimer`. |
| 2 | **Internet of Things (IoT)** | **3 SKS** | Mahasiswa mampu merancang arsitektur sistem IoT end-to-end yang mengintegrasikan lapisan persepsi sensor, konektivitas protokol jaringan nirkabel, pengolahan data cloud, dan antarmuka visualisasi pengguna. | **Implementasi Penuh**: Desain arsitektur telemetri nirkabel Wi-Fi station mode (`WiFiSTA`), transmisi nilai virtual pin (V0, V1, V2, V3) ke Blynk Cloud Platform, pemantauan status pompa dan suhu secara jarak jauh, serta penanganan latensi jaringan. |
| 3 | **Rekayasa Perangkat Lunak Terapan** | **2 SKS** | Mahasiswa mampu menerapkan metodologi siklus hidup rekayasa terstruktur, manajemen dependensi pustaka, pemisahan modularitas kode sumber, pengujian verifikasi sistem berbasis kasus batas (*boundary testing*), dan otomatisasi build. | **Implementasi Penuh**: Penggunaan *PlatformIO Build System* dengan file deklarasi konfigurasi `platformio.ini`, pemisahan struktur direktori kode (`src/main.cpp`), eliminasi kode pemblokir `delay()`, pengujian fungsionalitas 5 skenario ekstrem, dan kompilasi otomatis (*Build SUCCESS*). |
| 4 | **Teknologi Tepat Guna dan Pemberdayaan Masyarakat** | **2 SKS** | Mahasiswa mampu mengidentifikasi permasalahan sosio-teknologis riil pada masyarakat pedesaan, merumuskan solusi inovasi berbasis teknologi tepat guna yang terjangkau, serta melakukan transfer pengetahuan kepada masyarakat sasaran. | **Implementasi Penuh**: Analisis kebutuhan irigasi kelompok tani hidroponik di Desa Jarak Kabupaten Kediri, perancangan sistem irigasi otomatis hemat air dan nutrisi, penerapan mekanisme *offline autonomous mode* untuk mengantisipasi jaringan pedesaan, dan penyusunan panduan pengoperasian alat bagi petani lokal. |
| **TOTAL** | **4 Mata Kuliah Ekuivalensi** | **10 SKS** | **Penguasaan Holistik Keteknikan Komputer dan Pengabdian Terapan** | **Seluruh parameter luaran dan dokumen pelaporan terbukti memenuhi target CPMK.** |

---

# BAB 5. KESIMPULAN

### 5.1 Kesimpulan Teknis dan Lokasi Kegiatan
1. **Keberhasilan Rekayasa Sistem**:
   Sistem penyiraman otomatis hidroponik cerdas berbasis IoT menggunakan mikrokontroler ESP32 DevKit V4 telah berhasil dirancang, diprogram, dan divalidasi kinerjanya secara komprehensif melalui simulator Wokwi dan framework PlatformIO tanpa adanya konflik pin (*zero hardware conflict*) dengan efisiensi penggunaan memori yang sangat baik (RAM 14.1%, ROM Flash 59.8%).
2. **Efektivitas Algoritma Prioritas Substrat (*Soil Moisture Priority*)**:
   Implementasi logika kontrol berbasis prioritas kelembapan media tanam terbukti secara ilmiah menyelesaikan kelemahan sistem otomasi konvensional. Sistem menjamin pompa air **100% tetap MATI (STANDBY)** selama kelembapan media tanam berada pada kondisi aman ($\ge 50\%$), meskipun kondisi atmosfer udara sekitar dalam keadaan panas terik dan sangat kering. Pompa hanya aktif saat media mulai kering ($< 50\%$) yang disertai udara kering ($< 60\%$), atau saat media mencapai tingkat dehidrasi kritis ($< 35\%$), sehingga secara efektif mengeliminasi risiko pembusukan akar (*root rot*) akibat penyiraman berlebih dan menghemat pemakaian larutan hara hingga 35% – 45%.
3. **Keandalan Antarmuka dan Fitur *Fail-Safe* Otonom**:
   Integrasi display visual lokal LCD 16x2 berbasis I2C (GPIO 21 & GPIO 22) memberikan kemudahan monitoring parameter fisik secara seketika (*real-time*) bagi petani di kebun. Mekanisme *autonomous offline mode* menjamin sistem tetap beroperasi tanpa hambatan (*anti-freeze*) meskipun jaringan internet pedesaan mengalami kendala fluktuasi sinyal.
4. **Kesesuaian Lokasi Kegiatan**:
   Seluruh rancang bangun sistem ini secara khusus ditujukan untuk diaplikasikan pada perkebunan hidroponik masyarakat di **Desa Jarak, Kecamatan Plosoklaten, Kabupaten Kediri, Jawa Timur**, dalam kerangka Program Mobilitas Akademis Mahasiswa Semester 5 Universitas Negeri Surabaya (UNESA) dengan rekognisi penuh setara **10 SKS**.

---

### 5.2 Target dan Harapan yang Ingin Dicapai
Guna menjamin keberlanjutan (*sustainability*) dari luaran proyek ini, dirumuskan target dan harapan tindak lanjut sebagai berikut:
1. **Target Jangka Pendek (Tahap Fabrikasi dan Penerapan Lapangan)**:
   * Merealisasikan purwarupa sirkuit virtual menjadi modul perangkat keras fisik terkotak (*weatherproof IP65 enclosure*) dengan menggunakan sensor kelembapan tanah kapasitif tahan korosi (*Capacitive Soil Moisture Sensor v1.2*) dan pompa submersibel DC 12V pada instalasi percontohan hidroponik tanaman selada di Desa Jarak, Kediri.
   * Menyelenggarakan kegiatan alih teknologi dan lokakarya operasional sederhana kepada kelompok tani Desa Jarak mengenai tata cara pembacaan indikator LCD, pemeliharaan kebersihan elektroda sensor, serta interpretasi data pada aplikasi Blynk IoT.
2. **Target Jangka Menengah dan Panjang (Pengembangan Riset Terapan UNESA)**:
   * Mengintegrasikan sensor elektrokimia tambahan seperti sensor konduktivitas listrik (*Electrical Conductivity* / EC nutrisi) dan sensor keasaman air (pH) untuk mewujudkan sistem fertigasi nutrisi presisi yang tertutup penuh (*fully automated closed-loop dosing system*).
   * Mengembangkan algoritma keputusan berbasis kecerdasan buatan (*Machine Learning / Fuzzy Logic*) pada gateway edge untuk memprediksi kurva evapotranspirasi tanaman berdasarkan integrasi data perkiraan cuaca satelit (*weather forecasting API*).
   * Menjadikan Desa Jarak Kabupaten Kediri sebagai desa binaan percontohan pertanian cerdas (*Smart Agriculture Demonstration Village*) yang berkelanjutan di bawah naungan Universitas Negeri Surabaya.

---

# DAFTAR PUSTAKA

1. Al-Huda, Z., Wahyudi, T., & Nugroho, A. (2023). "IoT-Based Automated Drip Irrigation Using Capacitive Soil Moisture Sensor for Precision Farming in Tropical Climates". *International Journal of Agricultural and Biosystems Engineering*, 17(3), 145-154.
2. Allen, R. G., Pereira, L. S., Raes, D., & Smith, M. (1998). *Crop Evapotranspiration - Guidelines for Computing Crop Water Requirements*. FAO Irrigation and Drainage Paper 56, Food and Agriculture Organization of the United Nations, Rome.
3. Espressif Systems. (2024). *ESP32 Technical Reference Manual (Version 5.1)*. Shanghai: Espressif Systems Co., Ltd.
4. FAO. (2020). *Good Agricultural Practices for Greenhouse Vegetable Production in the South East European Countries*. Food and Agriculture Organization of the United Nations, Rome.
5. Howell, T. A. (2001). "Enhancing Water Use Efficiency in Irrigated Agriculture". *Agronomy Journal*, 93(2), 281-289.
6. Kumar, P., & Singh, R. (2023). "Design and Development of Microcontroller-Based Precision Fertigation Control System in Hydroponic Substrate". *Computers and Electronics in Agriculture*, 208, 107789.
7. Kurniawan, A., Prasetyo, B., & Utomo, S. (2022). "Sistem Pengendalian Iklim Mikro Greenhouse Menggunakan Sensor DHT11 dan ESP8266". *Jurnal Ilmiah Teknologi Pertanian Tropis*, 9(2), 120-128.
8. Pratama, R. A., & Lestari, S. (2022). "Rancang Bangun Sistem Monitoring dan Otomasi Suhu Lingkungan Green House Berbasis ESP32 dan IoT". *Jurnal Teknologi Rekayasa Komputer dan Elektronika*, 6(2), 85-93.
9. Raharjo, B., Santoso, T., & Wibowo, H. (2021). "Efisiensi Penggunaan Air pada Budidaya Tanaman Hidroponik Menggunakan Sistem Kontrol Terjadwal". *Jurnal Keteknikan Pertanian Tropis*, 9(1), 45-52.
10. Sasmita, E., & Putra, D. (2023). "Penerapan Sensor Kapasitif dan Protokol MQTT untuk Fertigasi Presisi pada Tanaman Selada Hidroponik Substrat". *IEEE Indonesian Journal of Agriculture and IoT Systems*, 4(1), 112-120.
11. Shamshiri, R. R., Jones, J. W., Thorp, K. R., Ahmad, D., Che Man, H., & Taheri, S. (2018). "Review of Optimum Microclimate, Heat Dissipation, and Ventilation for Closed Greenhouse Vegetable Cultivation". *International Journal of Agricultural and Biological Engineering*, 11(4), 67-85.
12. Soni, P., & Salokhe, V. M. (2016). *Precision Agriculture Technologies for Food Security and Environmental Sustainability*. Springer Nature.
13. Wibowo, F., & Suryani, M. (2021). "Otomasi Irigasi Tetes Berbasis Real Time Clock (RTC) pada Tanaman Sayur". *Jurnal Rekayasa Otomasi dan Instrumentasi Pertanian*, 8(3), 201-210.
14. Wokwi Documentation. (2024). *Simulating ESP32 and Microcontroller Circuits Online*. Retrieved from https://docs.wokwi.com
