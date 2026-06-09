import sys
import os

# ----------------------------------
# PROJECT PATH
# ----------------------------------

sys.path.insert(
    0,
    os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            ".."
        )
    )
)

from app.ai.query_preprocessor import QueryPreprocessor
from app.ai.query_parser import QueryParser
from app.ai.query_transformer import QueryTransformer
from app.ai.intent_extractor import IntentExtractor
from app.ai.query_validator import QueryValidator


# ==================================================
# PREPROCESSOR TESTS
# ==================================================

def test_budget_normalization():

    result = QueryPreprocessor.preprocess(
        "Need catering under 1 lakh"
    )

    assert "100000" in result


def test_city_normalization():

    result = QueryPreprocessor.preprocess(
        "Need vendors in New Delhi"
    )

    assert "delhi" in result


def test_category_normalization():

    result = QueryPreprocessor.preprocess(
        "Need caterers"
    )

    assert "catering" in result


# ==================================================
# QUERY PARSER TESTS
# ==================================================

def test_full_filter_extraction():

    filters = QueryParser.extract_filters(
        "Need catering vendors in Delhi under 1 lakh for 100 guests"
    )

    assert filters["category"] == "catering"
    assert filters["city"] == "delhi"
    assert filters["budget"] == 100000
    assert filters["guest_count"] == 100


def test_photography_extraction():

    filters = QueryParser.extract_filters(
        "Need photographers in Noida under 50k"
    )

    assert filters["category"] == "photography"
    assert filters["city"] == "noida"
    assert filters["budget"] == 50000


def test_event_extraction():

    filters = QueryParser.extract_filters(
        "Need catering for wedding in Delhi"
    )

    assert filters["event_type"] == "wedding"


# ==================================================
# INTENT EXTRACTION TESTS
# ==================================================

def test_comparison_intent():

    result = IntentExtractor.extract(
        "Compare Elite Catering vs Budget Catering"
    )

    assert result["intent"] == "comparison_query"


def test_vendor_recommendation_intent():

    result = IntentExtractor.extract(
        "Need catering vendors in Delhi"
    )

    assert result["intent"] == "vendor_recommendation"


# ==================================================
# VALIDATION TESTS
# ==================================================

def test_negative_budget_validation():

    result = QueryValidator.validate(
        "vendor_recommendation",
        {
            "category": "catering",
            "city": "delhi",
            "budget": -5000,
            "guest_count": 100,
            "event_type": "wedding"
        }
    )

    assert result["is_valid"] is False
    assert len(result["errors"]) > 0


def test_zero_budget_validation():

    result = QueryValidator.validate(
        "vendor_recommendation",
        {
            "category": "catering",
            "city": "delhi",
            "budget": 0,
            "guest_count": 100,
            "event_type": "wedding"
        }
    )

    assert result["is_valid"] is False


def test_negative_guest_validation():

    result = QueryValidator.validate(
        "vendor_recommendation",
        {
            "category": "catering",
            "city": "delhi",
            "budget": 100000,
            "guest_count": -10,
            "event_type": "wedding"
        }
    )

    assert result["is_valid"] is False


def test_zero_guest_validation():

    result = QueryValidator.validate(
        "vendor_recommendation",
        {
            "category": "catering",
            "city": "delhi",
            "budget": 100000,
            "guest_count": 0,
            "event_type": "wedding"
        }
    )

    assert result["is_valid"] is False


# ==================================================
# SEARCH PAYLOAD TESTS
# ==================================================

def test_search_payload_creation():

    payload = QueryTransformer.build_search_payload(
        {
            "category": "catering",
            "city": "delhi",
            "budget": 100000,
            "guest_count": 100,
            "event_type": "wedding"
        }
    )

    assert payload["category"] == "catering"
    assert payload["city"] == "delhi"
    assert payload["max_budget"] == 100000
    assert payload["guest_count"] == 100
    assert payload["search_mode"] == "ai"


def test_comparison_payload():

    payload = QueryTransformer.build_search_payload(
        {
            "comparison_request": True
        }
    )

    assert payload["search_mode"] == "comparison"


# ==================================================
# EDGE CASE TESTS
# ==================================================

def test_empty_query():

    result = QueryPreprocessor.preprocess(
        ""
    )

    assert result == ""


def test_generic_query():

    result = IntentExtractor.extract(
        "hello"
    )

    assert result["intent"] == "generic_platform_query"