class ContextBuilder:

    MAX_VENDORS=5

    MAX_CATEGORIES=10

    MAX_HISTORY=5

    MAX_VENDOR_MEMORY=3

    @staticmethod
    def _safe(

        value,

        default="N/A"

    ):

        if value is None:

            return default

        if isinstance(

            value,

            str

        ):

            cleaned=value.strip()

            if not cleaned:

                return default

            return cleaned

        return value

    @staticmethod
    def _extract_services(

        vendor

    ):

        payload=[]

        children=getattr(

            vendor,

            "child_vendors",

            []

        )

        for child in children:

            category_name=(

                getattr(

                    child,

                    "name",

                    ""

                )

                or

                ""

            ).strip()

            services=[]

            service_rows=getattr(

                child,

                "services",

                []

            )

            for service in service_rows:

                service_name=(

                    getattr(

                        service,

                        "service_name",

                        None

                    )

                )

                if(

                    service_name

                    and

                    service_name.strip()

                ):

                    services.append(

                        service_name.strip()

                    )

            if(

                category_name

                or

                services

            ):

                payload.append(

                    {

                        "category":

                        category_name,

                        "services":

                        sorted(

                            list(

                                set(

                                    services

                                )

                            )

                        )

                    }

                )

        return payload

    @staticmethod
    def _serialize_vendor(

        vendor

    ):

        rating=getattr(

            vendor,

            "avg_rating",

            0

        )

        return {

            "name":

            ContextBuilder._safe(

                getattr(

                    vendor,

                    "name",

                    None

                )

            ),

            "city":

            ContextBuilder._safe(

                getattr(

                    vendor,

                    "city",

                    None

                )

            ),

            "price_min":

            getattr(

                vendor,

                "price_min",

                0

            ),

            "price_max":

            getattr(

                vendor,

                "price_max",

                0

            ),

            "rating":

            round(

                float(

                    rating

                    or

                    0

                ),

                1

            ),

            "description":

            ContextBuilder._safe(

                getattr(

                    vendor,

                    "description",

                    ""

                )

            ),

            "services":

            ContextBuilder._extract_services(

                vendor

            )

        }

    @staticmethod
    def _trim_history(

        history

    ):

        if not history:

            return []

        return history[

            -ContextBuilder.MAX_HISTORY:

        ]

    @staticmethod
    def _vendor_memory(

        remembered

    ):

        if not remembered:

            return []

        return [

            ContextBuilder._safe(

                getattr(

                    vendor,

                    "name",

                    None

                )

            )

            for vendor

            in remembered[

                :ContextBuilder.MAX_VENDOR_MEMORY

            ]

        ]

    @staticmethod
    def build(
        context:dict,
        history=None,
        filters=None,
        vendor_memory=None,
        config=None
    ):
        cfg = config or {}
        MAX_VENDORS   = cfg.get("max_vendors", ContextBuilder.MAX_VENDORS)
        MAX_HISTORY   = cfg.get("max_history", ContextBuilder.MAX_HISTORY)
        MAX_VENDOR_MEMORY = cfg.get("max_vendor_memory", ContextBuilder.MAX_VENDOR_MEMORY)
        MAX_CATEGORIES = cfg.get("max_categories", ContextBuilder.MAX_CATEGORIES)

        recommendations=(

            context.get(

                "recommendations",

                {}

            )

        )

        vendors=(

            recommendations.get(

                "vendors",

                []

            )

        )[

            :MAX_VENDORS

        ]

        serialized=[

            ContextBuilder._serialize_vendor(

                vendor

            )

            for vendor

            in vendors

        ]

        categories=(

            context
            .get(

                "context",

                {}

            )
            .get(

                "categories",

                []

            )

        )[

            :MAX_CATEGORIES

        ]

        category_names=[

            str(

                getattr(

                    category,

                    "name",

                    category

                )

            )

            for category

            in categories

        ]

        active_filters={

            k:v

            for k,v

            in (

                filters

                or

                {}

            ).items()

            if v is not None

        }

        llm_context={

            "STRICT_DB_RESULTS":

            serialized,

            "AVAILABLE_CATEGORIES":

            category_names,

            "ACTIVE_FILTERS":

            active_filters,

            "RECENT_HISTORY": (
                history[-MAX_HISTORY:] if history else []
            ),

            "VENDOR_MEMORY": (
                [
                    ContextBuilder._safe(getattr(v, "name", None))
                    for v in (vendor_memory or [])[:MAX_VENDOR_MEMORY]
                ]
            ),
            "RULES":[

                "ONLY recommend STRICT_DB_RESULTS",

                "Never invent vendors",

                "Frontend renders cards",

                "Use vendor hierarchy",

                "Use category services",

                "Answer service queries from hierarchy"

            ]

        }

        return str(

            llm_context

        )