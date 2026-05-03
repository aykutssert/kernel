**Bonus**

2- share: pet kısmında share butonu eklenebilir ama tasarım ve logic kararlaştırılmalı.
3- siteye google login eklenebilir bu sayede kullanıcılar pet yükler ama bu biraz uğraştırıcı bir feature
4- petler için tag eklenebilir.
- tagler için filter eklenebilir.
const filterTags = [
  "animal", "animated", "anime", "celeb", "chaotic", "cute", "game",
  "hand-drawn", "mascot", "minimal", "pixel", "retro", "robot",
  "soft", "spooky", "utility", "weird"
];

---

**Admin UX/UI**

1. **Bulk edit (docs + pets)** — Her iki tabloda da birden fazla satır seçip toplu publish/unpublish veya toplu silme. Şu an her satır ayrı ayrı işlem gerektiriyor.

2. **Bulk import için drag & drop zone (docs + pets)** — Şu an dosya seçici açılıyor. Hem pet zip'leri hem de markdown doc dosyaları sürükle bırak ile yüklenebilir.

3. **Admin'de inline önizleme modalı (docs + pets)** — Her iki tabloda göz ikonuna tıklayınca ayrı sayfaya gitmek yerine inline modal açılsa daha hızlı review olur.

4. **Bulk import draft kalıcılığı (docs + pets)** — Şu an sayfayı yenilersen tablodaki düzenlemeler sıfırlanıyor. Session storage'da draft saklansa import yarıda kalsa bile devam edilebilir.
