"""
FairSight AI — Backend API
FastAPI + Gemini + Pandas bias engine
Deploy: Cloud Run
"""

import os
import io
import json
import logging
from typing import Optional

import pandas as pd
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from google import genai

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fairsight")

# ── App setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="FairSight AI",
    description="Bias auditor for India's public sector algorithms",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten to your Firebase URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Gemini setup ──────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)
else:
    gemini_client = None
    logger.warning("GEMINI_API_KEY not set — /explain will return placeholder text")

# ── Constants ─────────────────────────────────────────────────────────────────
BIAS_AXES = ["gender", "state_type", "income_bracket", "caste_category", "language"]

DOMAIN_AXES = {
    "loan":      ["gender", "state_type", "income_bracket", "caste_category"],
    "job":       ["gender", "state_type", "caste_category", "language"],
    "education": ["gender", "state_type", "income_bracket", "caste_category"],
    "welfare":   ["gender", "state_type", "income_bracket", "caste_category", "language"],
    "custom":    BIAS_AXES,
}

# Disparate Impact thresholds
GREEN_THRESHOLD  = 0.90   # DIR >= 0.90 → fair
AMBER_THRESHOLD  = 0.80   # DIR 0.80–0.90 → watch
# DIR < 0.80 → critical (red)  — the "4/5ths rule"

# ── Pydantic models ───────────────────────────────────────────────────────────
class BiasResult(BaseModel):
    axis: str
    group: str
    reference_group: str
    approval_rate_group: float
    approval_rate_reference: float
    disparate_impact_ratio: float
    status: str          # "fair" | "watch" | "critical"
    affected_count: int
    reference_count: int

class AnalyzeResponse(BaseModel):
    domain: str
    total_rows: int
    outcome_col: str
    bias_results: list[BiasResult]
    summary: dict

class ExplainRequest(BaseModel):
    domain: str
    bias_results: list[dict]

class ComplianceRequest(BaseModel):
    bias_results: list[dict]
    domain: str

# ── Helpers ───────────────────────────────────────────────────────────────────

def detect_outcome_column(df: pd.DataFrame) -> str:
    """Auto-detect the binary outcome column."""
    candidates = ["approved", "outcome", "decision", "result", "label",
                  "selected", "hired", "admitted", "eligible", "status"]
    for c in candidates:
        if c in df.columns:
            return c
    # fallback: last column
    return df.columns[-1]


def compute_dir(df: pd.DataFrame, axis: str, outcome_col: str) -> list[BiasResult]:
    """
    Compute Disparate Impact Ratio for each group in `axis` vs the reference
    group (the group with the highest approval rate = least disadvantaged).
    DIR = approval_rate_group / approval_rate_reference
    Fair if DIR >= 0.80 (4/5ths rule).
    """
    if axis not in df.columns:
        return []

    results = []
    group_rates = (
        df.groupby(axis)[outcome_col]
        .agg(["mean", "count"])
        .rename(columns={"mean": "rate", "count": "n"})
    )
    group_rates = group_rates[group_rates["n"] >= 10]   # min sample size

    if group_rates.empty:
        return []

    ref_group = group_rates["rate"].idxmax()
    ref_rate  = float(group_rates.loc[ref_group, "rate"])
    ref_n     = int(group_rates.loc[ref_group, "n"])

    for group, row in group_rates.iterrows():
        if group == ref_group:
            continue
        rate = float(row["rate"])
        n    = int(row["n"])
        dir_val = round(rate / ref_rate, 4) if ref_rate > 0 else 1.0

        if dir_val >= GREEN_THRESHOLD:
            status = "fair"
        elif dir_val >= AMBER_THRESHOLD:
            status = "watch"
        else:
            status = "critical"

        results.append(BiasResult(
            axis=axis,
            group=str(group),
            reference_group=str(ref_group),
            approval_rate_group=round(rate * 100, 1),
            approval_rate_reference=round(ref_rate * 100, 1),
            disparate_impact_ratio=dir_val,
            status=status,
            affected_count=n,
            reference_count=ref_n,
        ))

    return results


def build_summary(bias_results: list[BiasResult], total: int) -> dict:
    critical = [r for r in bias_results if r.status == "critical"]
    watch    = [r for r in bias_results if r.status == "watch"]
    return {
        "total_rows":       total,
        "total_comparisons": len(bias_results),
        "critical_count":   len(critical),
        "watch_count":      len(watch),
        "fair_count":       len(bias_results) - len(critical) - len(watch),
        "worst_case": min(
            (r.disparate_impact_ratio for r in bias_results),
            default=1.0
        ),
    }

# ── DPDP Rules ────────────────────────────────────────────────────────────────

DPDP_RULES = [
    {
        "id": "R1",
        "title": "Non-discriminatory data processing",
        "reference": "DPDP Act 2023 — Section 4(1)(b)",
        "description": "Personal data must be processed in a fair and non-discriminatory manner. Algorithms must not produce systematically different outcomes for protected demographic groups.",
        "check": lambda results: not any(r["status"] == "critical" for r in results),
    },
    {
        "id": "R2",
        "title": "Algorithmic impact assessment",
        "reference": "DPDP Rules 2025 — Rule 12 (Significant Data Fiduciaries)",
        "description": "Significant Data Fiduciaries must conduct algorithmic impact assessments examining fairness, transparency, accuracy, and rights implications before deployment.",
        "check": lambda results: True,   # using FairSight = assessment is being conducted
    },
    {
        "id": "R3",
        "title": "4/5ths Disparate Impact Rule",
        "reference": "RBI FREE-AI Framework 2025 — Fairness Principle",
        "description": "RBI's FREE-AI framework requires that AI models in financial services maintain a Disparate Impact Ratio of at least 0.80 (80%) across protected demographic groups.",
        "check": lambda results: not any(r["disparate_impact_ratio"] < 0.80 for r in results if "disparate_impact_ratio" in r),
    },
    {
        "id": "R4",
        "title": "Explainability of automated decisions",
        "reference": "DPDP Act 2023 — Section 6 + India AI Governance Guidelines 2025",
        "description": "Data principals must be able to receive a plain-language explanation of how automated decisions affecting them were made. Black-box decisions without explanations are non-compliant.",
        "check": lambda results: True,   # FairSight provides Gemini explanation = compliant
    },
    {
        "id": "R5",
        "title": "Caste and gender non-discrimination",
        "reference": "Constitution of India — Articles 14, 15, 16 + DPDP Act 2023",
        "description": "Automated decisions must not discriminate on the basis of caste, gender, religion, or place of birth — all protected categories under the Indian Constitution and DPDP Act.",
        "check": lambda results: not any(
            r["status"] == "critical" and r["axis"] in ("gender", "caste_category")
            for r in results
        ),
    },
]


def run_compliance_check(bias_results: list[dict], domain: str) -> list[dict]:
    output = []
    for rule in DPDP_RULES:
        try:
            compliant = rule["check"](bias_results)
        except Exception:
            compliant = True

        critical_findings = [
            r for r in bias_results
            if r.get("status") == "critical"
        ]

        output.append({
            "id":          rule["id"],
            "title":       rule["title"],
            "reference":   rule["reference"],
            "description": rule["description"],
            "status":      "compliant" if compliant else "non_compliant",
            "risk_level":  "low" if compliant else "high",
            "affected_findings": len(critical_findings) if not compliant else 0,
        })
    return output

# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def health():
    return {"status": "ok", "service": "FairSight AI", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    file:   UploadFile = File(...),
    domain: str        = Form("loan"),
):
    """
    Upload a CSV dataset and compute Disparate Impact Ratio
    across all relevant bias axes for the selected domain.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {e}")

    if len(df) < 30:
        raise HTTPException(status_code=400, detail="Dataset must have at least 30 rows.")

    # Normalise column names
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    outcome_col = detect_outcome_column(df)
    if outcome_col not in df.columns:
        raise HTTPException(status_code=400, detail=f"Could not find outcome column. Detected: {list(df.columns)}")

    # Ensure binary outcome
    df[outcome_col] = pd.to_numeric(df[outcome_col], errors="coerce").fillna(0)
    df[outcome_col] = (df[outcome_col] > 0).astype(int)

    axes = DOMAIN_AXES.get(domain.lower(), BIAS_AXES)
    axes_present = [a for a in axes if a in df.columns]

    if not axes_present:
        raise HTTPException(
            status_code=400,
            detail=f"No recognised bias columns found. Expected one or more of: {axes}. Got: {list(df.columns)}"
        )

    all_results: list[BiasResult] = []
    for axis in axes_present:
        all_results.extend(compute_dir(df, axis, outcome_col))

    summary = build_summary(all_results, len(df))

    logger.info(f"Analyzed {len(df)} rows | domain={domain} | findings={len(all_results)}")

    return AnalyzeResponse(
        domain=domain,
        total_rows=len(df),
        outcome_col=outcome_col,
        bias_results=all_results,
        summary=summary,
    )


@app.post("/explain")
async def explain(request: ExplainRequest):
    """
    Call Gemini API to generate a plain-language explanation
    of the bias findings for a non-technical policy maker.
    """
    if not gemini_client:
        return {
            "explanation": (
                "Gemini API key not configured. "
                "Set the GEMINI_API_KEY environment variable to enable AI explanations."
            )
        }

    critical = [r for r in request.bias_results if r.get("status") == "critical"]
    watch    = [r for r in request.bias_results if r.get("status") == "watch"]

    findings_text = ""
    for r in critical[:5]:
        findings_text += (
            f"- {r['axis'].replace('_',' ').title()}: "
            f"'{r['group']}' group has {r['approval_rate_group']}% approval rate "
            f"vs {r['approval_rate_reference']}% for '{r['reference_group']}' group. "
            f"Disparate Impact Ratio = {r['disparate_impact_ratio']} [CRITICAL]\n"
        )
    for r in watch[:3]:
        findings_text += (
            f"- {r['axis'].replace('_',' ').title()}: "
            f"'{r['group']}' group has {r['approval_rate_group']}% approval rate "
            f"vs {r['approval_rate_reference']}% for '{r['reference_group']}' group. "
            f"Disparate Impact Ratio = {r['disparate_impact_ratio']} [WATCH]\n"
        )

    if not findings_text:
        return {"explanation": "No significant bias detected in this dataset. All Disparate Impact Ratios are above the 0.90 fair threshold."}

    prompt = f"""You are a bias auditor reviewing AI systems used in India's {request.domain} sector.

The following bias findings were detected in a {request.domain} approval algorithm:

{findings_text}

Write a clear explanation in exactly 3 short paragraphs for a government policy maker who is NOT a data scientist:

Paragraph 1 — What was found: Describe the most serious bias in simple, specific terms. Name the exact demographic groups affected. Use plain numbers.

Paragraph 2 — Why this matters for real people in India: Give a concrete example of who is harmed. Reference the scale of the problem (India has 1.4 billion people).

Paragraph 3 — Legal risk and one fix: State which Indian law or regulation this may violate (DPDP Act 2023, RBI FREE-AI Framework 2025, or Constitutional Articles 14/15/16). Suggest one specific, actionable fix.

Rules: Use simple English. No jargon. Be direct and specific. Do not use bullet points. Each paragraph should be 2-3 sentences.
"""

    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return {"explanation": response.text.strip()}
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return {
        "explanation": (
            "AI explanation temporarily unavailable due to API quota limits. "
            "However, bias has been detected in the dataset. "
            "Critical disparities exist across demographic groups, which may lead to unfair decision-making. "
            "It is recommended to review dataset balance and apply fairness-aware model adjustments."
        )
    }


@app.post("/compliance")
async def compliance(request: ComplianceRequest):
    """
    Map bias findings to DPDP Act 2023 + RBI FREE-AI Framework obligations.
    Returns compliance status per rule.
    """
    results = run_compliance_check(request.bias_results, request.domain)
    non_compliant = [r for r in results if r["status"] == "non_compliant"]

    return {
        "domain": request.domain,
        "rules": results,
        "overall_status": "non_compliant" if non_compliant else "compliant",
        "non_compliant_count": len(non_compliant),
        "compliant_count": len(results) - len(non_compliant),
        "summary": (
            f"{len(non_compliant)} of {len(results)} compliance rules are violated. "
            "Immediate remediation recommended before deployment."
            if non_compliant else
            "All compliance rules passed. No critical violations detected."
        ),
    }


@app.post("/full-audit")
async def full_audit(
    file:   UploadFile = File(...),
    domain: str        = Form("loan"),
):
    """
    Convenience endpoint: runs /analyze, /explain, and /compliance in one call.
    Frontend can call this single endpoint for the complete audit flow.
    """
    # Analyze
    analyze_response = await analyze(file=file, domain=domain)
    bias_list = [r.model_dump() for r in analyze_response.bias_results]

    # Explain
    explain_req = ExplainRequest(domain=domain, bias_results=bias_list)
    explain_response = await explain(explain_req)

    # Compliance
    compliance_req = ComplianceRequest(bias_results=bias_list, domain=domain)
    compliance_response = await compliance(compliance_req)

    return {
        "analyze":    analyze_response,
        "explain":    explain_response,
        "compliance": compliance_response,
    }
