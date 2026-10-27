// Sistem KosanKu - Form Handling, Live Search, Toggle Status, dan Hapus Data
const formProyek = document.getElementById("formProyek");
const judulInput = document.getElementById("judulProyek");
const kategoriInput = document.getElementById("kategoriProyek");
const anggaranInput = document.getElementById("anggaranProyek");
const statusInput = document.getElementById("statusSelesai");
const cariInput = document.getElementById("cariProyek");
const daftarProyek = document.getElementById("daftarProyek");
const pesanForm = document.getElementById("pesanForm");
const kosong = document.getElementById("kosong");

let proyek = [
  {
    id: Date.now() - 3000,
    judul: "Perbaikan kamar no 1",
    kategori: "perbaikan & perawatan",
    anggaran: 750000,
    selesai: false,
    dibuat: new Date().toISOString()
  },
];

const formatRupiah = (angka) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(angka);

const formatTanggal = (tanggal) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(tanggal));

function tampilkanPesan(teks = "", jenis = "") {
  pesanForm.textContent = teks;
  pesanForm.className = `form-message ${jenis}`.trim();
}

function renderStatistik() {
  const total = proyek.length;
  const selesai = proyek.filter((item) => item.selesai).length;
  const aktif = total - selesai;
  const anggaran = proyek.reduce((jumlah, item) => jumlah + item.anggaran, 0);

  document.getElementById("totalProyek").textContent = total;
  document.getElementById("proyekAktif").textContent = aktif;
  document.getElementById("proyekSelesai").textContent = selesai;
  document.getElementById("totalAnggaran").textContent = formatRupiah(anggaran);
  document.getElementById("labelJumlah").textContent =
    `${total} ${total === 1 ? "proyek" : "proyek"}`;
}

function buatKartu(item) {
  const kartu = document.createElement("article");
  kartu.className = `project-card ${item.selesai ? "is-done" : ""}`;

  const header = document.createElement("div");
  header.className = "card-top";

  const kategori = document.createElement("span");
  kategori.className = "category-pill";
  kategori.textContent = item.kategori;

  const status = document.createElement("span");
  status.className = `status-pill ${item.selesai ? "done" : "progress"}`;
  status.textContent = item.selesai ? "Selesai" : "Dalam Pengerjaan";

  header.append(kategori, status);

  const judul = document.createElement("h3");
  judul.textContent = item.judul;

  const tanggal = document.createElement("p");
  tanggal.className = "card-date";
  tanggal.textContent = `Ditambahkan ${formatTanggal(item.dibuat)}`;

  const garis = document.createElement("div");
  garis.className = "card-divider";

  const anggaranLabel = document.createElement("p");
  anggaranLabel.className = "budget-label";
  anggaranLabel.textContent = "Estimasi anggaran";

  const anggaran = document.createElement("strong");
  anggaran.className = "budget-value";
  anggaran.textContent = formatRupiah(item.anggaran);

  const footer = document.createElement("div");
  footer.className = "card-actions";

  const tombolStatus = document.createElement("button");
  tombolStatus.type = "button";
  tombolStatus.className = "btn btn-small btn-toggle";
  tombolStatus.dataset.action = "toggle";
  tombolStatus.dataset.id = item.id;
  tombolStatus.textContent = item.selesai ? "↶ Ubah Status" : "✓ Tandai Selesai";
  tombolStatus.setAttribute(
    "aria-label",
    `${item.selesai ? "Ubah status menjadi dalam pengerjaan" : "Tandai selesai"}: ${item.judul}`
  );

  const tombolHapus = document.createElement("button");
  tombolHapus.type = "button";
  tombolHapus.className = "btn btn-small btn-delete";
  tombolHapus.dataset.action = "delete";
  tombolHapus.dataset.id = item.id;
  tombolHapus.textContent = "Hapus";
  tombolHapus.setAttribute("aria-label", `Hapus proyek ${item.judul}`);

  footer.append(tombolStatus, tombolHapus);
  kartu.append(header, judul, tanggal, garis, anggaranLabel, anggaran, footer);
  return kartu;
}

function renderProyek() {
  const kataKunci = cariInput.value.trim().toLowerCase();
  const hasilFilter = proyek.filter((item) =>
    item.judul.toLowerCase().includes(kataKunci)
  );

  daftarProyek.replaceChildren();
  hasilFilter.forEach((item) => daftarProyek.appendChild(buatKartu(item)));

  kosong.hidden = hasilFilter.length > 0;
  if (proyek.length > 0 && hasilFilter.length === 0) {
    kosong.hidden = false;
    kosong.querySelector("h3").textContent = "Proyek tidak ditemukan";
    kosong.querySelector("p").textContent = "Coba gunakan kata kunci nama proyek yang lain.";
  } else if (hasilFilter.length > 0) {
    kosong.querySelector("h3").textContent = "Belum ada proyek";
    kosong.querySelector("p").textContent =
      "Tambahkan proyek pertama untuk mulai mengelola pekerjaan kosan.";
  }

  renderStatistik();
}

formProyek.addEventListener("submit", (event) => {
  event.preventDefault(); // Mencegah halaman reload saat form dikirim

  const judul = judulInput.value.trim();
  const kategori = kategoriInput.value;
  const anggaran = Number(anggaranInput.value);

  if (!judul) {
    tampilkanPesan("Judul proyek tidak boleh kosong.", "error");
    judulInput.focus();
    return;
  }
  if (!kategori) {
    tampilkanPesan("Silakan pilih kategori proyek.", "error");
    kategoriInput.focus();
    return;
  }
  if (!Number.isFinite(anggaran) || anggaran <= 0) {
    tampilkanPesan("Anggaran harus berupa angka dan lebih besar dari 0.", "error");
    anggaranInput.focus();
    return;
  }

  const proyekBaru = {
    id: Date.now(),
    judul,
    kategori,
    anggaran,
    selesai: statusInput.checked,
    dibuat: new Date().toISOString()
  };

  // Menambahkan data menggunakan spread operator.
  proyek = [proyekBaru, ...proyek];

  formProyek.reset();
  tampilkanPesan("Proyek berhasil ditambahkan.", "success");
  cariInput.value = "";
  renderProyek();
});

formProyek.addEventListener("reset", () => {
  // Beri waktu agar reset bawaan browser selesai terlebih dahulu.
  setTimeout(() => tampilkanPesan(), 0);
});

// Live search: daftar langsung difilter setiap kali pengguna mengetik.
cariInput.addEventListener("input", renderProyek);

// Event delegation untuk tombol status dan hapus pada semua kartu.
daftarProyek.addEventListener("click", (event) => {
  const tombol = event.target.closest("button[data-action]");
  if (!tombol) return;

  const id = Number(tombol.dataset.id);
  const aksi = tombol.dataset.action;

  if (aksi === "toggle") {
    proyek = proyek.map((item) =>
      item.id === id ? { ...item, selesai: !item.selesai } : item
    );
  }

  if (aksi === "delete") {
    const dataDipilih = proyek.find((item) => item.id === id);
    if (!dataDipilih) return;

    const yakin = window.confirm(`Hapus proyek "${dataDipilih.judul}"?`);
    if (!yakin) return;

    proyek = proyek.filter((item) => item.id !== id);
    tampilkanPesan("Proyek berhasil dihapus.", "success");
  }

  renderProyek();
});

// Tampilan pertama saat halaman dibuka.
renderProyek();
