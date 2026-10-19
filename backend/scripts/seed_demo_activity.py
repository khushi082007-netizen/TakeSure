#!/usr/bin/env python3
"""Populate the anonymised query log, a few ADR reports and feedback rows with *demonstration* activity so the
dashboard has something to show on a fresh install. Everything is tagged source="demo" and can be wiped with
`python scripts/seed_demo_activity.py --clear`.

    cd backend && python scripts/seed_demo_activity.py            # adds ~180 demo queries over the last 30 days
    cd backend && python scripts/seed_demo_activity.py --clear    # removes demo activity only
"""
import random
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import delete, select  # noqa: E402

from app.db.session import session_scope  # noqa: E402
from app.models.kb import Drug, Herb  # noqa: E402
from app.models.ops import ADRReport, Feedback, QueryLog  # noqa: E402
from app.services.interaction_service import evaluate  # noqa: E402

STATES = ["Delhi", "Maharashtra", "Uttar Pradesh", "Karnataka", "Tamil Nadu", "Gujarat", "West Bengal", "Rajasthan", "Kerala", "Madhya Pradesh", "Haryana", "Punjab"]
STATE_W = [16, 14, 12, 10, 8, 8, 7, 6, 5, 5, 5, 4]

# (herb slugs, drug slugs, weight) - realistic Indian co-use patterns
PATTERNS = [
    (["ashwagandha"], ["levothyroxine"], 18),
    (["giloy"], ["metformin"], 12),
    (["giloy"], ["tacrolimus"], 4),
    (["guggul"], ["warfarin"], 5),
    (["guggul"], ["atorvastatin"], 7),
    (["turmeric"], ["aspirin"], 9),
    (["turmeric"], ["clopidogrel"], 5),
    (["licorice"], ["amlodipine"], 6),
    (["licorice"], ["furosemide"], 3),
    (["karela"], ["metformin"], 10),
    (["karela", "methi"], ["glimepiride"], 5),
    (["triphala"], ["levothyroxine"], 8),
    (["isabgol"], ["metformin"], 6),
    (["chyawanprash"], ["metformin"], 9),
    (["chyawanprash"], ["levothyroxine"], 7),
    (["brahmi"], ["escitalopram"], 4),
    (["ashwagandha"], ["alprazolam"], 4),
    (["shankhpushpi"], ["phenytoin"], 2),
    (["arjuna"], ["telmisartan"], 5),
    (["tulsi"], ["warfarin"], 3),
    (["bhasma"], ["metformin"], 3),
    (["ashwagandha", "triphala"], ["levothyroxine", "metformin"], 6),
    ([], ["metformin"], 5),  # unknown product -> GREY
]

ADRS = [
    dict(product="Giloy Ghanvati", drugs=["Tacrolimus"], reaction="Yellowing of eyes and dark urine two weeks after starting giloy tablets.", outcome="recovering", seriousness="hospitalisation", reporter_type="caregiver", state="Maharashtra", age="adult"),
    dict(product="Ashwagandha capsules", drugs=["Levothyroxine"], reaction="Palpitations, sweating and weight loss; TSH found suppressed at review.", outcome="recovered", seriousness="not_serious", reporter_type="patient", state="Delhi", age="adult"),
    dict(product="Karela Jamun juice", drugs=["Glimepiride", "Metformin"], reaction="Two episodes of shakiness and sweating before lunch (low sugar on glucometer).", outcome="recovered", seriousness="not_serious", reporter_type="patient", state="Karnataka", age="elderly"),
    dict(product="Guggulu tablets", drugs=["Warfarin"], reaction="Bleeding gums and large bruises on the arms; INR raised.", outcome="recovering", seriousness="other_medically_important", reporter_type="doctor_mbbs", state="Tamil Nadu", age="elderly"),
    dict(product="Mulethi churna", drugs=["Amlodipine", "Hydrochlorothiazide"], reaction="Blood pressure rose and legs swelled after daily mulethi for a cough.", outcome="recovered", seriousness="not_serious", reporter_type="pharmacist", state="Gujarat", age="adult"),
]

FEEDBACK = [
    ("missing_interaction", "Tulsi with anticoagulants should have its own row; there are case reports.", None, "knowledge-base"),
    ("wrong_source", "The LiverTox link opens the index page, not the ashwagandha chapter.", "INT-ASHWA-LIVER", "results"),
    ("ocr_error", "'Thyronorm 25' was read as 'Thyronom 25' from a clear photo.", None, "review"),
    ("translation", "Hindi summary for the Giloy row uses a very formal word for liver.", "INT-GILOY-IMMUNO", "results"),
]


def clear() -> None:
    with session_scope() as db:
        n1 = db.execute(delete(QueryLog).where(QueryLog.source == "demo")).rowcount
        n2 = db.execute(delete(ADRReport).where(ADRReport.reference.like("ADR-DEMO-%"))).rowcount
        n3 = db.execute(delete(Feedback).where(Feedback.description.like("[demo] %"))).rowcount
    print(f"Removed demo activity: {n1} queries, {n2} ADR reports, {n3} feedback rows")


def seed(n_queries: int = 180, days: int = 30, seed: int = 7) -> None:
    rnd = random.Random(seed)
    now = datetime.now(timezone.utc)
    with session_scope() as db:
        herbs = {h.slug: h for h in db.scalars(select(Herb)).all()}
        drugs = {d.slug: d for d in db.scalars(select(Drug)).all()}
        weights = [p[2] for p in PATTERNS]
        created = []
        for _ in range(n_queries):
            hs, ds, _w = rnd.choices(PATTERNS, weights=weights, k=1)[0]
            unrec = ["Zandu Kesari Jivan"] if not hs else []
            res = evaluate(db, [drugs[s] for s in ds], [herbs[s] for s in hs], unrec, state=rnd.choices(STATES, weights=STATE_W, k=1)[0], source="demo")
            # spread timestamps over the period with a gentle upward trend and a daytime bias
            day_offset = int(days * (1 - rnd.random() ** 1.4))
            ts = now - timedelta(days=day_offset, hours=rnd.randint(0, 23), minutes=rnd.randint(0, 59))
            created.append((res.query_id, ts))
        db.flush()
        for qid, ts in created:
            row = db.get(QueryLog, qid)
            if row:
                row.ts = ts
        for i, a in enumerate(ADRS):
            ref = f"ADR-DEMO-{i + 1:03d}"
            if db.scalar(select(ADRReport).where(ADRReport.reference == ref)):
                continue
            db.add(ADRReport(reference=ref, ts=now - timedelta(days=rnd.randint(1, days - 2)), product=a["product"], drugs=a["drugs"], reaction=a["reaction"], onset_date=None, outcome=a["outcome"], seriousness=a["seriousness"], patient_age_group=a["age"], patient_sex=rnd.choice(["female", "male"]), reporter_type=a["reporter_type"], state=a["state"], exported_pdf=True))
        for t, desc, code, page in FEEDBACK:
            if db.scalar(select(Feedback).where(Feedback.description == f"[demo] {desc}")):
                continue
            db.add(Feedback(issue_type=t, description=f"[demo] {desc}", interaction_code=code, page=page, status="open"))
    print(f"Seeded {n_queries} demo queries over {days} days, {len(ADRS)} demo ADR reports, {len(FEEDBACK)} feedback rows")


if __name__ == "__main__":
    if "--clear" in sys.argv:
        clear()
    else:
        seed()
