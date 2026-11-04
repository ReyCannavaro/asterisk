# User Verification & Server Execution Directive

## 1. Dilarang Menjalankan Server Lokal Secara Mandiri
* AI Agent dilarang menjalankan proses server pengembangan atau preview (`npm run dev`, `bun run dev`, `moon run :dev`, dsb.) baik secara langsung maupun sebagai daemon background.
* Proses server sepenuhnya dikendalikan oleh USER di terminal mereka sendiri.

## 2. Verifikasi Tampilan Visual Wajib dari USER
* AI Agent dilarang melakukan inspeksi visual atau mengecek tampilan UI secara mandiri menggunakan browser automation/subagent.
* Seluruh pengujian dan verifikasi estetika/tampilan antarmuka diserahkan secara mutlak kepada USER.
* Agen hanya bertugas memastikan kode valid, bebas error linting/TypeScript, dan lulus build (`npm run build`), lalu mempersilakan USER untuk melakukan refresh dan memverifikasi tampilan di browser mereka.
