// Slug üretici fonksiyonlar

export function generateProfileSlug(firstName: string, lastName: string, userId: string): string {
  // İsim ve soyismi birleştir ve küçük harfe çevir
  const fullName = `${firstName} ${lastName}`.toLowerCase();
  
  // Türkçe karakterleri değiştir
  const turkishMap: { [key: string]: string } = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  };
  
  let slug = fullName;
  Object.keys(turkishMap).forEach(key => {
    slug = slug.replace(new RegExp(key, 'g'), turkishMap[key]);
  });
  
  // Sadece harf, rakam ve boşluk bırak
  slug = slug.replace(/[^a-z0-9\s-]/g, '');
  
  // Boşlukları tire ile değiştir
  slug = slug.replace(/\s+/g, '-');
  
  // Birden fazla tireyi tek tireye indir
  slug = slug.replace(/-+/g, '-');
  
  // Baş ve sondaki tireleri temizle
  slug = slug.replace(/^-+|-+$/g, '');
  
  // UUID'nin ilk 4 hanesini al
  const shortId = userId.slice(0, 4);
  
  // Final slug: isim-soyisim-xxxx-profil
  return `${slug}-${shortId}-profil`;
}

export function extractUserIdFromSlug(slug: string): string | null {
  // Slug formatı: isim-soyisim-xxxx-profil
  // xxxx kısmını çıkar
  const parts = slug.split('-');
  
  // En az 3 parça olmalı (isim, id, profil)
  if (parts.length < 3) return null;
  
  // "profil" kelimesinden önceki parça ID olmalı
  const profileIndex = parts.indexOf('profil');
  if (profileIndex === -1 || profileIndex === 0) return null;
  
  return parts[profileIndex - 1];
}
