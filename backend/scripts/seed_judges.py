"""Create/refresh only the marked judges' demo family in the configured Supabase project."""

import json
import secrets
from datetime import datetime, time, timedelta, timezone
from pathlib import Path
from uuid import NAMESPACE_URL, uuid5

from dotenv import dotenv_values
from supabase import create_client
from supabase.lib.client_options import SyncClientOptions

from app.api.routes.health_data import DEFAULT_VITAMINS
from app.api.routes.resources import DEFAULT_CHECKLIST


ROOT = Path(__file__).resolve().parents[2]
CREDENTIALS = ROOT / "scratch" / "judges-demo-credentials.json"
SEED = "temanbunda-insevent-judges-v1"
WIB = timezone(timedelta(hours=7))
ACCOUNTS = (
    ("mother", "juri.ibu@example.com", "Sari Pratiwi (Demo Juri)"),
    ("companion", "juri.suami@example.com", "Andi Pratama (Demo Juri)"),
)


def demo_id(key: str) -> str:
    return str(uuid5(NAMESPACE_URL, f"{SEED}:{key}"))


def require_demo_account(account) -> None:
    if (account.app_metadata or {}).get("demo_seed") != SEED:
        raise RuntimeError("Demo email already belongs to an unrelated account; refusing to modify it")


def build_demo_rows(mother_id: str, companion_id: str, now: datetime) -> dict[str, list[dict]]:
    now = now.astimezone(WIB)
    today = now.date()
    hpht = today - timedelta(weeks=32, days=3)
    pregnancy_id = demo_id("pregnancy")

    def row(table: str, key: str, **values) -> dict:
        return {"id": demo_id(f"{table}:{key}"), "pregnancy_id": pregnancy_id, **values}

    def stamp(day, hour=8) -> str:
        return min(datetime.combine(day, time(hour), WIB), now).isoformat()

    rows = {"pregnancies": [{
        "id": pregnancy_id, "mother_id": mother_id, "companion_id": companion_id,
        "hpht_date": hpht.isoformat(), "due_date": (hpht + timedelta(days=280)).isoformat(),
        "blood_type": "O+", "hospital": "RS Contoh TemanBunda (Demo)",
        "doctor": "dr. Maya (Demo), Sp.OG", "sync_code": demo_id("sync").replace("-", "")[:8].upper(),
        "sync_code_expires_at": now.isoformat(), "sync_code_used_at": now.isoformat(),
        "birth_at": None, "postpartum_admin": {},
    }]}
    rows["vital_logs"] = [
        row("vital_logs", str(i), recorded_by=mother_id, recorded_at=stamp(today - timedelta(days=ago), 9),
            pregnancy_week=(227 - ago) // 7, blood_pressure=pressure, weight=weight,
            fundal_height=22 + i * 2, fetal_movement="10 gerakan / 45 menit",
            hemoglobin=11.6 + i * 0.1, urine_protein="Negatif",
            notes="DATA DEMO JURI: kunjungan ANC fiktif; bukan rekam medis pasien.")
        for i, (ago, pressure, weight) in enumerate([
            (70, "110/70", 57.0), (56, "112/72", 58.1), (42, "114/74", 59.0),
            (28, "112/74", 60.2), (14, "116/76", 61.1), (0, "118/76", 62.0),
        ])
    ]
    rows["vitamins"] = [
        row("vitamins", str(i), label=label, dose=dose, color=color, active=True)
        for i, (label, dose, color) in enumerate(DEFAULT_VITAMINS)
    ]
    rows["vitamin_logs"] = [
        row("vitamin_logs", f"{i}:{today - timedelta(days=ago)}", vitamin_id=vitamin["id"],
            completed_on=(today - timedelta(days=ago)).isoformat(),
            completed_at=stamp(today - timedelta(days=ago)))
        for ago in range(7) for i, vitamin in enumerate(rows["vitamins"])
        if ago > 0 or i < 2
    ]
    rows["symptom_logs"] = [
        row("symptom_logs", f"{code}:{today}", symptom_code=code, label=label,
            risk_level=risk, is_active=False, recorded_on=today.isoformat())
        for code, label, risk in [
            ("nausea", "Mual Ringan", "green"), ("dizzy", "Pusing / Lemas", "yellow"),
            ("swelling", "Bengkak Kaki", "yellow"), ("insomnia", "Sulit Tidur / Cemas", "yellow"),
            ("bleed", "Perdarahan / Bercak Darah", "red"), ("amniotic", "Keluar Air Ketuban", "red"),
            ("fetalmove", "Gerakan Janin Berkurang", "red"), ("vomiting", "Muntah Terus-menerus", "red"),
            ("fever", "Demam Tinggi", "red"), ("edema", "Bengkak Wajah / Tangan", "red"),
            ("headache", "Sakit Kepala Hebat / Pandangan Kabur", "red"),
            ("seizure", "Kejang", "red"), ("pain", "Nyeri Perut Hebat", "red"),
        ]
    ]
    rows["kick_sessions"] = [
        row("kick_sessions", (today - timedelta(days=ago)).isoformat(), recorded_by=mother_id,
            started_at=(datetime.fromisoformat(stamp(today - timedelta(days=ago))) - timedelta(minutes=45)).isoformat(),
            ended_at=stamp(today - timedelta(days=ago)), kick_count=10 + ago % 3)
        for ago in range(7)
    ]
    rows["calendar_events"] = [
        row("calendar_events", str(i), created_by=mother_id,
            event_date=(today + timedelta(days=offset)).isoformat(), label=label,
            event_type=kind, completed=offset < 0,
            notes="DATA DEMO JURI: jadwal fiktif. Lokasi: RS Contoh TemanBunda.")
        for i, (offset, label, kind) in enumerate([
            (-14, "Kontrol ANC sebelumnya (Demo)", "anc"), (1, "Kontrol ANC & USG (Demo)", "anc"),
            (5, "Kelas persiapan persalinan (Demo)", "other"), (14, "Kontrol ANC berikutnya (Demo)", "anc"),
            (53, "Hari Perkiraan Lahir (Demo)", "hpl"),
        ])
    ]
    rows["checklist_categories"] = []
    rows["checklist_items"] = []
    for position, (name, labels) in enumerate(DEFAULT_CHECKLIST):
        category = row("checklist_categories", name, name=name, position=position)
        rows["checklist_categories"].append(category)
        for item_position, label in enumerate(labels):
            rows["checklist_items"].append(row(
                "checklist_items", f"{name}:{item_position}", category_id=category["id"],
                created_by=mother_id, label=label, position=item_position,
                completed=len(rows["checklist_items"]) < 7,
            ))
    rows["birth_plans"] = [
        row("birth_plans", key, option_key=key, selected=key != "epidural")
        for key in ("imd", "suami", "epidural", "tali_pusat", "rooming")
    ]
    rows["notifications"] = [
        row("notifications", user_id, user_id=user_id, kind="info", title="Selamat datang, Juri INSEVENT!",
            body="Akun demo Ibu dan Suami sudah terhubung. Semua data keluarga ini fiktif untuk pengujian.",
            link="/dashboard", dedupe_key=SEED)
        for user_id in (mother_id, companion_id)
    ]
    return rows


def main() -> None:
    cfg = dotenv_values(ROOT / "backend" / ".env")
    client = create_client(cfg["SUPABASE_URL"], cfg["SUPABASE_SERVICE_ROLE_KEY"], options=SyncClientOptions(
        persist_session=False, auto_refresh_token=False,
    ))
    targets = {email for _, email, _ in ACCOUNTS}
    existing = {}
    page = 1
    while True:
        accounts = client.auth.admin.list_users(page=page, per_page=100)
        for account in accounts:
            if (account.email or "").lower() in targets:
                require_demo_account(account)
                existing[account.email.lower()] = account
        if len(accounts) < 100:
            break
        page += 1

    if CREDENTIALS.exists():
        credentials = json.loads(CREDENTIALS.read_text(encoding="utf-8"))
        if credentials["supabase_url"] != cfg["SUPABASE_URL"]:
            raise RuntimeError("Saved credentials belong to a different Supabase project")
    else:
        if existing:
            raise RuntimeError("Demo accounts already exist; recover their local credentials before refreshing")
        credentials = {"supabase_url": cfg["SUPABASE_URL"], "accounts": [
            {"role": role, "email": email, "name": name, "password": "Juri!" + secrets.token_urlsafe(12)}
            for role, email, name in ACCOUNTS
        ]}
        CREDENTIALS.parent.mkdir(exist_ok=True)
        CREDENTIALS.write_text(json.dumps(credentials, indent=2), encoding="utf-8")

    ids = {}
    for account in credentials["accounts"]:
        email = account["email"]
        if email not in targets:
            raise RuntimeError("Unexpected account in demo credentials")
        user = existing.get(email)
        if user is None:
            user = client.auth.admin.create_user({
                "email": email, "password": account["password"], "email_confirm": True,
                "user_metadata": {"full_name": account["name"], "role": account["role"]},
                "app_metadata": {"demo_seed": SEED},
            }).user
        require_demo_account(user)
        ids[account["role"]] = str(user.id)

    pregnancy_id = demo_id("pregnancy")
    for user_id in ids.values():
        memberships = client.table("pregnancies").select("id,mother_id,companion_id").or_(
            f"mother_id.eq.{user_id},companion_id.eq.{user_id}"
        ).execute().data
        if any(p["id"] != pregnancy_id or p["mother_id"] != ids["mother"]
               or p.get("companion_id") not in (None, ids["companion"]) for p in memberships):
            raise RuntimeError("Demo account belongs to another pregnancy; refusing to change its data")
    collision = client.table("pregnancies").select("mother_id,companion_id").eq("id", pregnancy_id).execute().data
    if collision and (collision[0]["mother_id"] != ids["mother"]
                      or collision[0].get("companion_id") not in (None, ids["companion"])):
        raise RuntimeError("Demo pregnancy ID belongs to another family")

    now = datetime.now(WIB)
    rows = build_demo_rows(ids["mother"], ids["companion"], now)
    # Validate table availability before creating any pregnancy or child records.
    for table in rows:
        client.table(table).select("id").limit(1).execute()
    client.table("profiles").upsert([
        {"id": ids[role], "full_name": name, "role": role, "phone": None}
        for role, _, name in ACCOUNTS
    ]).execute()
    unique_keys = {
        "vitamin_logs": "vitamin_id,completed_on",
        "symptom_logs": "pregnancy_id,symptom_code,recorded_on",
        "birth_plans": "pregnancy_id,option_key",
        "notifications": "user_id,dedupe_key",
    }
    for table, records in rows.items():
        client.table(table).upsert(records, on_conflict=unique_keys.get(table, "id")).execute()
        print(f"{table}: {len(records)} demo rows saved", flush=True)
    credentials["seeded_at"] = now.isoformat()
    credentials["pregnancy_id"] = pregnancy_id
    CREDENTIALS.write_text(json.dumps(credentials, indent=2), encoding="utf-8")
    print(f"Demo family ready. Login credentials saved locally at {CREDENTIALS}")


if __name__ == "__main__":
    main()
