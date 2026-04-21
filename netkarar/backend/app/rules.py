"""Keyword and phrase patterns for rule-based risk detection.

Each category carries a list of (pattern, weight, reason) tuples.
Weight is the contribution to that category's raw score per unique hit.
Patterns are matched case-insensitively on a lower-cased, accent-preserved text.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Tuple


@dataclass(frozen=True)
class Signal:
    pattern: str
    weight: int
    reason: str


CATEGORY_LABELS: Dict[str, str] = {
    "scam": "Dolandırıcılık / Sahtekârlık",
    "urgency": "Aciliyet / Baskı",
    "product": "Ürün / Satıcı Riski",
    "financial": "Finansal Risk",
    "legal": "Hukuki Uyuşmazlık",
    "manipulation": "Manipülasyon",
}


SIGNALS: Dict[str, List[Signal]] = {
    "scam": [
        Signal("iban", 18, "IBAN / hesap numarası paylaşımı isteniyor"),
        Signal("eft yap", 16, "EFT / havale yönlendirmesi var"),
        Signal("para gönder", 20, "Doğrudan para gönderme talebi var"),
        Signal("ödeme yap", 10, "Peşin ödeme talep ediliyor"),
        Signal("kapora", 14, "Kapora talebi (klasik sahtecilik kalıbı)"),
        Signal("kargo ücreti", 12, "Kargo ücreti öne sürülüyor"),
        Signal("otp", 22, "OTP / tek kullanımlık şifre isteniyor"),
        Signal("doğrulama kodu", 22, "Doğrulama kodu paylaşımı isteniyor"),
        Signal("sms kodu", 20, "SMS kodu paylaşımı isteniyor"),
        Signal("şifre", 14, "Şifre paylaşımı geçiyor"),
        Signal("kart numarası", 18, "Kart numarası paylaşımı geçiyor"),
        Signal("cvv", 22, "CVV / güvenlik kodu paylaşımı geçiyor"),
        Signal("linke tıkla", 14, "Şüpheli bağlantıya tıklama yönlendirmesi var"),
        Signal("link gönder", 10, "Bağlantı üzerinden yönlendirme var"),
        Signal("ödül kazand", 16, "Ödül / çekiliş kazanma iddiası var"),
        Signal("çekiliş", 10, "Çekiliş kalıbı geçiyor"),
        Signal("bedava", 8, "\"Bedava\" vaadi dikkat çekici"),
        Signal("hediye çeki", 10, "Hediye çeki tuzağı olabilir"),
        Signal("whatsapp", 6, "Resmî kanal dışı iletişim (WhatsApp) talebi var"),
        Signal("telegram", 6, "Resmî kanal dışı iletişim (Telegram) talebi var"),
    ],
    "urgency": [
        Signal("hemen", 6, "\"Hemen\" ile aciliyet dayatılıyor"),
        Signal("acilen", 8, "\"Acilen\" ifadesi var"),
        Signal("son gün", 10, "\"Son gün\" baskısı var"),
        Signal("son saat", 10, "\"Son saat\" baskısı var"),
        Signal("sınırlı süre", 10, "Sınırlı süre baskısı var"),
        Signal("sadece bugün", 10, "Tek güne sıkıştırılmış teklif"),
        Signal("kaçırma", 8, "\"Kaçırma\" çağrısı psikolojik baskı kurar"),
        Signal("tükenmek üzere", 8, "Stok tükenme baskısı"),
        Signal("şimdi karar", 12, "Hızlı karar baskısı"),
        Signal("dakika içinde", 10, "Dakika bazlı baskı var"),
    ],
    "product": [
        Signal("sıfır fiyat", 8, "Gerçekçi olmayan fiyat vaadi"),
        Signal("piyasanın altında", 10, "Piyasanın altında fiyat şüphe uyandırıyor"),
        Signal("fabrika çıkışı", 6, "Doğrulanamayan \"fabrika çıkışı\" iddiası"),
        Signal("garanti belgesi yok", 12, "Garanti belgesi bulunmuyor"),
        Signal("fatura yok", 12, "Fatura kesilmeyeceği belirtiliyor"),
        Signal("ikinci el", 4, "İkinci el ürün — durum doğrulaması gerekir"),
        Signal("kutusuz", 4, "Kutusuz ürün — orijinallik doğrulanmalı"),
        Signal("kapıda ödeme yok", 10, "Kapıda ödeme reddediliyor"),
        Signal("elden teslim yok", 8, "Elden teslim reddediliyor"),
        Signal("yurtdışından gelecek", 6, "Yurtdışı kargo belirsizliği"),
        Signal("gümrük", 6, "Gümrük süreçleri maliyet/gecikme getirebilir"),
        Signal("sahte", 14, "\"Sahte\" uyarı kelimesi geçiyor"),
        Signal("replika", 14, "\"Replika\" ifadesi orijinal olmadığını gösterir"),
    ],
    "financial": [
        Signal("garantili getiri", 22, "\"Garantili getiri\" vaadi gerçekçi değildir"),
        Signal("risksiz kazanç", 22, "\"Risksiz kazanç\" vaadi klasik dolandırıcılık kalıbı"),
        Signal("aylık %", 16, "Yüksek aylık getiri vaadi"),
        Signal("günlük %", 18, "Günlük getiri vaadi son derece riskli"),
        Signal("kripto", 8, "Kripto varlık — oynaklık yüksek"),
        Signal("bitcoin", 8, "Bitcoin — fiyat oynaklığı yüksek"),
        Signal("forex", 10, "Forex — kaldıraçlı işlem riski"),
        Signal("kaldıraç", 10, "Kaldıraç — kayıp riski yüksek"),
        Signal("kredi çek", 12, "Kredi çekerek yatırım önerisi riskli"),
        Signal("borçlan", 10, "Borçlanarak işlem tavsiyesi riskli"),
        Signal("ponzi", 30, "Ponzi kalıbı açıkça tehlikelidir"),
        Signal("piramit", 24, "Piramit yapı — hukuken ve finansal olarak riskli"),
        Signal("referans sistemi", 10, "Referansla kazanç — zincir yapı şüphesi"),
    ],
    "legal": [
        Signal("dava", 12, "Dava süreci gündemde"),
        Signal("mahkeme", 10, "Mahkeme süreci gündemde"),
        Signal("icra", 14, "İcra takibi riski var"),
        Signal("haciz", 16, "Haciz riski ciddi bir hukuki sinyaldir"),
        Signal("noter", 6, "Noter onayı gerekebilir — doğrulanmalı"),
        Signal("sözleşme yok", 16, "Sözleşme yokluğu hak kaybına yol açabilir"),
        Signal("yazılı belge yok", 14, "Yazılı belge bulunmaması risklidir"),
        Signal("avukat", 6, "Avukat dahil edilmesi gerekiyor olabilir"),
        Signal("ceza", 10, "Cezai yaptırım olasılığı"),
        Signal("şikayet", 6, "Resmî şikayet süreci ihtimali"),
        Signal("taahhüt", 6, "Taahhüt — yükümlülük doğurur, koşulları net olmalı"),
    ],
    "manipulation": [
        Signal("sadece sana", 12, "\"Sadece sana özel\" — kıtlık/özel muamele yanılsaması"),
        Signal("kimseye söyleme", 16, "\"Kimseye söyleme\" — izolasyon taktiği"),
        Signal("aramızda kalsın", 14, "\"Aramızda kalsın\" — gizlilik baskısı"),
        Signal("güven bana", 10, "\"Güven bana\" — duygusal baskı"),
        Signal("beni sev", 6, "Duygusal yönlendirme kalıbı"),
        Signal("suçlusun", 10, "Suçluluk duygusu yükleme girişimi"),
        Signal("borçlusun", 10, "Duygusal borçlandırma"),
        Signal("ailenin iyiliği", 8, "Aile üzerinden duygusal baskı"),
        Signal("son şans", 10, "\"Son şans\" — FOMO tetikleyici"),
        Signal("özel teklif", 6, "\"Özel teklif\" — seçilmişlik yanılsaması"),
    ],
}


def iter_signals() -> List[Tuple[str, Signal]]:
    return [(cat, sig) for cat, sigs in SIGNALS.items() for sig in sigs]
