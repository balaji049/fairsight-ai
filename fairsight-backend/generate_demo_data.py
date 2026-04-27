"""
generate_demo_data.py
Run: python generate_demo_data.py
Outputs: demo_loan_dataset.csv  (500 rows, clear bias baked in)
"""

import pandas as pd
import numpy as np

np.random.seed(42)
N = 500

# ── Base features ────────────────────────────────────────────────────────────
genders    = np.random.choice(["Male", "Female"], N, p=[0.55, 0.45])
states     = np.random.choice(
    ["Urban (MH/KA/DL)", "Urban (MH/KA/DL)", "Rural (UP/Bihar)", "Rural (UP/Bihar)", "Rural (NE/Odisha)"],
    N
)
incomes    = np.random.choice(["Low", "Medium", "High"], N, p=[0.40, 0.40, 0.20])
castes     = np.random.choice(["General", "OBC", "SC", "ST"], N, p=[0.30, 0.40, 0.20, 0.10])
languages  = np.random.choice(["English", "Hindi", "Regional"], N, p=[0.25, 0.45, 0.30])

# ── Base approval probability ─────────────────────────────────────────────────
base_prob = np.full(N, 0.65)

# Gender bias: women approved ~55% less
base_prob[genders == "Female"] *= 0.45

# State bias: rural approved ~40% less
base_prob[states == "Rural (UP/Bihar)"]  *= 0.62
base_prob[states == "Rural (NE/Odisha)"] *= 0.50

# Income: low income much less likely
base_prob[incomes == "Low"]    *= 0.55
base_prob[incomes == "Medium"] *= 0.85

# Caste bias: SC/ST approved ~50% less
base_prob[castes == "SC"] *= 0.52
base_prob[castes == "ST"] *= 0.45
base_prob[castes == "OBC"] *= 0.78

# Language bias: regional language speakers approved less
base_prob[languages == "Regional"] *= 0.70

# Clip to valid probability range
base_prob = np.clip(base_prob, 0.05, 0.98)

# Generate binary outcome
approved = np.random.binomial(1, base_prob)

# Rename state column to match expected axis name
state_type = pd.Series(states).map({
    "Urban (MH/KA/DL)":  "Urban",
    "Rural (UP/Bihar)":   "Rural",
    "Rural (NE/Odisha)":  "Remote",
})

df = pd.DataFrame({
    "gender":           genders,
    "state_type":       state_type,
    "income_bracket":   incomes,
    "caste_category":   castes,
    "language":         languages,
    "loan_amount":      np.random.randint(50000, 2000000, N),
    "credit_score":     np.random.randint(580, 800, N),
    "approved":         approved,
})

df.to_csv("demo_loan_dataset.csv", index=False)

# Print summary so you can verify the bias is visible
print("=== Demo Dataset Generated ===")
print(f"Total rows: {len(df)}")
print(f"Overall approval rate: {df.approved.mean():.1%}\n")

for col in ["gender", "state_type", "income_bracket", "caste_category", "language"]:
    print(f"── {col} ──")
    rates = df.groupby(col)["approved"].mean().sort_values()
    for group, rate in rates.items():
        bar = "█" * int(rate * 30)
        print(f"  {group:20s} {rate:.1%}  {bar}")
    print()

print("Saved: demo_loan_dataset.csv")
print("Upload this file to FairSight AI to see the bias heatmap in action.")
