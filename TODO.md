# TODO - Perbaikan Sistem Website (Disposisi)

- [ ] Samakan payload POST `/api/disposisi` dengan backend (field: `isi_disposisi`, `catatan`)
- [ ] Samakan format response GET `/api/disposisi` (backend tidak mengirim `success`)
- [ ] Samakan status UI dengan enum backend (tambahkan `ditolak` ke enum model `Disposisi`)
- [ ] Samakan endpoint update: gunakan route backend yang tersedia (`/approve`, `/reject`, `/selesai`) daripada `/status`
- [ ] Perbarui fungsi `getStatusBadge`, filter status, dan tombol aksi berdasarkan status backend
- [ ] Jalankan build/dev untuk memastikan tidak ada error TypeScript/runtime

