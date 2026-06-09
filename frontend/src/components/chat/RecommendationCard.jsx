import React, {
    memo
} from "react";

function RecommendationCard({

    vendor

}) {

    const name =

        vendor?.vendor_name

        ||

        "Unknown Vendor";

    const city =

        vendor?.city

        ||

        "Location unavailable";

    const category =

        vendor?.category

        ||

        "General";

    const rating =

        typeof vendor?.rating

        ===

        "number"

            ?

            vendor.rating.toFixed(

                1

            )

            :

            "N/A";

    const reviewCount =

        vendor?.review_count

        ??

        0;

    const description =

        vendor?.vendor_description?.trim()

        ||

        "";

    const recommendationReason =

        vendor?.recommendation_reason

        ||

        "Recommended based on your requirements";

    const matchScore =
        vendor?.match_score
        ??
        0;

    const featuredBadge =

        vendor?.featured_badge

        ||

        null;

    const hasPricing = (

        vendor?.price_min

        !=

        null

        &&

        vendor?.price_max

        !=

        null

    );

    const pricing =

        hasPricing

            ?

            `₹${vendor.price_min.toLocaleString()} - ₹${vendor.price_max.toLocaleString()}`

            :

            "Pricing unavailable";

    const rawServices =

        Array.isArray(

            vendor?.services

        )

            ?

            vendor.services

            :

            [];

    const categoryServices =

        rawServices.flatMap(

            item => {

                if (

                    typeof item === "string"

                ) {

                    return [

                        item

                    ];

                }

                if (

                    item?.services

                    &&

                    Array.isArray(

                        item.services

                    )

                ) {

                    return item.services;

                }

                return [];

            }

        );

    const services = [

        ...new Set(

            categoryServices.filter(

                Boolean

            )

        )

    ];

    return (

        <div

            className="

            border
            rounded-2xl
            p-4
            bg-white
            shadow-sm
            hover:shadow-md
            transition-all
            duration-200
            mb-3

            "

        >

            <div

                className="

                flex
                justify-between
                items-start
                gap-4

                "

            >

                <div

                    className="

                    min-w-0

                    "

                >

                    <h3

                        className="

                        font-semibold
                        text-lg
                        truncate
                        text-gray-900

                        "

                        title={name}

                    >

                        {name}

                    </h3>

                    <p

                        className="

                        text-sm
                        text-gray-500
                        truncate

                        "

                    >

                        📍 {city}

                    </p>

                    <p

                        className="

                        text-xs
                        text-blue-600
                        font-medium
                        mt-1

                        "

                    >

                        {category}

                    </p>

                </div>

                <div

                    className="

                    text-right

                    "

                >

                    <div

                        className="

                        text-yellow-500
                        font-medium
                        text-sm

                        "

                    >

                        ⭐ {rating}

                    </div>

                    <div

                        className="

                        text-xs
                        text-gray-500

                        "

                    >

                        {reviewCount} reviews

                    </div>

                </div>

            </div>

            {

                featuredBadge

                &&

                (

                    <div

                        className="

                        mt-2
                        inline-block
                        px-3
                        py-1
                        rounded-full
                        bg-yellow-100
                        text-yellow-800
                        text-xs
                        font-semibold

                        "

                    >

                        🏆 {featuredBadge}

                    </div>

                )

            }

            {

                description

                &&

                (

                    <p

                        className="

                        mt-3
                        text-sm
                        text-gray-700
                        leading-relaxed

                        "

                    >

                        {description}

                    </p>

                )

            }

            {

                services.length > 0

                &&

                (

                    <div

                        className="

                        mt-4

                        "

                    >

                        <p

                            className="

                            text-sm
                            font-medium
                            text-gray-800
                            mb-2

                            "

                        >

                            Services

                        </p>

                        <div

                            className="

                            flex
                            flex-wrap
                            gap-2

                            "

                        >

                            {

                                services.map(

                                    (

                                        service,

                                        index

                                    ) => (

                                        <span

                                            key={`${service}-${index}`}

                                            className="

                                            px-3
                                            py-1
                                            rounded-full
                                            bg-blue-50
                                            text-blue-700
                                            text-xs
                                            font-medium

                                            "

                                        >

                                            {service}

                                        </span>

                                    )

                                )

                            }

                        </div>

                    </div>

                )

            }

            <div

                className="

                mt-4
                pt-3
                border-t
                space-y-2

                "

            >

                <p

                    className="

                    font-semibold
                    text-blue-700

                    "

                >

                    {pricing}

                </p>

                <div

                    className="

                    text-sm
                    text-green-700

                    "

                >

                    Match Score: {matchScore}%

                </div>

                <div

                    className="

                    text-sm
                    text-gray-700
                    italic

                    "

                >

                    {recommendationReason}

                </div>

            </div>

        </div>

    );

}

export default memo(

    RecommendationCard

);