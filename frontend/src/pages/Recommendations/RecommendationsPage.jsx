import {
    useEffect,
    useState
} from "react";

import MainLayout
from "../../components/layouts/MainLayout/MainLayout";

import Loader
from "../../components/common/Loader/Loader";

import EmptyState
from "../../components/common/EmptyState/EmptyState";

import PageHeader
from "../../components/common/PageHeader/PageHeader";

import RecommendationCard
from "../../components/chat/RecommendationCard";

import axiosInstance
from "../../api/axiosInstance";

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

        const rating = Number(vendor.avg_rating) || 0;
        const followers = Number(vendor.followers) || 0;
        const views = Number(vendor.views) || 0;
        const reviewCount = Number(vendor.review_count) || 0;
        const pricing = Math.floor(
            ((Number(vendor.price_min) || 0) + (Number(vendor.price_max) || 0)) / 2
        );

    //               Score: weighted from real backend fields
        const aiScore = Math.min(99, Math.floor(
            rating * 15 +
            followers * 0.04 +
            views * 0.02 +
            reviewCount * 0.1 +
            (pricing ? 8 : 0)
        ));

    // Budget match: based on real price data
        const budgetMatch = pricing
            ? Math.min(100, Math.max(60, 95 - Math.floor(pricing / 5000)))
            : 70;

    // Category match: based on real rating + review count
        const categoryMatch = Math.min(100, Math.floor(
            rating * 10 + reviewCount * 0.5 + 60
        ));

        return {
            ...vendor,
            aiScore: `${aiScore}%`,
            budgetMatch: `${budgetMatch}%`,
            categoryMatch: `${categoryMatch}%`
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
                     response.data?.vendors ||
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
                    text="Building               Recommendations"
                />

            </MainLayout>
        );

    }

    return (

        <MainLayout>

            <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">

                <PageHeader
                    title="Smart Recommendations"
                    subtitle="AI vendor intelligence using pricing, category relevance and vendor quality."
                    action={
                        <button
                            onClick={fetchRecommendations}
                            className="glass px-4 py-2 rounded-xl flex gap-2 items-center font-semibold text-sm"
                            style={{
                                background: "linear-gradient(135deg, #7c5af6, #a78bfa)",
                                color: "#fff",
                                border: "none",
                                cursor: "pointer"
                            }}
                        >
                            Refresh
                        </button>
                    }
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
                                message="                recommendation engine could not identify vendor matches."
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
                                    grid-cols-1
                                    sm:grid-cols-2
                                    xl:grid-cols-3
                                    gap-4
                                "
                            >
                                {recommendations.map(vendor => (
                                    <RecommendationCard
                                        key={vendor.vendor_id}
                                        vendor={vendor}
                                    />
                                ))}
                            </div>

                        )
                }

            </div>

        </MainLayout>

    );

};

export default RecommendationsPage;