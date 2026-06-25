# AI Vendor Discovery & Recommendation Engine: Recommendation & Ranking Engine

This document details the mathematical design, criteria weights, scoring formulas, relevance evaluations, and configuration overrides implemented in the **`RecommendationEngine`**.

---

## 1. Recommendation Pipeline Design
The recommendation engine ranks candidate vendors based on multi-dimensional relevance. Once matching vendors are returned from the database, they are scored using a weighted algorithm.

The system calculates seven sub-scores, applies category-specific weights, adds verification bonuses, and applies availability metrics to generate a final suitability score (0-100%).

[DIAGRAM: Recommendation Scoring Pipeline]

---

## 2. Recommendation Core Formula
The final suitability score for a vendor is computed using a weighted sum of seven sub-scores:

$$\text{Final Score} = \sum (\text{Sub-Score}_i \times \text{Weight}_i)$$

$$\text{Final Score} = (\text{Category} \times W_{cat}) + (\text{Budget} \times W_{bud}) + (\text{Location} \times W_{loc}) + (\text{Rating} \times W_{rat}) + (\text{Reviews} \times W_{rev}) + (\text{Verified} \times W_{ver}) + (\text{Available} \times W_{av})$$

The final score is rounded to the nearest integer and capped at 100%.

---

## 3. Sub-Score Computations

### 1. Category Fit Score (Range: 0 - 100)
Matches the user's requested service category against the vendor's registered category and sub-teams.
* **Synonym Expansion:** Reconciles equivalent terms (e.g. mapping "photo", "videographer", or "photos" to the canonical `'photography'` category).
* **Direct Match:** Returns 100 if the normalized categories match.
* **Partial Match:** Returns 75 if there is a partial string match.
* **Secondary Match:** Returns 60 if the category name matches description keywords.
* **Mismatch:** Returns 0.

### 2. Budget Relevance Score (Range: 0 - 100)
Evaluates pricing compatibility. It is designed to prioritize vendors within budget while allowing slight overshoots:
* **Perfect Match:** If the requested budget falls within the vendor's price range ($Price_{min} \le Budget \le Price_{max}$), returns 100.
* **Affordable Undershoot:** If the vendor's maximum price is below the budget:
  * Within 20% margin: Returns 80.
  * Larger margin: Returns 60.
* **Acceptable Overshoot:** If the vendor's minimum price exceeds the budget:
  * Within 10% overshoot: Returns 70 (shown as premium alternatives).
  * Within 25% overshoot: Returns 40.
  * Within 50% overshoot: Returns 20.
  * Over 50% overshoot: Returns 0.

### 3. Location Score (Range: 0 or 100)
* Returns 100 if the vendor's registered city matches the user's preferred city, otherwise 0.

### 4. Rating Score (Range: 0 - 100)
* Normalizes ratings on a 1-5 scale: $(\text{Average Rating} / 5.0) \times 100$.

### 5. Review Count Score (Range: 10 - 100)
Applies a stepped confidence index based on review count thresholds:
* $\ge 200$ reviews: 100.
* $\ge 100$ reviews: 80.
* $\ge 50$ reviews: 60.
* $\ge 20$ reviews: 40.
* $> 0$ reviews: 20.
* $0$ reviews: 10.

### 6. Verification Score (Range: 0 or 100)
* Returns 100 if the vendor profile is verified, otherwise 0.

### 7. Availability Score (Range: 0 - 100)
* Returns 100 if available, 0 if unavailable, and 50 if unspecified.

---

## 4. Category-Specific Scoring Weights
Scoring weights are dynamically adjusted based on the service category to align with user priorities:

| Category | $W_{cat}$ (Category) | $W_{bud}$ (Budget) | $W_{loc}$ (Location) | $W_{rat}$ (Rating) | $W_{rev}$ (Reviews) | $W_{ver}$ (Verified) | $W_{av}$ (Available) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`default`** | 35% | 20% | 15% | 15% | 10% | 3% | 2% |
| **`photography`**| 25% | 10% | 10% | 30% | 20% | 3% | 2% |
| **`catering`** | 25% | 30% | 10% | 15% | 15% | 3% | 2% |
| **`venue`** | 25% | 20% | 30% | 12% | 8% | 3% | 2% |
| **`decoration`** | 25% | 15% | 10% | 28% | 17% | 3% | 2% |
| **`dj`** | 25% | 15% | 10% | 28% | 17% | 3% | 2% |
| **`entertainment`**| 25% | 12% | 10% | 30% | 18% | 3% | 2% |
| **`music`** | 25% | 12% | 10% | 30% | 18% | 3% | 2% |

*Note: Weights sum to 100% (1.00) in all categories.*

---

## 5. Administrative Config Overrides
Administrators can override scoring weights via the admin dashboard:
* **Weight Overrides:** Custom weights for ratings, reviews, budgets, and availability are fetched from database configuration settings. Categories are normalized before applying overrides.
* **Availability Priority Option:** If enabled, the availability weight is increased to 40% (ranking available vendors first) while reducing rating weights to balance the equation.

---

## 6. Duplicate Filtering
To prevent duplicate listings in recommendation outputs (e.g. when a vendor is linked to multiple sub-teams or matching services):
* **Database Grouping:** SQL queries in `search_vendors` group results by `Vendor.vendor_id` to ensure unique vendor rows are returned.
* **Hierarchical Deduplication:** De-duplicates category-team listings, showing parent company profiles rather than listing individual sub-teams.
