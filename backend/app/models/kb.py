"""Knowledge-base tables. One interaction row = one claim = at least one source."""
from datetime import date
from typing import List, Optional

from sqlalchemy import JSON, Boolean, Date, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Herb(Base):
    __tablename__ = "herbs"
    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    latin_name: Mapped[str] = mapped_column(String(128))
    sanskrit_name: Mapped[Optional[str]] = mapped_column(String(128))
    hindi_name: Mapped[Optional[str]] = mapped_column(String(128))
    english_name: Mapped[str] = mapped_column(String(128))
    category: Mapped[Optional[str]] = mapped_column(String(64))  # e.g. 'single_herb', 'formulation', 'bhasma'
    api_monograph_ref: Mapped[Optional[str]] = mapped_column(String(128))
    synonyms: Mapped[List["HerbSynonym"]] = relationship(back_populates="herb", cascade="all, delete-orphan")
    interactions: Mapped[List["Interaction"]] = relationship(back_populates="herb")


class HerbSynonym(Base):
    """Every spelling we might see on a label: Sanskrit, Hindi (Devanagari + roman), Latin, English, trade names."""
    __tablename__ = "herb_synonyms"
    id: Mapped[int] = mapped_column(primary_key=True)
    herb_id: Mapped[int] = mapped_column(ForeignKey("herbs.id", ondelete="CASCADE"), index=True)
    term: Mapped[str] = mapped_column(String(128), index=True)
    language: Mapped[Optional[str]] = mapped_column(String(16))
    herb: Mapped[Herb] = relationship(back_populates="synonyms")
    __table_args__ = (UniqueConstraint("herb_id", "term", name="uq_herb_term"),)


class Drug(Base):
    __tablename__ = "drugs"
    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    generic: Mapped[str] = mapped_column(String(128), index=True)
    drug_class: Mapped[str] = mapped_column(String(64), index=True)
    atc_code: Mapped[Optional[str]] = mapped_column(String(16))
    route: Mapped[Optional[str]] = mapped_column(String(32))  # 'oral' matters for timing rules
    brands: Mapped[List["DrugBrand"]] = relationship(back_populates="drug", cascade="all, delete-orphan")


class DrugBrand(Base):
    """Indian brand names -> generic (Thyronorm -> levothyroxine)."""
    __tablename__ = "drug_brands"
    id: Mapped[int] = mapped_column(primary_key=True)
    drug_id: Mapped[int] = mapped_column(ForeignKey("drugs.id", ondelete="CASCADE"), index=True)
    brand: Mapped[str] = mapped_column(String(128), index=True)
    drug: Mapped[Drug] = relationship(back_populates="brands")
    __table_args__ = (UniqueConstraint("drug_id", "brand", name="uq_drug_brand"),)


class Product(Base):
    """Branded Ayurvedic products -> constituent herbs (Chyawanprash maps to several rows)."""
    __tablename__ = "products"
    id: Mapped[int] = mapped_column(primary_key=True)
    brand: Mapped[str] = mapped_column(String(128), index=True)
    manufacturer: Mapped[Optional[str]] = mapped_column(String(128))
    label_text: Mapped[Optional[str]] = mapped_column(Text)
    source_url: Mapped[Optional[str]] = mapped_column(String(512))
    herbs: Mapped[List["ProductHerb"]] = relationship(back_populates="product", cascade="all, delete-orphan")


class ProductHerb(Base):
    __tablename__ = "product_herbs"
    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), index=True)
    herb_id: Mapped[int] = mapped_column(ForeignKey("herbs.id", ondelete="CASCADE"), index=True)
    quantity: Mapped[Optional[str]] = mapped_column(String(64))
    product: Mapped[Product] = relationship(back_populates="herbs")
    herb: Mapped[Herb] = relationship()


class Interaction(Base):
    __tablename__ = "interactions"
    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, index=True)  # stable id shown on cards, e.g. INT-ASHWA-LEVO
    herb_id: Mapped[int] = mapped_column(ForeignKey("herbs.id", ondelete="RESTRICT"), index=True)
    # Exactly one of drug_id / drug_class is set (enforced in seed validation and a DB CHECK in Postgres migration).
    drug_id: Mapped[Optional[int]] = mapped_column(ForeignKey("drugs.id", ondelete="RESTRICT"), index=True, nullable=True)
    drug_class: Mapped[Optional[str]] = mapped_column(String(64), index=True, nullable=True)
    severity: Mapped[str] = mapped_column(String(16))  # minor | moderate | major
    interaction_type: Mapped[str] = mapped_column(String(32), default="pharmacodynamic")  # pharmacodynamic|pharmacokinetic|timing|contamination
    mechanism: Mapped[str] = mapped_column(Text)
    effect: Mapped[str] = mapped_column(Text)
    management: Mapped[str] = mapped_column(Text)
    timing_gap_hours: Mapped[Optional[float]] = mapped_column(nullable=True)
    evidence_grade: Mapped[str] = mapped_column(String(1))  # A | B | C
    population_flags: Mapped[list] = mapped_column(JSON, default=list)
    patient_summary_en: Mapped[Optional[str]] = mapped_column(Text)
    patient_summary_hi: Mapped[Optional[str]] = mapped_column(Text)
    reviewer: Mapped[Optional[str]] = mapped_column(String(128))
    reviewed_on: Mapped[Optional[date]] = mapped_column(Date)
    kb_version: Mapped[str] = mapped_column(String(16))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    herb: Mapped[Herb] = relationship(back_populates="interactions")
    drug: Mapped[Optional[Drug]] = relationship()
    sources: Mapped[List["InteractionSource"]] = relationship(back_populates="interaction", cascade="all, delete-orphan")
    __table_args__ = (Index("ix_interactions_herb_class", "herb_id", "drug_class"), Index("ix_interactions_herb_drug", "herb_id", "drug_id"))


class InteractionSource(Base):
    __tablename__ = "interaction_sources"
    id: Mapped[int] = mapped_column(primary_key=True)
    interaction_id: Mapped[int] = mapped_column(ForeignKey("interactions.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(512))
    source_type: Mapped[str] = mapped_column(String(32))  # rct|review|case_series|monograph|database|regulatory
    doi: Mapped[Optional[str]] = mapped_column(String(128))
    pmid: Mapped[Optional[str]] = mapped_column(String(32))
    url: Mapped[Optional[str]] = mapped_column(String(512))
    year: Mapped[Optional[int]] = mapped_column(Integer)
    # 'verified' only once a team member has opened the DOI/URL and confirmed it. Never shown as verified otherwise.
    verification_status: Mapped[str] = mapped_column(String(16), default="needs_verification")
    interaction: Mapped[Interaction] = relationship(back_populates="sources")
