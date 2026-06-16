import {
    useEffect,
    useState
} from "react";

import MainLayout
from "../../components/layouts/MainLayout/MainLayout";

import VendorCard
from "../../components/vendor/VendorCard/VendorCard";

import Loader
from "../../components/common/Loader/Loader";

import EmptyState
from "../../components/common/EmptyState/EmptyState";

import PageHeader
from "../../components/common/PageHeader/PageHeader";

import Card
from "../../components/common/Card/Card";

import axiosInstance
from "../../api/axiosInstance";

import {
    Sparkles,
    TrendingUp,
    Target
} from "lucide-react";

import {
    useTheme
} from "../../context/ThemeContext";

const RecommendationsPage = () => {

    const theme = useTheme();

    const [
        recommendations,
        setRecommendations
    ] = useState([]);

    const [
        loading,
        setLoading
    ] = useState(true);

    const[
        error,
        setError
    ]=useState("");

    const scoreVendor = (vendor) => {

        const followers =
            Number(
                vendor.followers
            ) || 0;

        const rating =
            Number(
                vendor.avg_rating
            ) || 0;

        const views =
            Number(
                vendor.views
            ) || 0;

        const pricing =
            Math.floor(
                (
                    (
                        Number(
                            vendor.price_min
                        ) || 0
                    ) +
                    (
                        Number(
                            vendor.price_max
                        ) || 0
                    )
                ) / 2
            );

        const aiScore =
            Math.min(
                99,
                Math.floor(
                    rating * 15 +
                    followers * 0.04 +
                    views * 0.02 +
                    (
                        pricing
                            ? 8
                            : 0
                    )
                )
            );

        const budgetMatch =
            Math.min(
                100,
                Math.max(
                    70,
                    90 -
                    Math.floor(
                        pricing / 5000
                    )
                )
            );

        const categoryMatch =
            Math.min(
                100,
                75 +
                Math.floor(
                    rating * 5
                )
            );

        return {
            ...vendor,
            aiScore:
                `${aiScore}%`,
            budgetMatch:
                `${budgetMatch}%`,
            categoryMatch:
                `${categoryMatch}%`
        };

    };

    const fetchRecommendations =
        async () => {

            try {
                setError("");

                setLoading(true);

                const response =
                    await axiosInstance.get(
                        "/vendors/recommendations"
                    );

                const vendors =
                    response.data?.data?.recommendations ||
                    response.data?.recommendations ||
                    [];

                setRecommendations(
                    vendors.map(
                        scoreVendor
                    )
                );

            } catch (error) {

                console.log(
                    "Recommendation failed",
                    error
                );

                setError(

                    error?.response?.data?.detail ||

                    error?.response?.data?.message ||

                    "Failed to load recommendations"

                );

                setRecommendations([]);

            } finally {

                setLoading(false);

            }

        };

    useEffect(() => {

        fetchRecommendations();

    }, []);

    if (loading) {

        return (
            <MainLayout>

                <Loader
                    text="Building AI Recommendations"
                />

            </MainLayout>
        );

    }

    return (

        <MainLayout>

            <div
                className="
                    space-y-8
                "
            >

                <PageHeader
                    title="Smart Recommendations"
                    subtitle="AI vendor intelligence using pricing, category relevance and vendor quality."
                />

                {
                    error
                        ? (

                            <EmptyState
                                title="Unable to Load Recommendations"
                                message={error}
                                buttonText="Refresh"
                                onClick={fetchRecommendations}
                            />

                        )
                        : recommendations.length === 0
                        ? (

                            <EmptyState
                                title="No Recommendations Found"
                                message="AI recommendation engine could not identify vendor matches."
                                buttonText="Refresh"
                                onClick={
                                    fetchRecommendations
                                }
                            />

                        )
                        : (

                            <div
                                className="
                                    grid
                                    xl:grid-cols-3
                                    lg:grid-cols-2
                                    gap-6
                                "
                            >

                                {
                                    recommendations.map(
                                        vendor => (

                                            <div
                                                key={
                                                    vendor.vendor_id
                                                }
                                                className="
                                                    space-y-5
                                                "
                                            >

                                                <Card>

                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent:
                                                                "space-between",
                                                            alignItems:
                                                                "center"
                                                        }}
                                                    >

                                                        <div>

                                                            <div
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap:
                                                                        "8px",
                                                                    color:
                                                                        "#7C5AF6",
                                                                    fontWeight:
                                                                        600,
                                                                    marginBottom:
                                                                        "10px"
                                                                }}
                                                            >

                                                                <Sparkles
                                                                    size={
                                                                        18
                                                                    }
                                                                />

                                                                AI Match

                                                            </div>

                                                            <h2
                                                                style={{
                                                                    fontSize:
                                                                        "22px",
                                                                    fontWeight:
                                                                        700,
                                                                    color:
                                                                        theme.textPrimary
                                                                }}
                                                            >
                                                                {
                                                                    vendor.aiScore
                                                                }
                                                            </h2>

                                                        </div>

                                                        <div
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                flexDirection:
                                                                    "column",
                                                                gap:
                                                                    "12px"
                                                            }}
                                                        >

                                                            <div
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap:
                                                                        "8px",
                                                                    color:
                                                                        theme.textMuted
                                                                }}
                                                            >

                                                                <Target
                                                                    size={
                                                                        18
                                                                    }
                                                                    color="#22C55E"
                                                                />

                                                                {
                                                                    vendor.categoryMatch
                                                                }

                                                                Category

                                                            </div>

                                                            <div
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap:
                                                                        "8px",
                                                                    color:
                                                                        theme.textMuted
                                                                }}
                                                            >

                                                                <TrendingUp
                                                                    size={
                                                                        18
                                                                    }
                                                                    color="#3B82F6"
                                                                />

                                                                {
                                                                    vendor.budgetMatch
                                                                }

                                                                Budget

                                                            </div>

                                                        </div>

                                                    </div>

                                                </Card>

                                                <VendorCard
                                                    vendor={
                                                        vendor
                                                    }
                                                />

                                            </div>

                                        )
                                    )
                                }

                            </div>

                        )
                }

            </div>

        </MainLayout>

    );

};

export default RecommendationsPage;