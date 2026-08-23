# ErayVerse — GitHub Pages Kurulum Rehberi

Bu klasördeki `index.html` dosyası tamamen tek parça: HTML + CSS + JavaScript hepsi içinde. Hiçbir ekstra dosyaya veya kuruluma gerek yok.

## GitHub Pages'e yükleme (5 dakika)

1. [github.com](https://github.com) üzerinde yeni bir repo oluştur.
   - Siteni `https://kullaniciadi.github.io` adresinden yayınlamak istiyorsan repo adını tam olarak **kullaniciadi.github.io** yap (kendi GitHub kullanıcı adınla).
   - İstersen farklı bir isim de verebilirsin (örn. `erayverse`), o zaman site `https://kullaniciadi.github.io/erayverse` adresinde yayınlanır.
2. Bu klasördeki `index.html` dosyasını reponun **kök dizinine** yükle (GitHub'daki "Add file → Upload files" ile sürükleyip bırakabilirsin).
3. Repo ayarlarına git: **Settings → Pages**.
4. "Build and deployment" altında **Source: Deploy from a branch** seç, branch olarak **main**, klasör olarak **/ (root)** seç ve Save'e bas.
5. 1-2 dakika bekle, sayfa yukarıda GitHub'ın verdiği linkte yayında olacak.

## Gizli Owner Paneli

Sitenin sağ üstündeki **ERAYVERSE** logosuna art arda **5 kez** tıklarsan (ya da klavyede sırayla `backstage` yazarsan, ya da footer'daki küçük "kart yuvası" ikonuna tıklarsan) gizli giriş ekranı açılır.

Şifre: **kedi12345**

Panel içinde yapabileceklerin:
- Ziyaret sayısı, guestbook girişleri ve oyun rekorları gibi istatistikleri görmek
- Ana sayfadaki yazan animasyonlu başlığı ve alt metni değiştirmek
- Guestbook mesajlarını silmek (veya tamamen temizlemek)
- Konfeti patlatmak 🎉
- Tüm site verisini sıfırlamak

Not: Bu panel ve guestbook tamamen tarayıcı içinde (localStorage) çalışıyor — yani her ziyaretçinin gördüğü veri kendi tarayıcısına özel, ortak bir veritabanı yok. Gerçek bir backend olmadığı için bu normal ve GitHub Pages gibi statik hosting'lerde beklenen bir durum.

## Değiştirmek istersen

- Metinleri, sosyal medya linklerini (`index.html` içinde `social-row` kısmı) ve e-posta adresini kendi bilgilerinle değiştir.
- Şifreyi değiştirmek istersen `index.html` içinde `OWNER_PASSWORD` değişkenini ara ve değeri güncelle.
- Yeni oyun eklemek istersen mevcut oyunlardan birinin (`<div class="game-panel">` bloğu ve ilgili JavaScript IIFE'si) yapısını örnek alabilirsin.
