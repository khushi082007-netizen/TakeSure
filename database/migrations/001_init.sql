-- TakeSure knowledge base + operational schema (PostgreSQL / Supabase).
-- Mirrors backend/app/models exactly. Apply with:  psql "$DATABASE_URL" -f database/migrations/001_init.sql
-- then load data with:  cd backend && python scripts/seed.py
-- (SQLAlchemy `create_all` produces the same schema for SQLite dev/test; this file is the audited Postgres DDL.)

BEGIN;

CREATE TABLE IF NOT EXISTS herbs (
    id                SERIAL PRIMARY KEY,
    slug              VARCHAR(64)  NOT NULL UNIQUE,
    latin_name        VARCHAR(128) NOT NULL,
    sanskrit_name     VARCHAR(128),
    hindi_name        VARCHAR(128),
    english_name      VARCHAR(128) NOT NULL,
    category          VARCHAR(64),
    api_monograph_ref VARCHAR(128)
);

CREATE TABLE IF NOT EXISTS herb_synonyms (
    id       SERIAL PRIMARY KEY,
    herb_id  INTEGER NOT NULL REFERENCES herbs(id) ON DELETE CASCADE,
    term     VARCHAR(128) NOT NULL,
    language VARCHAR(16),
    CONSTRAINT uq_herb_term UNIQUE (herb_id, term)
);
CREATE INDEX IF NOT EXISTS ix_herb_synonyms_term    ON herb_synonyms (lower(term));
CREATE INDEX IF NOT EXISTS ix_herb_synonyms_herb_id ON herb_synonyms (herb_id);

CREATE TABLE IF NOT EXISTS drugs (
    id         SERIAL PRIMARY KEY,
    slug       VARCHAR(64)  NOT NULL UNIQUE,
    generic    VARCHAR(128) NOT NULL,
    drug_class VARCHAR(64)  NOT NULL,
    atc_code   VARCHAR(16),
    route      VARCHAR(32)
);
CREATE INDEX IF NOT EXISTS ix_drugs_generic    ON drugs (lower(generic));
CREATE INDEX IF NOT EXISTS ix_drugs_drug_class ON drugs (drug_class);

CREATE TABLE IF NOT EXISTS drug_brands (
    id      SERIAL PRIMARY KEY,
    drug_id INTEGER NOT NULL REFERENCES drugs(id) ON DELETE CASCADE,
    brand   VARCHAR(128) NOT NULL,
    CONSTRAINT uq_drug_brand UNIQUE (drug_id, brand)
);
CREATE INDEX IF NOT EXISTS ix_drug_brands_brand ON drug_brands (lower(brand));

CREATE TABLE IF NOT EXISTS products (
    id           SERIAL PRIMARY KEY,
    brand        VARCHAR(128) NOT NULL,
    manufacturer VARCHAR(128),
    label_text   TEXT,
    source_url   VARCHAR(512)
);
CREATE INDEX IF NOT EXISTS ix_products_brand ON products (lower(brand));

CREATE TABLE IF NOT EXISTS product_herbs (
    id         SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    herb_id    INTEGER NOT NULL REFERENCES herbs(id)    ON DELETE CASCADE,
    quantity   VARCHAR(64)
);
CREATE INDEX IF NOT EXISTS ix_product_herbs_product_id ON product_herbs (product_id);
CREATE INDEX IF NOT EXISTS ix_product_herbs_herb_id    ON product_herbs (herb_id);

-- One row = one claim = at least one source.
CREATE TABLE IF NOT EXISTS interactions (
    id                 SERIAL PRIMARY KEY,
    code               VARCHAR(64) NOT NULL UNIQUE,
    herb_id            INTEGER NOT NULL REFERENCES herbs(id) ON DELETE RESTRICT,
    drug_id            INTEGER REFERENCES drugs(id) ON DELETE RESTRICT,
    drug_class         VARCHAR(64),
    severity           VARCHAR(16) NOT NULL CHECK (severity IN ('minor','moderate','major')),
    interaction_type   VARCHAR(32) NOT NULL DEFAULT 'pharmacodynamic'
                       CHECK (interaction_type IN ('pharmacodynamic','pharmacokinetic','timing','contamination')),
    mechanism          TEXT NOT NULL,
    effect             TEXT NOT NULL,
    management         TEXT NOT NULL,
    timing_gap_hours   DOUBLE PRECISION CHECK (timing_gap_hours IS NULL OR timing_gap_hours > 0),
    evidence_grade     VARCHAR(1) NOT NULL CHECK (evidence_grade IN ('A','B','C')),
    population_flags   JSONB NOT NULL DEFAULT '[]'::jsonb,
    patient_summary_en TEXT,
    patient_summary_hi TEXT,
    reviewer           VARCHAR(128),
    reviewed_on        DATE,
    kb_version         VARCHAR(16) NOT NULL,
    is_active          BOOLEAN NOT NULL DEFAULT TRUE,
    -- exactly one of drug_id / drug_class ('*' = any drug) must be set
    CONSTRAINT ck_interaction_target CHECK ((drug_id IS NULL) <> (drug_class IS NULL))
);
CREATE INDEX IF NOT EXISTS ix_interactions_herb_class ON interactions (herb_id, drug_class);
CREATE INDEX IF NOT EXISTS ix_interactions_herb_drug  ON interactions (herb_id, drug_id);
CREATE INDEX IF NOT EXISTS ix_interactions_active     ON interactions (is_active);

CREATE TABLE IF NOT EXISTS interaction_sources (
    id                  SERIAL PRIMARY KEY,
    interaction_id      INTEGER NOT NULL REFERENCES interactions(id) ON DELETE CASCADE,
    title               VARCHAR(512) NOT NULL,
    source_type         VARCHAR(32)  NOT NULL
                        CHECK (source_type IN ('rct','review','case_series','case_report','monograph','database','regulatory','book')),
    doi                 VARCHAR(128),
    pmid                VARCHAR(32),
    url                 VARCHAR(512),
    year                INTEGER,
    verification_status VARCHAR(16) NOT NULL DEFAULT 'needs_verification'
                        CHECK (verification_status IN ('needs_verification','verified','disputed'))
);
CREATE INDEX IF NOT EXISTS ix_interaction_sources_interaction_id ON interaction_sources (interaction_id);

-- Anonymised analytics: WHAT was checked, never WHO.
CREATE TABLE IF NOT EXISTS queries_log (
    id                      SERIAL PRIMARY KEY,
    ts                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    herb_ids                JSONB NOT NULL DEFAULT '[]'::jsonb,
    drug_ids                JSONB NOT NULL DEFAULT '[]'::jsonb,
    verdict                 VARCHAR(8) NOT NULL CHECK (verdict IN ('GREEN','AMBER','RED','GREY')),
    matched_interaction_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    kb_version              VARCHAR(16) NOT NULL,
    state                   VARCHAR(64),
    source                  VARCHAR(16) NOT NULL DEFAULT 'web'
);
CREATE INDEX IF NOT EXISTS ix_queries_log_ts      ON queries_log (ts);
CREATE INDEX IF NOT EXISTS ix_queries_log_verdict ON queries_log (verdict);

-- Mirrors the Ministry of Ayush suspected-ADR reporting form fields. Stored only with consent.
CREATE TABLE IF NOT EXISTS adr_reports (
    id                   SERIAL PRIMARY KEY,
    reference            VARCHAR(32) NOT NULL UNIQUE,
    ts                   TIMESTAMPTZ NOT NULL DEFAULT now(),
    product              VARCHAR(256) NOT NULL,
    product_manufacturer VARCHAR(128),
    product_batch        VARCHAR(64),
    drugs                JSONB NOT NULL DEFAULT '[]'::jsonb,
    reaction             TEXT NOT NULL,
    onset_date           VARCHAR(32),
    outcome              VARCHAR(64) NOT NULL,
    seriousness          VARCHAR(64),
    patient_age_group    VARCHAR(32),
    patient_sex          VARCHAR(16),
    reporter_type        VARCHAR(32) NOT NULL,
    state                VARCHAR(64),
    exported_pdf         BOOLEAN NOT NULL DEFAULT FALSE,
    status               VARCHAR(32) NOT NULL DEFAULT 'exported_for_official_submission'
);

CREATE TABLE IF NOT EXISTS feedback (
    id               SERIAL PRIMARY KEY,
    ts               TIMESTAMPTZ NOT NULL DEFAULT now(),
    issue_type       VARCHAR(32) NOT NULL,
    description      TEXT NOT NULL,
    interaction_code VARCHAR(64),
    page             VARCHAR(64),
    status           VARCHAR(16) NOT NULL DEFAULT 'open'
);
CREATE INDEX IF NOT EXISTS ix_feedback_interaction_code ON feedback (interaction_code);

COMMIT;
