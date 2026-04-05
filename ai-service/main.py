from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
import os
import re

app = FastAPI(title="Netra AI Classification Service")

# Load zero-shot classification model (runs locally, no API needed)
# This model can classify text into ANY categories without training
print("[AI] Loading zero-shot classification model...")
classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli",
    device=-1,  # CPU (use 0 for GPU)
)
print("[AI] Model loaded successfully!")

# Category labels for classification
CATEGORY_LABELS = [
    "animal attack or wildlife incident",
    "crime such as robbery theft murder assault",
    "women safety such as harassment molestation domestic violence",
    "personal safety such as missing person mob violence fraud",
    "road accident or vehicle crash",
    "environmental disaster such as flood earthquake fire cyclone",
]

CATEGORY_MAP = {
    "animal attack or wildlife incident": "animal",
    "crime such as robbery theft murder assault": "crime",
    "women safety such as harassment molestation domestic violence": "women_safety",
    "personal safety such as missing person mob violence fraud": "personal_safety",
    "road accident or vehicle crash": "accident",
    "environmental disaster such as flood earthquake fire cyclone": "environmental",
}

# Sub-category labels per category
SUB_CATEGORY_LABELS = {
    "animal": ["leopard", "tiger", "bear", "snake", "crocodile", "elephant", "monkey", "stray dog", "wild boar", "wolf", "other animal"],
    "crime": ["murder", "robbery", "theft", "snatching", "stabbing", "shooting", "kidnapping", "burglary", "other crime"],
    "women_safety": ["sexual assault", "molestation", "harassment", "acid attack", "domestic violence", "dowry violence", "stalking"],
    "personal_safety": ["missing person", "mob violence", "communal violence", "fraud", "cybercrime"],
    "accident": ["vehicle collision", "hit and run", "bus accident", "truck accident", "train accident", "drowning", "electrocution", "building collapse"],
    "environmental": ["flood", "cyclone", "earthquake", "landslide", "fire", "heatwave", "gas leak", "storm"],
}

SEVERITY_LABELS = ["fatal or death", "serious injury", "minor incident or warning", "sighting or advisory"]
SEVERITY_MAP = {
    "fatal or death": "critical",
    "serious injury": "high",
    "minor incident or warning": "medium",
    "sighting or advisory": "low",
}

# Junk article patterns
JUNK_PATTERNS = [
    r"stock market|sensex|nifty|BSE|NSE|bearish|bullish|portfolio|investor",
    r"cricket|IPL|T20|world cup|football|sports",
    r"film|movie|series|trailer|bollywood|netflix|OTT",
    r"AI.generated|deepfake|fact.check|hoax",
    r"Japan|China|Pakistan|USA|UK|Australia|Thailand|Korea",
    r"Harvard|MIT|Stanford|online course",
    r"Instagram|TikTok|YouTube|selfie",
    r"fashion|lifestyle|recipe|beauty",
]


def is_junk(text: str) -> bool:
    for pattern in JUNK_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False


class ClassifyRequest(BaseModel):
    text: str


class ClassifyResponse(BaseModel):
    category: str
    subCategory: str
    severity: str
    confidence: float
    isJunk: bool


class ValidateRequest(BaseModel):
    title: str
    description: str
    category: str
    media: list = []


class ValidateResponse(BaseModel):
    isValid: bool
    confidence: float
    tags: list
    riskScore: int


class BatchClassifyRequest(BaseModel):
    texts: list[str]


class BatchClassifyResponse(BaseModel):
    results: list[ClassifyResponse]


@app.get("/api/health")
def health():
    return {"status": "ok", "model": "facebook/bart-large-mnli"}


@app.post("/api/classify", response_model=ClassifyResponse)
def classify_text(req: ClassifyRequest):
    text = req.text[:500]  # Limit input length

    # Check junk first
    if is_junk(text):
        return ClassifyResponse(
            category="junk", subCategory="junk", severity="low",
            confidence=0.0, isJunk=True
        )

    # Step 1: Classify main category
    result = classifier(text, CATEGORY_LABELS, multi_label=False)
    top_label = result["labels"][0]
    top_score = result["scores"][0]
    category = CATEGORY_MAP.get(top_label, "crime")

    # Step 2: Classify sub-category
    sub_labels = SUB_CATEGORY_LABELS.get(category, ["other"])
    sub_result = classifier(text, sub_labels, multi_label=False)
    sub_category = sub_result["labels"][0]

    # Step 3: Classify severity
    sev_result = classifier(text, SEVERITY_LABELS, multi_label=False)
    severity = SEVERITY_MAP.get(sev_result["labels"][0], "medium")

    return ClassifyResponse(
        category=category,
        subCategory=sub_category,
        severity=severity,
        confidence=round(top_score, 3),
        isJunk=False,
    )


@app.post("/api/classify/batch", response_model=BatchClassifyResponse)
def batch_classify(req: BatchClassifyRequest):
    results = []
    for text in req.texts[:20]:  # Max 20 per batch
        try:
            result = classify_text(ClassifyRequest(text=text))
            results.append(result)
        except Exception:
            results.append(ClassifyResponse(
                category="crime", subCategory="other",
                severity="medium", confidence=0.0, isJunk=False
            ))
    return BatchClassifyResponse(results=results)


@app.post("/api/validate", response_model=ValidateResponse)
def validate_incident(req: ValidateRequest):
    text = f"{req.title}. {req.description}"[:500]

    # Classify to validate
    result = classifier(text, CATEGORY_LABELS, multi_label=False)
    top_score = result["scores"][0]
    is_valid = top_score > 0.3 and not is_junk(text)

    # Risk score based on severity
    sev_result = classifier(text, SEVERITY_LABELS, multi_label=False)
    severity = SEVERITY_MAP.get(sev_result["labels"][0], "medium")
    risk_map = {"critical": 80, "high": 60, "medium": 40, "low": 20}

    return ValidateResponse(
        isValid=is_valid,
        confidence=round(top_score, 3),
        tags=[result["labels"][0], sev_result["labels"][0]],
        riskScore=risk_map.get(severity, 40),
    )


@app.post("/api/analyze-image")
def analyze_image(req: dict):
    # Placeholder — image analysis needs a vision model
    return {"tags": [], "description": ""}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
