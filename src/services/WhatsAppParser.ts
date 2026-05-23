// Parses WhatsApp group chat .txt exports → extracts unique contacts with message counts

export interface WaContact {
  name: string;
  phone: string;
  messageCount: number;
}

const LINE_RE = /^\d{1,2}\/\d{1,2}\/\d{2,4},\s\d{1,2}:\d{2}\s?[AP]M\s-\s(.+?):\s/;
const PHONE_RE = /(\+91[\s-]?\d{5}[\s-]?\d{5}|\+91\d{10}|\d{10})/;

export function parseWhatsAppExport(text: string): WaContact[] {
  const map = new Map<string, WaContact>();

  for (const line of text.split("\n")) {
    const m = line.match(LINE_RE);
    if (!m) continue;
    const sender = m[1].trim();
    const ph = sender.match(PHONE_RE);
    const phone = ph ? ph[0].replace(/[\s-]/g, "") : "";
    const key = phone || sender;

    const existing = map.get(key);
    if (existing) {
      existing.messageCount++;
    } else {
      map.set(key, { name: phone ? "Unknown" : sender, phone, messageCount: 1 });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.messageCount - a.messageCount);
}

export function normalisePhone(raw: string): string {
  // Ensure +91 prefix for 10-digit numbers
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return raw;
}
