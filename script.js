document.addEventListener("DOMContentLoaded", () => {
  const simpananBahasa = localStorage.getItem("bahasa");
  if (simpananBahasa) document.getElementById("pilihBahasa").value = simpananBahasa;

  // ⏱️ Auto refresh real-time status setiap 30 detik
  setInterval(() => {
    const aktif = document.querySelector(".section.active")?.id;
    if (aktif === "riwayat" && typeof loadRiwayat === "function") loadRiwayat();
    if (aktif === "pembayaran" && typeof loadPembayaran === "function") loadPembayaran();
  }, 30000);
});

// Inisialisasi user
const user = JSON.parse(localStorage.getItem("user"));
if (!user) location.href = "login_daftar.html";
document.getElementById("nama").textContent = user.nama;
document.getElementById("npm").textContent = user.npm;
document.getElementById("prodi").textContent = user.prodi;
document.getElementById("nowa").textContent = user.nowa;

// Simpan edit nama
function simpanEditNama() {
  const namaBaru = document.getElementById("pengaturanNama").value.trim();
  if (!namaBaru) return showNotif("error", "Nama kosong", "Silakan masukkan nama baru.");

  user.nama = namaBaru;
  localStorage.setItem("user", JSON.stringify(user));

  document.getElementById("namaDisplay").textContent = namaBaru;
  document.getElementById("fotoProfil").src = `https://ui-avatars.com/api/?name=${encodeURIComponent(namaBaru)}&background=0D8ABC&color=fff&size=128&rounded=true`;
  showNotif("success", "Berhasil", "Nama berhasil diperbarui!");
}

// Ganti password
function gantiPassword() {
  const lama = document.getElementById("passLama").value;
  const baru = document.getElementById("passBaru").value;

  if (!lama || !baru) return showNotif("error", "Lengkapi semua kolom");
  if (lama !== user.password) return showNotif("error", "Password lama salah!");

  user.password = baru;
  localStorage.setItem("user", JSON.stringify(user));
  showNotif("success", "Password diperbarui!");
  document.getElementById("passLama").value = "";
  document.getElementById("passBaru").value = "";
}

// Ubah bahasa
function ubahBahasa() {
  const lang = document.getElementById("pilihBahasa").value;
  localStorage.setItem("bahasa", lang);
  showNotif("success", "Bahasa disimpan", lang === "id" ? "Bahasa Indonesia" : "English");
  // Untuk real-time: location.reload();
}

// Toggle tema
function toggleTheme() {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}
if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark-mode");

// Logout
function logout() {
  Swal.fire({
    title: 'Yakin ingin logout?',
    text: "Kamu akan keluar dari dashboard.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Logout',
    cancelButtonText: 'Batal',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("user");
      Swal.fire({
        icon: 'success',
        title: 'Logout berhasil!',
        timer: 2000,
        showConfirmButton: false
      });
      setTimeout(() => location.href = "login_daftar.html", 1500);
    }
  });
}

// Notifikasi toast
function showNotif(icon, title, text = '') {
  const audioSuccess = document.getElementById("sound-success");
  const audioError = document.getElementById("sound-error");

  // Play sound berdasarkan jenis icon
  if (icon === "success" && audioSuccess) audioSuccess.play();
  if ((icon === "error" || icon === "warning") && audioError) audioError.play();

  Swal.fire({
    icon,
    title,
    text,
    toast: true,
    position: 'top-end',
    timer: 4000,
    showConfirmButton: false
  });
}

// Navigasi section
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelectorAll(".sidebar button").forEach(b => b.classList.remove("active"));
  document.querySelector(`.sidebar button[onclick*="${id}"]`).classList.add("active");
  if (id === "riwayat") loadRiwayat();
  if (id === "pembayaran") loadPembayaran();
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

// Map Dana
const nomorDanaMap = {
  "RENALDI": "081348722325",
  "AFRIZAL": "085182489261",
  "ABDUL HAKIM": "085764534425",
  "AIDIL ANWAR": "082279458613"
};

document.getElementById("adminJoki").addEventListener("change", function () {
  const admin = this.value;
  const nomor = nomorDanaMap[admin];
  const metodeInput = document.getElementById("metode");
  const danaBox = document.getElementById("infoDana");

  if (nomor) {
    metodeInput.value = "Dana";
    danaBox.style.display = "block";
    document.getElementById("nomorDana").textContent = nomor;
  } else {
    metodeInput.value = "";
    danaBox.style.display = "none";
    document.getElementById("nomorDana").textContent = "";
  }
});

// Kirim Telegram
async function kirimTelegramDenganGambar(data, file) {
  const TELEGRAM_BOT_TOKEN = "7686312873:AAFgoSgH-5A8RyB8tJRzjevPlXI0iQMi8uI";
  const GROUP_CHAT_ID = "-1002853719892";
  const ADMIN_CHAT_ID = "8087861371";

  if (!file || !file.type.startsWith("image/")) {
    throw new Error("File tidak valid. Harus berupa gambar.");
  }

  const pesan = `
📥 *Pesanan Baru Masuk*
👤 Nama: *${data.nama}*
🎓 NPM: *${data.npm}*
🏫 Prodi: *${data.prodi}*
📱 WhatsApp: *${data.nowa}*
📝 Jenis Tugas: *${data.jenis}*
🗒️ Judul: *${data.judul}*
📄 Deskripsi: *${data.deskripsi}*
👨‍🏫 Dosen Pengampu: *${data.dosen}*
📚 Fakultas: *${data.fakultas}*
📘 Mata Kuliah: *${data.matkul}*
🗓 Deadline: *${data.deadline}*
👨‍🏫 Admin Joki: *${data.adminJoki}*
💳 Metode Pembayaran: *${data.metode}*
📱 Nomor Dana: *${data.dana}*
💰 Harga: *${data.harga}*
🆔 Tracking ID: *${data.trackingID}*
`.trim();

  const formData = new FormData();
  formData.append("chat_id", GROUP_CHAT_ID);
  formData.append("caption", pesan);
  formData.append("photo", file);
  formData.append("parse_mode", "Markdown");

  const urlPhoto = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
  const responsePhoto = await fetch(urlPhoto, {
    method: "POST",
    body: formData
  });

  if (!responsePhoto.ok) {
    const errText = await responsePhoto.text();
    throw new Error(`Telegram Group Error: ${errText}`);
  }

  const urlText = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const responseText = await fetch(urlText, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: ADMIN_CHAT_ID,
      text: pesan,
      parse_mode: "Markdown"
    })
  });

  if (!responseText.ok) {
    const errText = await responseText.text();
    throw new Error(`Telegram Admin Error: ${errText}`);
  }
}

// Kirim pesanan
document.getElementById("formPesanan").addEventListener("submit", async e => {
  e.preventDefault();

  const jenis = document.getElementById("jenis").value.trim();
  const adminJoki = document.getElementById("adminJoki").value.trim();
  const judul = document.getElementById("judul").value.trim();
  const deskripsi = document.getElementById("deskripsi").value.trim();
  const dosen = document.getElementById("dosen").value.trim();
  const fakultas = document.getElementById("fakultas").value.trim();
  const matkul = document.getElementById("matkul").value.trim();
  const deadline = document.getElementById("deadline").value;
  const metode = document.getElementById("metode").value;
  const harga = document.getElementById("harga").value;
  const trackingID = "TRK" + Date.now();
  const fileInput = document.getElementById("bukti");
  const file = fileInput.files[0];

  if (!file) {
    return showNotif("error", "Upload Gagal", "Mohon unggah bukti pembayaran berupa gambar.");
  }

  const data = {
    trackingID,
    nama: user.nama,
    npm: user.npm,
    prodi: user.prodi,
    nowa: user.nowa,
    jenis,
    judul,
    deskripsi,
    dosen,
    fakultas,
    matkul,
    deadline,
    metode,
    harga,
    adminJoki,
    dana: nomorDanaMap[adminJoki] || "-"
  };

  const statusPesanan = document.getElementById("statusPesanan");
  statusPesanan.style.display = "block";
  statusPesanan.innerText = "📡 Mengirim pesanan...";

  try {
    await kirimTelegramDenganGambar(data, file);
    document.getElementById("formPesanan").reset();
    statusPesanan.innerHTML = `✅ Pesanan & bukti berhasil dikirim!<br><strong>ID:</strong> ${trackingID}`;
    navigator.clipboard.writeText(trackingID);
    showNotif("success", "Terkirim!", `Tracking ID: ${trackingID}`);
  } catch (error) {
    statusPesanan.innerHTML = "❌ Gagal mengirim pesan.<br>Silakan coba lagi.";
    showNotif("error", "Gagal", error.message);
  }
});

// Riwayat
let semuaRiwayat = [];
async function loadRiwayat() {
  const box = document.getElementById("tabelRiwayat");
  box.textContent = "Memuat data...";
  try {
    const res = await fetch(`https://script.google.com/macros/s/AKfycbzvm0RO0IdDk9dgowz7d56ZjOQUejBxjkiUzyOBaRAq5bbmQuLKoGa55sx_DCVW-ghd/exec?action=getRiwayat&npm=${user.npm}`);
    const data = await res.json();
    semuaRiwayat = data;
    if (!Array.isArray(data) || data.length === 0) return box.innerHTML = "<i>Belum ada data.</i>";
    tampilkanRiwayat(data);
  } catch (e) {
    box.innerHTML = "<i>Gagal memuat data.</i>";
    showNotif("error", "Gagal Memuat Riwayat");
  }
}

function tampilkanRiwayat(data) {
  let html = "<table><tr><th>ID</th><th>Jenis</th><th>Deadline</th><th>Status</th></tr>";
  data.forEach(r => {
    const s = (r.status || "Menunggu").toLowerCase();
    let cls = "status-menunggu";
    if (s.includes("proses")) cls = "status-proses";
    else if (s.includes("selesai")) cls = "status-selesai";
    else if (s.includes("batal")) cls = "status-batal";
    html += `<tr><td>${r.trackingID || '-'}</td><td>${r.jenis || '-'}</td><td>${r.deadline || '-'}</td><td><span class="status-badge ${cls}">${r.status || 'Menunggu'}</span></td></tr>`;
  });
  html += "</table>";
  document.getElementById("tabelRiwayat").innerHTML = html;
}

function filterRiwayat() {
  const q = document.getElementById("searchRiwayat").value.toLowerCase();
  const f = semuaRiwayat.filter(r =>
    r.trackingID.toLowerCase().includes(q) ||
    r.jenis.toLowerCase().includes(q) ||
    r.deadline.toLowerCase().includes(q) ||
    r.status.toLowerCase().includes(q)
  );
  tampilkanRiwayat(f);
}

// Pembayaran
let semuaPembayaran = [];
async function loadPembayaran() {
  const box = document.getElementById("tabelPembayaran");
  box.textContent = "Memuat data...";
  try {
    const res = await fetch(`https://script.google.com/macros/s/AKfycbzvm0RO0IdDk9dgowz7d56ZjOQUejBxjkiUzyOBaRAq5bbmQuLKoGa55sx_DCVW-ghd/exec?action=getPembayaran&npm=${user.npm}`);
    const data = await res.json();
    semuaPembayaran = data;
    if (!Array.isArray(data) || data.length === 0) return box.innerHTML = "<i>Belum ada data pembayaran.</i>";
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
    html += `<tr>
      <td>${r.trackingID || '-'}</td>
      <td>${r.metode || '-'}</td>
      <td>${r.harga || '-'}</td>
      <td><span class="status-badge ${cls}">${r.status || 'Menunggu'}</span></td>
    </tr>`;
  });
  html += "</table>";
  document.getElementById("tabelPembayaran").innerHTML = html;
}

function filterPembayaran() {
  const q = document.getElementById("searchPembayaran").value.toLowerCase();
  const filtered = semuaPembayaran.filter(r =>
    (r.trackingID || '').toLowerCase().includes(q) ||
    (r.metode || '').toLowerCase().includes(q) ||
    (r.harga || '').toLowerCase().includes(q) ||
    (r.status || '').toLowerCase().includes(q)
  );
  tampilkanPembayaran(filtered);
}
