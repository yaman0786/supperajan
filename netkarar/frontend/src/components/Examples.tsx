interface Props {
  onPick: (text: string) => void;
  disabled?: boolean;
}

const EXAMPLES: { label: string; text: string }[] = [
  {
    label: "Kripto yatırım teklifi",
    text:
      "Arkadaşım günlük %3 garantili getiri veren bir kripto platformu önerdi. Hemen yatırım yapmazsan fırsatı kaçıracağını söylüyor.",
  },
  {
    label: "Şüpheli SMS",
    text:
      "Bankam adına gelen mesajda hesabımın kapatılmaması için linke tıklayıp SMS doğrulama kodumu girmemi istiyorlar.",
  },
  {
    label: "İkinci el alım",
    text:
      "İnternette piyasanın çok altında bir telefon buldum. Satıcı kapora istiyor, kargo ücretini de peşin ödememi söylüyor, elden teslim yapmıyor.",
  },
  {
    label: "İş anlaşması",
    text:
      "Yeni bir iş ortağıyla sözleşme yapmadan çalışmaya başlamamı teklif ediyorlar. Güven bana, kimseye söyleme diyorlar.",
  },
];

export default function Examples({ onPick, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {EXAMPLES.map((ex) => (
        <button
          key={ex.label}
          type="button"
          disabled={disabled}
          onClick={() => onPick(ex.text)}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {ex.label}
        </button>
      ))}
    </div>
  );
}
