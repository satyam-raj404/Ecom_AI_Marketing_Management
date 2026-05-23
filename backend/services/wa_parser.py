"""Parse WhatsApp group chat .txt exports → unique contacts with message counts."""
import re
from dataclasses import dataclass, field

LINE_RE = re.compile(
    r"^\d{1,2}/\d{1,2}/\d{2,4},\s\d{1,2}:\d{2}\s?[AP]M\s-\s(.+?):\s"
)
PHONE_RE = re.compile(
    r"(\+91[\s\-]?\d{5}[\s\-]?\d{5}|\+91\d{10}|\b\d{10}\b)"
)


@dataclass
class WaContact:
    name: str
    phone: str
    message_count: int = field(default=0)


def parse_export(text: str) -> list[WaContact]:
    contacts: dict[str, WaContact] = {}

    for line in text.splitlines():
        m = LINE_RE.match(line)
        if not m:
            continue
        sender = m.group(1).strip()
        ph_match = PHONE_RE.search(sender)
        phone = re.sub(r"[\s\-]", "", ph_match.group(0)) if ph_match else ""
        key = phone or sender

        if key in contacts:
            contacts[key].message_count += 1
        else:
            contacts[key] = WaContact(
                name="Unknown" if phone else sender,
                phone=phone,
                message_count=1,
            )

    return sorted(contacts.values(), key=lambda c: c.message_count, reverse=True)


def normalise_phone(raw: str) -> str:
    digits = re.sub(r"\D", "", raw)
    if len(digits) == 10:
        return f"+91{digits}"
    if len(digits) == 12 and digits.startswith("91"):
        return f"+{digits}"
    return raw
