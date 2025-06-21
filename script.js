let intervalStatus = null;
const user = JSON.parse(localStorage.getItem("user"));
if (!user) location.href = "##";

// Inisialisasi data user ke tampilan
document.getElementById("nama").textContent = user.nama;
document.getElementById("npm").textContent = user.npm;
document.getElementById("prodi").textContent = user.prodi;
document.getElementById("nowa").textContent = user.nowa;

// Theme
if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark-mode");
function toggleTheme() {
  const dark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", dark ? "dark" : "light");
}

// Navigasi section
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  document.querySelectorAll(".sidebar button").forEach(b => b.classList.remove("active"));
  document.querySelector(`.sidebar button[onclick*="${id}"]`).classList.add("active");

  if (id === "status") startRealtimeStatus(); else if (intervalStatus) clearInterval(intervalStatus);
  if (id === "riwayat") loadRiwayat();
  if (id === "pembayaran") loadPembayaran();
}

// Logout
function logout() {
  localStorage.removeItem("user");
  Swal.fire({ icon: 'info', title: 'Logout berhasil', timer: 2000, showConfirmButton: false });
  setTimeout(() => location.href = "login_daftar.html", 1500);
}

// Notifikasi
function showNotif(icon, title, text = '') {
  Swal.fire({ icon, title, text, toast: true, position: 'top-end', timer: 4000, showConfirmButton: false });
}

// Bahasa
document.addEventListener("DOMContentLoaded", () => {
  const simpananBahasa = localStorage.getItem("bahasa");
  if (simpananBahasa) document.getElementById("pilihBahasa").value = simpananBahasa;
});
function ubahBahasa() {
  const lang = document.getElementById("pilihBahasa").value;
  localStorage.setItem("bahasa", lang);
  showNotif("success", "Bahasa disimpan", lang === "id" ? "Bahasa Indonesia" : "English");
}

// Ganti nama & password
function simpanEditNama() {
  const namaBaru = document.getElementById("pengaturanNama").value.trim();
  if (!namaBaru) return showNotif("error", "Nama kosong", "Masukkan nama baru.");

  user.nama = namaBaru;
  localStorage.setItem("user", JSON.stringify(user));
  document.getElementById("nama").textContent = namaBaru;
  showNotif("success", "Nama diperbarui!");
}
function gantiPassword() {
  const lama = document.getElementById("passLama").value;
  const baru = document.getElementById("passBaru").value;
  if (!lama || !baru) return showNotif("error", "Lengkapi semua kolom");
  if (lama !== user.password) return showNotif("error", "Password lama salah");

  user.password = baru;
  localStorage.setItem("user", JSON.stringify(user));
  showNotif("success", "Password berhasil diganti!");
  document.getElementById("passLama").value = "";
  document.getElementById("passBaru").value = "";
}

// Harga otomatis
const hargaMap = {
  "MAKALAH": 25000,
  "PPT": 25000,
  "PPT PREMIUM": 50000,
  "WEBSITE": 150000,
  "KODING": 75000,
  "ANIMACY": 50000,
  "BIKIN APLIKASI": 500000
};
function updateHarga() {
  const jenis = document.getElementById("jenis").value;
  const harga = hargaMap[jenis] || 0;
  document.getElementById("harga").value = harga ? `Rp ${harga.toLocaleString("id-ID")}` : '';
}

// Nomor Dana otomatis
const nomorDanaMap = {
  "RENALDI": "081348722325",
  "AFRIZAL": "085182489261",
  "ABDUL HAKIM": "085764534425",
  "AIDIL ANWAR": "082279458613"
};
document.getElementById("adminJoki").addEventListener("change", function () {
  const admin = this.value;
  const nomor = nomorDanaMap[admin];
  document.getElementById("metode").value = nomor ? "Dana" : "";
  document.getElementById("infoDana").style.display = nomor ? "block" : "none";
  document.getElementById("nomorDana").textContent = nomor || "";
});

// STATUS REAL-TIME
function startRealtimeStatus() {
  if (intervalStatus) clearInterval(intervalStatus);
  updateStatusRealtime();
  intervalStatus = setInterval(updateStatusRealtime, 10000);
}
function updateStatusRealtime() {
  const box = document.getElementById("statusRealtimeBox");
  box.innerHTML = "⏳ Memuat...";
  fetch(`https://script.google.com/macros/s/AKfycbzvm0RO0IdDk9dgowz7d56ZjOQUejBxjkiUzyOBaRAq5bbmQuLKoGa55sx_DCVW-ghd/exec?action=getRiwayat&npm=${user.npm}`)
    .then(res => res.json())
    .then(data => {
      if (!data || !data.length) return box.innerHTML = "<i>Belum ada pesanan ditemukan.</i>";
      
      let html = `<table><tr>
        <th>TrackingID</th><th>Nama</th><th>NPM</th><th>Prodi</th><th>No WA</th>
        <th>Jenis</th><th>Deskripsi</th><th>Deadline</th><th>Status</th>
      </tr>`;
      
      data.forEach(r => {
        const status = (r.status || "Menunggu").toLowerCase();
        let cls = "status-menunggu";
        if (status.includes("proses")) cls = "status-proses";
        else if (status.includes("selesai")) cls = "status-selesai";
        else if (status.includes("batal")) cls = "status-batal";
        
        html += `<tr>
          <td>${r.trackingID || '-'}</td>
          <td>${r.nama || '-'}</td>
          <td>${r.npm || '-'}</td>
          <td>${r.prodi || '-'}</td>
          <td>${r.nowa || '-'}</td>
          <td>${r.jenis || '-'}</td>
          <td>${r.deskripsi || '-'}</td>
          <td>${r.deadline || '-'}</td>
          <td><span class="status-badge ${cls}">${r.status || '-'}</span></td>
        </tr>`;
      });
      
      html += "</table>";
      box.innerHTML = html;
    })
    .catch(err => {
      box.innerHTML = "❌ Gagal mengambil data.";
      console.error(err);
    });
}


// RIWAYAT
let semuaRiwayat = [];
async function loadRiwayat() {
  const box = document.getElementById("tabelRiwayat");
  box.textContent = "Memuat data...";
  try {
    const res = await fetch(`https://script.google.com/macros/s/AKfycbzvm0RO0IdDk9dgowz7d56ZjOQUejBxjkiUzyOBaRAq5bbmQuLKoGa55sx_DCVW-ghd/exec?action=getRiwayat&npm=${user.npm}`);
    const data = await res.json();
    semuaRiwayat = data;
    if (!data.length) return box.innerHTML = "<i>Belum ada data.</i>";
    tampilkanRiwayat(data);
  } catch (e) {
    box.innerHTML = "<i>Gagal memuat data.</i>";
    showNotif("error", "Gagal Memuat Riwayat");
  }
}
function tampilkanRiwayat(data) {
  let html = `<table><tr>
    <th>TrackingID</th><th>Nama</th><th>NPM</th><th>Prodi</th><th>No WA</th>
    <th>Jenis</th><th>Deskripsi</th><th>Deadline</th><th>Status</th>
  </tr>`;

  data.forEach(r => {
    const status = (r.status || "Menunggu").toLowerCase();
    let cls = "status-menunggu";
    if (status.includes("proses")) cls = "status-proses";
    else if (status.includes("selesai")) cls = "status-selesai";
    else if (status.includes("batal")) cls = "status-batal";

    html += `<tr>
      <td>${r.trackingID || '-'}</td>
      <td>${r.nama || '-'}</td>
      <td>${r.npm || '-'}</td>
      <td>${r.prodi || '-'}</td>
      <td>${r.nowa || '-'}</td>
      <td>${r.jenis || '-'}</td>
      <td>${r.deskripsi || '-'}</td>
      <td>${r.deadline || '-'}</td>
      <td><span class="status-badge ${cls}">${r.status || '-'}</span></td>
    </tr>`;
  });

  html += "</table>";
  document.getElementById("tabelRiwayat").innerHTML = html;
}


// PEMBAYARAN
let semuaPembayaran = [];
async function loadPembayaran() {
  const box = document.getElementById("tabelPembayaran");
  box.textContent = "Memuat data...";
  try {
    const res = await fetch(`https://script.google.com/macros/s/AKfycbzvm0RO0IdDk9dgowz7d56ZjOQUejBxjkiUzyOBaRAq5bbmQuLKoGa55sx_DCVW-ghd/exec?action=getPembayaran&npm=${user.npm}`);
    const data = await res.json();
    semuaPembayaran = data;
    if (!data.length) return box.innerHTML = "<i>Belum ada data pembayaran.</i>";
    tampilkanPembayaran(data);
  } catch (e) {
    box.innerHTML = "<i>Gagal memuat data pembayaran.</i>";
    showNotif("error", "Gagal Memuat Pembayaran");
  }
}
function tampilkanPembayaran(data) {
  let html = "<table><tr><th>ID</th><th>Metode</th><th>Harga</th><th>Status</th></tr>";
  data.forEach(r => {
    const status = (r.status || "Menunggu").toLowerCase();
    let cls = "status-menunggu";
    if (status.includes("proses")) cls = "status-proses";
    else if (status.includes("selesai")) cls = "status-selesai";
    else if (status.includes("batal")) cls = "status-batal";
    html += `<tr><td>${r.trackingID}</td><td>${r.metode}</td><td>${r.harga}</td><td><span class="status-badge ${cls}">${r.status}</span></td></tr>`;
  });
  html += "</table>";
  document.getElementById("tabelPembayaran").innerHTML = html;
}
function filterPembayaran() {
  const q = document.getElementById("searchPembayaran").value.toLowerCase();
  const filtered = semuaPembayaran.filter(r =>
    r.trackingID?.toLowerCase().includes(q) ||
    r.metode?.toLowerCase().includes(q) ||
    r.harga?.toLowerCase().includes(q) ||
    r.status?.toLowerCase().includes(q)
  );
  tampilkanPembayaran(filtered);
}
