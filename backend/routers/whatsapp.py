"""WhatsApp import endpoints — parse .txt export and push contacts to pipeline."""
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from backend.services.wa_parser import parse_export, normalise_phone, WaContact
from backend.services.supabase_client import get_supabase

router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp"])


class ContactIn(BaseModel):
    name: str
    phone: str
    message_count: int


class ImportRequest(BaseModel):
    contacts: list[ContactIn]
    group_name: str = ""
    file_name: str = ""
    imported_by: str = ""


class ParseResponse(BaseModel):
    contacts: list[ContactIn]
    total: int


class ImportResponse(BaseModel):
    added: int
    import_id: str


@router.post("/parse", response_model=ParseResponse)
async def parse_whatsapp_file(file: UploadFile = File(...)) -> ParseResponse:
    if not file.filename or not file.filename.endswith(".txt"):
        raise HTTPException(status_code=400, detail="Upload a .txt WhatsApp export file")
    content = (await file.read()).decode("utf-8", errors="replace")
    contacts = parse_export(content)
    return ParseResponse(
        contacts=[ContactIn(name=c.name, phone=c.phone, message_count=c.message_count) for c in contacts],
        total=len(contacts),
    )


@router.post("/import", response_model=ImportResponse)
async def import_contacts(body: ImportRequest) -> ImportResponse:
    if not body.contacts:
        raise HTTPException(status_code=400, detail="No contacts to import")

    db = get_supabase()

    # Upsert into pipeline_leads (skip duplicates by phone)
    lead_rows = [
        {
            "name": c.name if c.name != "Unknown" else None,
            "phone": normalise_phone(c.phone) if c.phone else None,
            "source": "whatsapp_group",
            "stage": "new",
            "notes": f"WhatsApp group: {body.group_name}" if body.group_name else "WhatsApp import",
        }
        for c in body.contacts
        if c.phone  # skip contacts with no phone number
    ]

    if not lead_rows:
        raise HTTPException(status_code=400, detail="No contacts with valid phone numbers")

    leads_resp = db.table("pipeline_leads").insert(lead_rows).execute()
    added = len(leads_resp.data) if leads_resp.data else 0

    # Log the import
    log_resp = (
        db.table("whatsapp_imports")
        .insert({
            "group_name": body.group_name or None,
            "file_name": body.file_name or None,
            "contacts_found": len(body.contacts),
            "contacts_added": added,
            "imported_by": body.imported_by or None,
        })
        .execute()
    )
    import_id = log_resp.data[0]["id"] if log_resp.data else ""

    return ImportResponse(added=added, import_id=import_id)


@router.get("/imports")
async def list_imports(limit: int = 20) -> list[dict]:
    db = get_supabase()
    resp = (
        db.table("whatsapp_imports")
        .select("*")
        .order("imported_at", desc=True)
        .limit(limit)
        .execute()
    )
    return resp.data or []
