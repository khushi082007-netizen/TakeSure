from app.services.extraction_service import candidate_phrases, clean_line, tokenize
from app.services.matching_service import get_dictionary, match_phrase, match_text, resolve_manual


def test_clean_line_strips_dose_and_form():
    assert clean_line("Tab. Thyronorm 50 mcg 1-0-0") == "Thyronorm"
    assert clean_line("Cap Ashwagandha 500mg BD after food") == "Ashwagandha after food"


def test_tokenize_filters_stopwords_and_short_tokens():
    assert tokenize("Take Giloy Ghanvati daily with water") == [["Giloy"]]  # "ghanvati" is a dosage form and is stripped


def test_candidate_phrases_longest_first():
    phrases = candidate_phrases("Withania somnifera extract")
    assert phrases[0] == "Withania somnifera"


def test_exact_brand_maps_to_generic(db):
    d = get_dictionary(db)
    c = match_phrase("Thyronorm", d)
    assert c and c[0].canonical_name == "Levothyroxine" and c[0].via == "brand" and c[0].score == 100


def test_hindi_synonym_matches(db):
    d = get_dictionary(db)
    c = match_phrase("अश्वगंधा", d)
    assert c and c[0].canonical_name == "Ashwagandha"


def test_fuzzy_misspelling_accepted_or_confirmed(db):
    d = get_dictionary(db)
    c = match_phrase("Thyronom", d)  # OCR dropped a letter
    assert c and c[0].canonical_name == "Levothyroxine" and c[0].status in ("accepted", "needs_confirmation")


def test_short_tokens_never_fuzzy(db):
    d = get_dictionary(db)
    assert match_phrase("Tab", d) == []
    assert match_phrase("mox", d)  # exact brand match still works for short exact names


def test_unknown_product_is_unrecognised(db):
    d = get_dictionary(db)
    resolved, unrec = resolve_manual([("herb", "Zandu Kesari Jivan")], d)
    assert resolved == [] and unrec == ["Zandu Kesari Jivan"]


def test_product_expands_to_constituent_herbs(db):
    d = get_dictionary(db)
    c = match_phrase("Kapiva Karela Jamun Juice", d)
    assert {x.canonical_name for x in c} == {"Karela (Bitter melon)", "Jamun"}


def test_match_text_full_document(db):
    d = get_dictionary(db)
    text = "Rx\nTab. Thyronorm 50 mcg 1-0-0\nTab. Glycomet 500 mg 1-0-1\nSyp Mystery Tonic 10ml"
    cands, unrec = match_text(text, d)
    assert {c.canonical_name for c in cands} == {"Levothyroxine", "Metformin"}
    assert "Mystery Tonic" in unrec
