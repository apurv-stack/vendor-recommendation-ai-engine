import { useEffect, useState } from "react";
import MainLayout from "../../components/layouts/MainLayout/MainLayout";
import axiosInstance from "../../api/axiosInstance";
import VendorCard from "../../components/vendor/VendorCard/VendorCard";
import VendorDetails from "../../components/vendor/VendorDetails/VendorDetails";
import Modal from "../../components/common/Modal/Modal";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import PageHeader from "../../components/common/PageHeader/PageHeader";
import Skeleton from "../../components/common/Skeleton/Skeleton";
import Button from "../../components/common/Button/Button";
import { RefreshCw, Bookmark } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const SavedVendorsPage = () => {

    const theme = useTheme();

    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedVendor, setSelectedVendor] = useState(null); // ✅ modal state

    useEffect(() => { fetchSaved(); }, []);

    const fetchSaved = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axiosInstance.get("/vendors/saved");
            setVendors(response.data?.vendors || []);
        } catch (error) {
            console.log(error);
            setError("Unable to load saved vendors");
        } finally {
            setLoading(false);
        }
    };

    // ✅ open modal with vendor data directly — no navigation
    const handleView = async (vendor) => {
        try {
            await axiosInstance.post(`/vendors/${vendor.vendor_id}/view`).catch(() => {});
            setSelectedVendor(vendor);
        } catch (error) {
            console.log(error);
        }
    };

    // ✅ unsave and remove from list
    const handleSave = async (vendor) => {
        try {
            await axiosInstance.delete(`/vendors/${vendor.vendor_id}/save`);
            setVendors(prev => prev.filter(v => v.vendor_id !== vendor.vendor_id));
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6 px-4 sm:px-6 lg:px-8">

                <PageHeader
                    title="Saved Vendors"
                    subtitle={`${vendors.length} bookmarked vendors`}
                />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", color: theme.textMuted, fontWeight: 600 }}>
                        <Bookmark size={18} color="#7C5AF6" />
                        {vendors.length} saved vendors
                    </div>
                    <Button onClick={fetchSaved} fullWidth={false} icon={<RefreshCw size={18} />} style={{ minHeight: "40px" }}>Refresh</Button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton key={index} className="h-[280px] rounded-3xl" />
                        ))}
                    </div>
                ) : error ? (
                    <EmptyState title="Failed Loading Vendors" message={error} />
                ) : vendors.length === 0 ? (
                    <EmptyState
                        title="No Saved Vendors"
                        message="Bookmark vendors to build your shortlist."
                        icon={<Bookmark />}
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {vendors.map(vendor => (
                            <VendorCard
                                key={vendor.vendor_id}
                                vendor={{
                                    ...vendor,
                                    is_saved: true
                                }}
                                onView={handleView}
                                onSave={handleSave}
                            />
                        ))}
                    </div>
                )}

            </div>

            {/* ✅ Modal — same pattern as VendorDetailsPage */}
            <Modal
                isOpen={!!selectedVendor}
                onClose={() => setSelectedVendor(null)}
                title="Vendor Details"
                size="lg"
            >
                {selectedVendor && (
                    <VendorDetails
                        vendor={{
                            ...selectedVendor,
                            is_saved: true
                        }}
                    />
                )}
            </Modal>

        </MainLayout>
    );
};

export default SavedVendorsPage;