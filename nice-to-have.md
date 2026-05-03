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

---

**Website — Genel / Layout**

1. **Landing page (homepage)** — Şu an `/` direkt `/pets`'e redirect ediyor. Bunun yerine kısa bir hero section: logo, tek cümle açıklama, "Browse Pets" + "Read Docs" CTA. Sitenin ne olduğunu ilk bakışta anlatmalı.

---

**Website — Pets Listesi**

---

**Website — Pet Detay Sayfası**

14. **Share butonu** — Download butonunun yanına. Tıklanınca URL panoya kopyalanır, "Link copied!" toast gösterilir. Native Web Share API destekleyen cihazlarda (mobil) sistem share sheet açılır.

---

**Website — Docs**

17. **Docs overview sayfası** — `/docs` şu an ilk doc'a mı gidiyor belirsiz. Kategorileri ve her kategorideki doc sayısını gösteren bir grid overview sayfası olmalı. Hangi konular var, ne kadar içerik var — ilk bakışta anlaşılır olmalı.

18. **Okuma süresi göstergesi** — Doc başlığının altında küçük "X min read" etiketi. `content.length / 1000` yaklaşık dakika verir.

19. **İlerleme çubuğu (reading progress bar)** — Sayfa tepesinde (navbar altında) ince bir çizgi, scroll yüzdesine göre dolar. Uzun doc'larda nerede olduğunu gösterir.

20. **Sidebar aktif öğe scroll'u** — Uzun bir kategori listesinde aktif doc sidebar'ın görünür alanının dışında kalabilir. Sayfa açıldığında aktif item'ı sidebar içinde görünür konuma otomatik scroll etmeli.

21. **Doc hero image** — `image_url` olan doc'larda başlığın altında büyük bir hero görsel. Şu an image_url alanı var ama görsel layout net değil.

22. **SearchDialog'a pets ekleme** — Şu an Cmd+K ile sadece docs aranıyor. Pets de aynı kutuda aranabilir, sonuçlar "Docs" ve "Pets" başlıkları altında gruplu gelir.

23. **Kod bloğu dil etiketi** — Kod bloklarının sağ üstünde "typescript", "bash" gibi dil etiketi göstermek okunabilirliği artırır. CopyCodeButton'ın yanında.

24. **Prev/Next navigasyon tasarımı** — Doc sayfasının altındaki prev/next linkleri var ama tasarımları minimal. Kart tarzı, başlık + kategori bilgisi içeren daha belirgin bir navigasyon bloğu.

---

**Website — Arama**

25. **SearchDialog boş durum** — SearchDialog ilk açıldığında boş ekran var. "Recently viewed" docs veya popüler etiketler gösterilebilir.

26. **Keyboard shortcut göstergesi** — Search trigger butonunda şu an `⌘K` yazıyor ama görsel olarak yeterince belirgin değil. Windows/Linux'ta `Ctrl+K` gösterilmeli (platform tespiti ile).