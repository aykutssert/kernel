---

## Yapılanlar ✅

**Okuyucu tarafı**
- Navbar (logo, search, theme toggle, hamburger)
- CategoryTabs (sticky, active underline, hover state)
- Sol sidebar (kategori grupları, collapse/expand)
- Sağ "On This Page" (scroll-based aktif heading, dot indicator)
- Mobile hamburger drawer (portal-based)
- Mobile "On This Page" accordion
- DocContent (unified pipeline — markdown, kod highlight, anchor linkler)
- "Copy page" butonu
- Source URL linki (sayfanın altında)
- Dark / light mode

**Admin tarafı**
- Login sayfası
- Doc listesi (tablo, published badge)
- Yeni doc oluşturma
- Doc düzenleme
- Doc silme

---

## Eksik / Yarım ⚠️

- **Search** — `SearchDialog` ve `SearchTrigger` componentleri var ama içi boş, çalışmıyor
- **Ana sayfa** (`/`) — içeriksiz, sadece placeholder
- **`/docs` redirect** — kategorisiz docs URL'ye girilince ne olacağı belirsiz
- **Admin'de ThemeToggle yok** — admin layout'ta theme toggle eksik
- **`order_index`** — sidebar sıralaması DB'deki sıraya göre, adminde sürükle-bırak sıralama yok

---

## Nice to Have 💡

- **Full-text search** — Supabase `to_tsvector` ile ya da Algolia/Fuse.js ile client-side
- **Admin markdown preview** — textarea'nın yanında canlı preview paneli
- **Breadcrumb** — kategori > sayfa hiyerarşisi sayfanın üstünde
- **Prev / Next navigasyon** — sayfanın altında önceki/sonraki doc linkleri
- **`/llms.txt`** — tüm dokümanları tek düz metin olarak sunan LLM-friendly endpoint
- **OG image** — sosyal medya paylaşım görseli (her doc için dinamik)
- **Keyboard shortcut** — `⌘K` ile search açılması