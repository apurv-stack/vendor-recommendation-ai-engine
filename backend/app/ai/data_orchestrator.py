from sqlalchemy.orm import (
    Session
)

from app.repositories import (

    vendor_repository,

    category_repository

)

from app.ai.recommendation_engine import (

    RecommendationEngine

)


class DataOrchestrator:

    MAX_VENDORS = 20

    MAX_CATEGORIES = 10

    LIGHT_INTENTS = {

        "generic_platform_query"

    }

    RECOMMENDATION_INTENTS = {

        "vendor_search",

        "vendor_recommendation",

        "pricing_query",

        "comparison_query",

        "review_query",

        "service_query"

    }

    @staticmethod
    def fetch_context(

        db: Session,

        intent: str,

        filters: dict,

        user_preferences=None

    ):

        if (

            intent

            in

            DataOrchestrator.LIGHT_INTENTS

        ):

            return {

                "intent":

                intent,

                "context": {},

                "recommendations": {}

            }

        handlers = {

            "vendor_search":

            DataOrchestrator.vendor_context,

            "vendor_recommendation":

            DataOrchestrator.vendor_context,

            "pricing_query":

            DataOrchestrator.pricing_context,

            "comparison_query":

            DataOrchestrator.comparison_context,

            "review_query":

            DataOrchestrator.review_context,

            "analytics_query":

            DataOrchestrator.analytics_context,

            "category_query":

            DataOrchestrator.category_context,

            "service_query":

            DataOrchestrator.service_context

        }

        handler=(

            handlers.get(

                intent,

                DataOrchestrator.generic_context

            )

        )

        try:

            raw_context=(

                handler(

                    db,

                    filters

                )

            )

            raw_context["user_preferences"] = user_preferences

        except Exception as e:

            print(

                "ORCHESTRATOR ERROR:",

                str(e)

            )

            raw_context={}

        recommendations={}

        vendors=(

            raw_context.get(

                "vendors",

                []

            )

        )

        if vendors:

            recommendations={

                "vendors":

                vendors

            }

            if (

                intent

                in

                DataOrchestrator.RECOMMENDATION_INTENTS

            ):

                try:

                    ranked=(

                        RecommendationEngine

                        .get_recommendations(

                            db,

                            raw_context,

                            filters

                        )

                    )

                    ranked_vendors=(

                        ranked.get(

                            "recommendations",

                            {}

                        )

                        .get(

                            "vendors",

                            []

                        )

                    )

                    if ranked_vendors:

                        recommendations={

                            "vendors":

                            ranked_vendors

                        }

                except Exception as e:
                    print("RECOMMENDATION ERROR:", str(e))

        print(

            "FOUND VENDORS:",

            len(

                recommendations.get(

                    "vendors",

                    []

                )

            )

        )

        return {

            "intent":

            intent,

            "context":

            raw_context,

            "recommendations":

            recommendations

        }

    @staticmethod
    def vendor_context(
        db,
        filters
    ):
        from app.services.agent_configuration_service import AgentConfigurationService
        try:
            cfg = AgentConfigurationService.get_configuration_by_agent_name(
                db, "discovery_agent"
            )
            max_vendors = cfg.configuration.get("max_results", DataOrchestrator.MAX_VENDORS) if cfg else DataOrchestrator.MAX_VENDORS
        except Exception:
            max_vendors = DataOrchestrator.MAX_VENDORS

        result=(
            vendor_repository
            .search_vendors_ai(
                db,
                filters
            )
        )

        return {
            "vendors":
            result.get(
                "vendors",
                []
            )[
                :max_vendors
            ]
        }

    @staticmethod
    def service_context(

        db,

        filters

    ):
        from app.services.agent_configuration_service import AgentConfigurationService
        try:
            cfg = AgentConfigurationService.get_configuration_by_agent_name(
                db, "discovery_agent"
            )
            max_vendors = cfg.configuration.get("max_results", DataOrchestrator.MAX_VENDORS) if cfg else DataOrchestrator.MAX_VENDORS
        except Exception:
            max_vendors = DataOrchestrator.MAX_VENDORS

        result=(

            vendor_repository

            .search_vendors_ai(

                db,

                filters

            )

        )

        return {

            "vendors":

            result.get(

                "vendors",

                []

            )[

                :max_vendors

            ]

        }
    
    @staticmethod
    def pricing_context(

        db,

        filters

    ):
        from app.services.agent_configuration_service import AgentConfigurationService
        try:
            cfg = AgentConfigurationService.get_configuration_by_agent_name(
                db, "discovery_agent"
            )
            max_vendors = cfg.configuration.get("max_results", DataOrchestrator.MAX_VENDORS) if cfg else DataOrchestrator.MAX_VENDORS
        except Exception:
            max_vendors = DataOrchestrator.MAX_VENDORS

        budget=(

            filters.get(

                "budget"

            )

        )

        if not budget:

            return {}

        vendors=(

            vendor_repository

            .budget_vendors_ai(

                db,

                budget

            )

        )

        return {

            "vendors":

            vendors[

                :max_vendors

            ]

        }

    @staticmethod
    def comparison_context(

        db,

        filters

    ):

        names=(

            filters.get(

                "vendor_names",

                []

            )

        )

        if not names:

            return {}

        return {

            "vendors":

            vendor_repository

            .compare_vendors_ai(

                db,

                names

            )

        }

    @staticmethod
    def review_context(

        db,

        filters

    ):
        from app.services.agent_configuration_service import AgentConfigurationService
        try:
            cfg = AgentConfigurationService.get_configuration_by_agent_name(
                db, "discovery_agent"
            )
            max_vendors = cfg.configuration.get("max_results", DataOrchestrator.MAX_VENDORS) if cfg else DataOrchestrator.MAX_VENDORS
        except Exception:
            max_vendors = DataOrchestrator.MAX_VENDORS

        vendors=(

            vendor_repository

            .top_rated_vendors_ai(

                db

            )

        )

        return {

            "vendors":

            vendors[

                :max_vendors

            ]

        }

    @staticmethod
    def analytics_context(

        db,

        filters

    ):

        return {

            "analytics":

            vendor_repository

            .vendor_analytics_ai(

                db

            )

        }

    @staticmethod
    def category_context(

        db,

        filters

    ):

        return {

            "categories":

            category_repository

            .get_all_categories(

                db

            )[

                :DataOrchestrator.MAX_CATEGORIES

            ]

        }

    @staticmethod
    def generic_context(

        db,

        filters

    ):

        return {}