document.addEventListener("DOMContentLoaded", () => {
    // Tangkap elemen DOM
    const mhsForm = document.querySelector("#mhsForm");
    const mhsIdInput = document.querySelector("#mhsId");
    const nimInput = document.querySelector("#nim");
    const namaInput = document.querySelector("#nama");
    const jurusanInput = document.querySelector("#jurusan");
    const emailInput = document.querySelector("#email");
    const btnSubmit = document.querySelector("#btnSubmit");
    const btnCancel = document.querySelector("#btnCancel");
    const formTitle = document.querySelector("#formTitle");
    const mhsTableBody = document.querySelector("#mhsTableBody");
    const alertMessage = document.querySelector("#alertMessage");

    // Elemen tambahan untuk fitur tugas
    const searchInput = document.querySelector("#searchInput");
    const totalMahasiswa = document.querySelector("#totalMahasiswa");

    let listMahasiswa = [];

    // Notifikasi
    const showAlert = (text, type = "success") => {
        alertMessage.textContent = text;
        alertMessage.className = `alert alert-${type}`;
        alertMessage.style.display = "block";

        setTimeout(() => {
            alertMessage.style.display = "none";
        }, 3000);
    };

    // READ: Ambil data mahasiswa
    const loadMahasiswa = async () => {
        try {
            const res = await fetch("/api/mahasiswa");
            listMahasiswa = await res.json();

            // Fitur 3: Perbarui total seluruh mahasiswa
            totalMahasiswa.textContent =
                `Total Mahasiswa Terdaftar: ${listMahasiswa.length} Orang`;

            filterMahasiswa();
        } catch (err) {
            showAlert("Gagal memuat data dari server backend", "error");
        }
    };

    // Tampilkan data ke tabel
    const renderTable = (data) => {
        mhsTableBody.innerHTML = "";

        if (data.length === 0) {
            mhsTableBody.innerHTML = `
                <tr>
                    <td colspan="6"
                        style="text-align:center; color:#64748b;">
                        Tidak ada data mahasiswa.
                    </td>
                </tr>
            `;
            return;
        }

        data.forEach((mhs, idx) => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td>${mhs.nim}</td>
                <td>${mhs.nama}</td>
                <td>${mhs.jurusan}</td>
                <td>${mhs.email}</td>
                <td>
                    <button class="btn-action btn-edit"
                            data-id="${mhs.id}">
                        Edit
                    </button>
                    <button class="btn-action btn-delete"
                            data-id="${mhs.id}">
                        Hapus
                    </button>
                </td>
            `;

            mhsTableBody.appendChild(tr);
        });
    };

    // Fitur 1: Pencarian real-time menggunakan filter()
    const filterMahasiswa = () => {
        const keyword = searchInput.value.trim().toLowerCase();

        const hasilPencarian = listMahasiswa.filter(mhs =>
            mhs.nama.toLowerCase().includes(keyword) ||
            mhs.nim.toLowerCase().includes(keyword)
        );

        renderTable(hasilPencarian);
    };

    searchInput.addEventListener("input", filterMahasiswa);

    // CREATE & UPDATE: Submit formulir
    mhsForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            nim: nimInput.value.trim(),
            nama: namaInput.value.trim(),
            jurusan: jurusanInput.value,
            email: emailInput.value.trim()
        };

        const id = mhsIdInput.value;
        const isEdit = Boolean(id);

        // Fitur 2: Validasi NIM duplikat sebelum fetch()
        const nimSudahAda = listMahasiswa.some(mhs =>
            mhs.nim === payload.nim &&
            String(mhs.id) !== id
        );

        if (nimSudahAda) {
            alert("NIM sudah terdaftar!");
            return;
        }

        const url = isEdit
            ? `/api/mahasiswa/${id}`
            : "/api/mahasiswa";

        const method = isEdit ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (result.success) {
                showAlert(result.message);
                resetForm();
                loadMahasiswa();
            } else {
                showAlert("Terjadi kesalahan: " + result.message, "error");
            }
        } catch (err) {
            showAlert("Gagal mengirim data ke server", "error");
        }
    });

    // DELETE & EDIT: Event klik pada tabel
    mhsTableBody.addEventListener("click", async (e) => {
        const id = Number(e.target.dataset.id);
        if (!id) return;

        if (e.target.classList.contains("btn-edit")) {
            const targetMhs = listMahasiswa.find(m => m.id === id);

            if (targetMhs) {
                mhsIdInput.value = targetMhs.id;
                nimInput.value = targetMhs.nim;
                namaInput.value = targetMhs.nama;
                jurusanInput.value = targetMhs.jurusan;
                emailInput.value = targetMhs.email;

                formTitle.textContent = "Edit Data Mahasiswa";
                btnSubmit.textContent = "Perbarui Mahasiswa";
                btnCancel.style.display = "inline-block";

                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        } else if (e.target.classList.contains("btn-delete")) {
            if (confirm("Apakah Anda yakin ingin menghapus data mahasiswa ini?")) {
                try {
                    const res = await fetch(`/api/mahasiswa/${id}`, {
                        method: "DELETE"
                    });

                    const result = await res.json();

                    if (result.success) {
                        showAlert(result.message);
                        loadMahasiswa();
                    }
                } catch (err) {
                    showAlert("Gagal mengirim data ke server", "error");
                    console.error("Detail error:", err);
                    alert("Detail error: " + err.message);
                }
            }
        }
    });

    // Reset formulir ke mode tambah
    const resetForm = () => {
        mhsForm.reset();
        mhsIdInput.value = "";
        formTitle.textContent = "Tambah Mahasiswa Baru";
        btnSubmit.textContent = "Simpan Mahasiswa";
        btnCancel.style.display = "none";
    };

    btnCancel.addEventListener("click", resetForm);

    // Ambil data pertama kali
    loadMahasiswa();
});