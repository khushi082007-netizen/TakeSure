"""Turn raw OCR text into candidate tokens for dictionary matching.

Deterministic only: regex + stop-lists. No LLM is involved in deciding what a medicine is.
"""
import re
from typing import List, Set

# Dosage, strength and schedule noise commonly seen on Indian prescriptions / labels.
_STRENGTH = re.compile(r"\b\d+(?:[.,]\d+)?\s*(?:mg|mcg|µg|ug|g|ml|iu|%|units?)\b", re.I)
_SCHEDULE = re.compile(r"\b[0-1]\s*-\s*[0-1]\s*-\s*[0-1]\b|\b(?:od|bd|tds|qid|hs|sos|bid|tid|stat|ac|pc|bbf|hs)\b", re.I)
_FORMS = re.compile(r"\b(?:tab(?:let)?s?|cap(?:sule)?s?|syp|syrup|inj(?:ection)?|oint(?:ment)?|drops?|susp(?:ension)?|vati|churna|churnam|ghanvati|ghan|ras|rasayan|kwath|kadha|avaleha|asava|arishta|taila|tailam|lehyam)\b\.?", re.I)
_NOISE_CHARS = re.compile(r"[^\w\s\-/()\u0900-\u097F]", re.U)
_MULTISPACE = re.compile(r"\s+")

# Words that look like names but never are.
STOPWORDS: Set[str] = {
    "take", "daily", "once", "twice", "thrice", "after", "before", "food", "meal", "meals", "morning", "night", "evening",
    "days", "weeks", "months", "with", "water", "milk", "warm", "patient", "name", "age", "date", "doctor", "dr", "clinic",
    "hospital", "medical", "pharmacy", "advice", "review", "ingredients", "each", "contains", "net", "weight", "mfg", "exp",
    "batch", "price", "mrp", "incl", "taxes", "manufactured", "marketed", "store", "cool", "dry", "place", "keep", "away",
    "children", "dosage", "directed", "physician", "consult", "shake", "well", "use", "composition", "serving", "size",
    "ayurvedic", "proprietary", "medicine", "medicines", "classical", "formulation", "licence", "license", "india", "limited",
    "private", "pvt", "ltd", "the", "and", "for", "from", "this", "that", "not", "are", "has", "have", "only", "also",
    "sugar", "free", "natural", "herbal", "extract", "powder", "pure", "quality", "premium", "immunity", "stress", "energy",
    "health", "wellness", "supports", "helps", "general", "adult", "adults", "year", "years", "signature", "regd",
}

# Tiny set of product-form words that are themselves informative when attached to a name (e.g. "Giloy Ghanvati").
MAX_NGRAM = 3
MIN_TOKEN_LEN = 3


def clean_line(line: str) -> str:
    line = _STRENGTH.sub(" ", line)
    line = _SCHEDULE.sub(" ", line)
    line = _FORMS.sub(" ", line)
    line = _NOISE_CHARS.sub(" ", line)
    return _MULTISPACE.sub(" ", line).strip()


def tokenize(text: str) -> List[List[str]]:
    """Returns a list of token lists, one per line (we never build n-grams across line breaks)."""
    out: List[List[str]] = []
    for raw in text.splitlines():
        cleaned = clean_line(raw)
        if not cleaned:
            continue
        toks = [t.strip("-/()") for t in cleaned.split(" ")]
        toks = [t for t in toks if t and (len(t) >= MIN_TOKEN_LEN or re.search(r"[\u0900-\u097F]", t)) and not t.isdigit() and t.lower() not in STOPWORDS]
        if toks:
            out.append(toks)
    return out


def candidate_phrases(text: str) -> List[str]:
    """All 1..MAX_NGRAM-grams per line, longest first so 'Withania somnifera' is tried before 'Withania'."""
    phrases: List[str] = []
    seen: Set[str] = set()
    for toks in tokenize(text):
        n = len(toks)
        for size in range(min(MAX_NGRAM, n), 0, -1):
            for i in range(0, n - size + 1):
                p = " ".join(toks[i : i + size])
                key = p.lower()
                if key not in seen:
                    seen.add(key)
                    phrases.append(p)
    return phrases
