"""Aggregations over the anonymised query log, ADR reports and feedback.

The log stores only entity ids, the verdict, the KB version and an optional Indian state - never a photo,
a name or an IP. Everything here is therefore safe to show on a public dashboard.
"""
from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Tuple

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.kb import Drug, Herb, Interaction, InteractionSource
from app.models.ops import ADRReport, Feedback, QueryLog, CurationDraft
from app.schemas.analytics import (
    ADRSummaryItem,
    AnalyticsSummary,
    DailyPoint,
    FeedbackCount,
    InteractionCount,
    NameCount,
    PairCount,
    StateCount,
    Totals,
    VerdictCounts,
)

_RANK = {"GREEN": 0, "AMBER": 1, "RED": 2, "GREY": 0}


def _utc(dt: datetime) -> datetime:
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def summary(db: Session, days: int = 30) -> AnalyticsSummary:
    s = get_settings()
    now = datetime.now(timezone.utc)
    since = now - timedelta(days=days)

    herbs: Dict[int, Herb] = {h.id: h for h in db.scalars(select(Herb)).all()}
    drugs: Dict[int, Drug] = {d.id: d for d in db.scalars(select(Drug)).all()}
    inter: Dict[str, Interaction] = {i.code: i for i in db.scalars(select(Interaction)).all()}

    logs: List[QueryLog] = list(db.scalars(select(QueryLog).order_by(QueryLog.ts)).all())
    period = [l for l in logs if _utc(l.ts) >= since]

    verdicts = Counter(l.verdict for l in period)
    daily: Dict[str, Counter] = defaultdict(Counter)
    for i in range(days):
        daily[(since + timedelta(days=i + 1)).strftime("%Y-%m-%d")]  # ensure every day exists
    for l in period:
        d = _utc(l.ts).strftime("%Y-%m-%d")
        daily[d][l.verdict] += 1
        daily[d]["total"] += 1

    pair_counts: Counter = Counter()
    pair_worst: Dict[Tuple[int, int], str] = {}
    herb_counts: Counter = Counter()
    drug_counts: Counter = Counter()
    code_counts: Counter = Counter()
    state_counts: Counter = Counter()
    for l in period:
        for h in l.herb_ids or []:
            herb_counts[h] += 1
            for d in l.drug_ids or []:
                pair_counts[(h, d)] += 1
                prev = pair_worst.get((h, d))
                if prev is None or _RANK[l.verdict] > _RANK[prev]:
                    pair_worst[(h, d)] = l.verdict
        for d in l.drug_ids or []:
            drug_counts[d] += 1
        for c in l.matched_interaction_ids or []:
            code_counts[c] += 1
        if l.state:
            state_counts[l.state] += 1

    top_pairs = [
        PairCount(herb=herbs[h].english_name if h in herbs else f"#{h}", drug=drugs[d].generic if d in drugs else f"#{d}", count=n, worst_verdict=pair_worst[(h, d)])
        for (h, d), n in pair_counts.most_common(8)
    ]
    top_herbs = [NameCount(name=herbs[h].english_name if h in herbs else f"#{h}", detail=herbs[h].latin_name if h in herbs else None, count=n) for h, n in herb_counts.most_common(8)]
    top_drugs = [NameCount(name=drugs[d].generic if d in drugs else f"#{d}", detail=drugs[d].drug_class if d in drugs else None, count=n) for d, n in drug_counts.most_common(8)]
    top_interactions = []
    for code, n in code_counts.most_common(8):
        row = inter.get(code)
        if not row:
            continue
        cls = row.drug_class or ""
        target = row.drug.generic if row.drug else ("any oral medicine" if cls == "*" else cls.replace("_", " "))
        top_interactions.append(InteractionCount(code=code, herb=row.herb.english_name, target=target or "any medicine", severity=row.severity, evidence_grade=row.evidence_grade, count=n))

    adr_all: List[ADRReport] = list(db.scalars(select(ADRReport).order_by(ADRReport.ts.desc())).all())
    adr_outcomes = Counter(a.outcome for a in adr_all)
    serious = sum(1 for a in adr_all if a.seriousness and a.seriousness != "not_serious")
    recent_adr = [
        ADRSummaryItem(reference=a.reference, ts=_utc(a.ts).strftime("%Y-%m-%d %H:%M"), product=a.product, outcome=a.outcome, seriousness=a.seriousness, reporter_type=a.reporter_type, state=a.state, drugs=list(a.drugs or []))
        for a in adr_all[:12]
    ]
    for a in adr_all:
        if a.state:
            state_counts[a.state] += 0  # make sure states with only ADRs still appear

    fb = list(db.scalars(select(Feedback)).all())
    fb_types = Counter(f.issue_type for f in fb)

    totals = Totals(
        queries=len(logs),
        queries_web=sum(1 for l in logs if l.source == "web"),
        queries_demo=sum(1 for l in logs if l.source != "web"),
        queries_period=len(period),
        adr_reports=len(adr_all),
        adr_serious=serious,
        feedback_total=len(fb),
        feedback_open=sum(1 for f in fb if f.status == "open"),
        kb_interactions=db.scalar(select(func.count(Interaction.id)).where(Interaction.is_active.is_(True))) or 0,
        kb_sources=db.scalar(select(func.count(InteractionSource.id))) or 0,
        kb_sources_verified=db.scalar(select(func.count(InteractionSource.id)).where(InteractionSource.verification_status == "verified")) or 0,
        curation_drafts_pending=db.scalar(select(func.count(CurationDraft.id)).where(CurationDraft.status == "pending")) or 0,
        curation_drafts_mismatch=db.scalar(select(func.count(CurationDraft.id)).where(CurationDraft.status == "mismatch")) or 0,
    )

    return AnalyticsSummary(
        generated_at=now.isoformat(timespec="seconds"),
        kb_version=s.kb_version,
        period_days=days,
        totals=totals,
        verdicts=VerdictCounts(**{k: verdicts.get(k, 0) for k in ("GREEN", "AMBER", "RED", "GREY")}),
        daily=[DailyPoint(date=d, total=c.get("total", 0), GREEN=c.get("GREEN", 0), AMBER=c.get("AMBER", 0), RED=c.get("RED", 0), GREY=c.get("GREY", 0)) for d, c in sorted(daily.items())],
        top_pairs=top_pairs,
        top_herbs=top_herbs,
        top_drugs=top_drugs,
        top_interactions=top_interactions,
        by_state=[StateCount(state=st, count=n) for st, n in state_counts.most_common(12) if n > 0],
        adr_outcomes=dict(adr_outcomes),
        recent_adr=recent_adr,
        feedback_by_type=[FeedbackCount(issue_type=t, count=n) for t, n in fb_types.most_common()],
    )
