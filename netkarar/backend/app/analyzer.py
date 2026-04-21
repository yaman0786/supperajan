"""Rule-based risk analyzer for NETKARAR.

Given free-form Turkish text, scores six risk dimensions, then composes a final
decision (YAP / DİKKATLİ OL / YAPMA) with a summary, reasons and suggestions.
The scoring is deterministic and transparent: every detected signal is reported.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Dict, List, Tuple

from .rules import CATEGORY_LABELS, SIGNALS, Signal
from .schemas import AnalyzeResponse


@dataclass
class Hit:
    category: str
    signal: Signal


CATEGORY_CAP = 60
COMBINED_CAP = 100


def _normalize(text: str) -> str:
    lowered = text.lower()
    lowered = lowered.replace("i̇", "i")
    lowered = re.sub(r"\s+", " ", lowered)
    return lowered.strip()


def _scan(text: str) -> List[Hit]:
    haystack = _normalize(text)
    hits: List[Hit] = []
    seen: set[Tuple[str, str]] = set()
    for category, signals in SIGNALS.items():
        for sig in signals:
            needle = sig.pattern.lower()
            if needle in haystack:
                key = (category, sig.pattern)
                if key in seen:
                    continue
                seen.add(key)
                hits.append(Hit(category=category, signal=sig))
    return hits


def _category_scores(hits: List[Hit]) -> Dict[str, int]:
    scores: Dict[str, int] = {c: 0 for c in SIGNALS}
    for hit in hits:
        scores[hit.category] = min(CATEGORY_CAP, scores[hit.category] + hit.signal.weight)
    return scores


def _dominant_category(scores: Dict[str, int]) -> str:
    if not any(scores.values()):
        return "Risk tespit edilmedi"
    top = max(scores.items(), key=lambda kv: kv[1])
    return CATEGORY_LABELS[top[0]]


def _overall_risk(scores: Dict[str, int]) -> int:
    if not any(scores.values()):
        return 0
    top = max(scores.values())
    extras = sum(s for s in scores.values() if s and s != top) // 3
    return max(0, min(COMBINED_CAP, top + extras))


def _decision(risk: int) -> Tuple[str, str]:
    if risk >= 65:
        return "YAPMA", "red"
    if risk >= 30:
        return "DİKKATLİ OL", "yellow"
    return "YAP", "green"


def _confidence(hits: List[Hit], text_len: int) -> int:
    if text_len < 15:
        base = 35
    elif text_len < 60:
        base = 55
    else:
        base = 70
    base += min(25, len(hits) * 5)
    return max(0, min(100, base))


SUGGESTION_BANK: Dict[str, List[str]] = {
    "scam": [
        "Kimlik, OTP, CVV veya şifre asla paylaşma.",
        "Resmî kanal dışındaki bağlantılara tıklama; doğrudan kurumun uygulamasını kullan.",
        "Ödemeyi ancak tanınan bir pazaryeri üzerinden güvenli ödeme ile yap.",
    ],
    "urgency": [
        "Aciliyet baskısına karşı en az 10 dakika bekle, kararı yeniden değerlendir.",
        "Karşı tarafa sakin bir dille \"düşünmek istiyorum\" de.",
    ],
    "product": [
        "Satıcının geçmiş yorumlarını ve hesap yaşını incele.",
        "Orijinal fatura ve garanti belgesi iste; yoksa uzak dur.",
        "Mümkünse elden teslim + test + güvenli ödeme tercih et.",
    ],
    "financial": [
        "Garantili / risksiz getiri vaatlerine asla inanma.",
        "Yalnızca SPK lisanslı kuruluşlarla işlem yap.",
        "Borçlanarak veya kredi çekerek yatırım yapma.",
    ],
    "legal": [
        "Sözleşmeyi yazılı ve imzalı olarak al; mümkünse noter onayı.",
        "Bir avukata danışmadan taahhüt altına girme.",
        "Tüm yazışmaları ve belgeleri sakla.",
    ],
    "manipulation": [
        "\"Kimseye söyleme / sadece sana\" baskısını kırmızı bayrak say.",
        "Güvendiğin üçüncü bir kişiye durumu anlat; dış gözle değerlendir.",
    ],
}

GENERIC_SUGGESTIONS = [
    "Kararı yazıya dök: somut gerçekler, varsayımlar, en kötü senaryo.",
    "24 saat bekleyip yeniden oku — duygu düşer, netlik artar.",
]


def _suggestions(scores: Dict[str, int]) -> List[str]:
    out: List[str] = []
    active = sorted(
        ((cat, score) for cat, score in scores.items() if score > 0),
        key=lambda kv: kv[1],
        reverse=True,
    )
    for cat, _ in active[:3]:
        out.extend(SUGGESTION_BANK.get(cat, [])[:2])
    if not out:
        out.extend(GENERIC_SUGGESTIONS)
    deduped: List[str] = []
    for item in out:
        if item not in deduped:
            deduped.append(item)
    return deduped[:6]


def _summary(decision: str, category: str, risk: int, hit_count: int) -> str:
    if hit_count == 0:
        return (
            "Metinde belirgin bir risk sinyali bulunamadı. Yine de temel doğrulamaları "
            "yapmadan hızlı karar vermemen önerilir."
        )
    phrase = {
        "YAP": "düşük risk profili",
        "DİKKATLİ OL": "orta seviyeli risk profili",
        "YAPMA": "yüksek risk profili",
    }[decision]
    return (
        f"{category} alanında {phrase} saptandı (risk {risk}/100). "
        f"{hit_count} belirgin sinyal tespit edildi; ayrıntılar aşağıda."
    )


def analyze(text: str) -> AnalyzeResponse:
    hits = _scan(text)
    scores = _category_scores(hits)
    risk = _overall_risk(scores)
    decision, color = _decision(risk)
    category = _dominant_category(scores)
    reasons = [f"{CATEGORY_LABELS[h.category]}: {h.signal.reason}" for h in hits]
    if not reasons:
        reasons = ["Belirgin bir risk örüntüsü tespit edilmedi."]
    return AnalyzeResponse(
        decision=decision,
        decision_color=color,
        risk=risk,
        confidence=_confidence(hits, len(text)),
        category=category,
        summary=_summary(decision, category, risk, len(hits)),
        reasons=reasons[:10],
        suggestions=_suggestions(scores),
    )
