import {
    useState,
    useEffect
} from "react";

import axiosInstance from "../../../api/axiosInstance";

import Card from "../../common/Card/Card";
import Button from "../../common/Button/Button";

import {
    Plus,
    Trash2,
    Wrench,
    IndianRupee,
    FileText
} from "lucide-react";

import { useTheme } from "../../../context/ThemeContext";

const VendorServices = () => {

    const theme = useTheme();

    const [
        services,
        setServices
    ] = useState([]);

    const [
        serviceName,
        setServiceName
    ] = useState("");

    const [
        description,
        setDescription
    ] = useState("");

    const [
        price,
        setPrice
    ] = useState("");

    const [
        loading,
        setLoading
    ] = useState(false);

    const [
        error,
        setError
    ] = useState("");

    const [
        success,
        setSuccess
    ] = useState("");

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {

        try {

            const response =
                await axiosInstance.get(
                    "/vendors/service"
                );

            const payload =
                response.data?.data ||
                response.data;

            setServices(
                payload?.services || []
            );

        } catch (error) {

            console.log(
                "Service fetch failed",
                error
            );

        }

    };

    const validate = () => {

        if (!serviceName.trim()) {
            return "Service name required";
        }

        if (
            price &&
            Number(price) < 0
        ) {
            return "Price cannot be negative";
        }

        if (
            price &&
            Number(price) < 500
        ) {
            return "Minimum price ₹500";
        }

        return "";
    };

    const addService = async () => {

        setError("");
        setSuccess("");

        const validation =
            validate();

        if (validation) {

            setError(validation);

            return;
        }

        try {

            setLoading(true);

            await axiosInstance.post(
                "/vendors/service",
                {
                    service_name:
                        serviceName.trim(),

                    description:
                        description.trim(),

                    price:
                        price
                            ? Number(price)
                            : null
                }
            );

            setSuccess(
                "Service added successfully"
            );

            setServiceName("");
            setDescription("");
            setPrice("");

            fetchServices();

        } catch (error) {

            setError(
                error?.response?.data?.message ||
                error?.response?.data?.detail ||
                "Unable to add service"
            );

        } finally {

            setLoading(false);

        }

    };

    const deleteService = async (
        serviceId
    ) => {

        try {

            await axiosInstance.delete(
                `/vendors/service/${serviceId}`
            );

            fetchServices();

        } catch (error) {

            console.log(error);

        }

    };

    return (

        <Card>

            {/* Header */}

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    marginBottom: "24px"
                }}
            >

                <div
                    style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "16px",
                        background:
                            "rgba(124,90,246,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <Wrench
                        size={22}
                        color="#7C5AF6"
                    />
                </div>

                <div>

                    <p
                        style={{
                            textTransform:
                                "uppercase",
                            letterSpacing: "1.5px",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#7C5AF6",
                            marginBottom: "4px"
                        }}
                    >
                        Service Management
                    </p>

                    <h2
                        style={{
                            fontSize: "clamp(18px, 4vw, 28px)",
                            fontWeight: 700,
                            color:
                                theme.textPrimary
                        }}
                    >
                        Manage Services
                    </h2>

                </div>

            </div>

            {/* Form */}

            <div
                className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    md:grid-cols-3
                    gap-4
                    mb-5
                "
            >

                <div
                    style={{
                        position: "relative"
                    }}
                >

                    <Wrench
                        size={18}
                        style={{
                            position:
                                "absolute",
                            left: "14px",
                            top: "50%",
                            transform:
                                "translateY(-50%)",
                            color:
                                theme.textMuted
                        }}
                    />

                    <input
                        placeholder="Service Name"
                        value={serviceName}
                        onChange={(event) =>
                            setServiceName(
                                event.target.value
                            )
                        }
                        style={{
                            width: "100%",
                            padding:
                                "14px 14px 14px 44px",
                            background:
                                theme.panelBg,
                            border:
                                `1px solid ${theme.cardBorder}`,
                            borderRadius:
                                "14px",
                            color:
                                theme.textPrimary
                        }}
                    />

                </div>

                <div
                    style={{
                        position: "relative"
                    }}
                >

                    <FileText
                        size={18}
                        style={{
                            position:
                                "absolute",
                            left: "14px",
                            top: "50%",
                            transform:
                                "translateY(-50%)",
                            color:
                                theme.textMuted
                        }}
                    />

                    <input
                        placeholder="Description"
                        value={description}
                        onChange={(event) =>
                            setDescription(
                                event.target.value
                            )
                        }
                        style={{
                            width: "100%",
                            padding:
                                "14px 14px 14px 44px",
                            background:
                                theme.panelBg,
                            border:
                                `1px solid ${theme.cardBorder}`,
                            borderRadius:
                                "14px",
                            color:
                                theme.textPrimary
                        }}
                    />

                </div>

                <div
                    style={{
                        position: "relative"
                    }}
                >

                    <IndianRupee
                        size={18}
                        style={{
                            position:
                                "absolute",
                            left: "14px",
                            top: "50%",
                            transform:
                                "translateY(-50%)",
                            color:
                                theme.textMuted
                        }}
                    />

                    <input
                        type="number"
                        min="500"
                        placeholder="Price"
                        value={price}
                        onChange={(event) =>
                            setPrice(
                                event.target.value
                            )
                        }
                        style={{
                            width: "100%",
                            padding:
                                "14px 14px 14px 44px",
                            background:
                                theme.panelBg,
                            border:
                                `1px solid ${theme.cardBorder}`,
                            borderRadius:
                                "14px",
                            color:
                                theme.textPrimary
                        }}
                    />

                </div>

            </div>

            {/* Alerts */}

            {error && (

                <div
                    style={{
                        background:
                            "rgba(239,68,68,0.12)",
                        color: "#EF4444",
                        border:
                            "1px solid rgba(239,68,68,0.25)",
                        padding: "12px",
                        borderRadius: "12px",
                        marginBottom: "16px"
                    }}
                >
                    {error}
                </div>

            )}

            {success && (

                <div
                    style={{
                        background:
                            "rgba(34,197,94,0.12)",
                        color: "#22C55E",
                        border:
                            "1px solid rgba(34,197,94,0.25)",
                        padding: "12px",
                        borderRadius: "12px",
                        marginBottom: "16px"
                    }}
                >
                    {success}
                </div>

            )}

            <Button
                onClick={addService}
                disabled={loading}
                icon={<Plus />}
            >
                {
                    loading
                        ? "Adding..."
                        : "Add Service"
                }
            </Button>

            {/* Services List */}

            <div
                className="
                    mt-6
                    space-y-4
                "
            >

                {!services.length && (

                    <p
                        style={{
                            color:
                                theme.textMuted
                        }}
                    >
                        No services added yet
                    </p>

                )}

                {services.map(service => (

                    <div
                        key={
                            service.service_id
                        }
                        style={{
                            background:
                                theme.panelBg,
                            border:
                                `1px solid ${theme.cardBorder}`,
                            borderRadius:
                                "20px",
                            padding: "20px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "12px"
                        }}
                    >

                        <div>

                            <h3
                                style={{
                                    fontWeight: 700,
                                    color:
                                        theme.textPrimary,
                                    marginBottom:
                                        "6px",
                                    wordBreak: "break-word"
                                }}
                            >
                                {
                                    service.service_name
                                }
                            </h3>

                            <p
                                style={{
                                    color:
                                        theme.textMuted,
                                    marginBottom:
                                        "8px"
                                }}
                            >
                                {
                                    service.description ||
                                    "No description"
                                }
                            </p>

                            <p
                                style={{
                                    fontWeight: 600,
                                    color:
                                        "#7C5AF6"
                                }}
                            >
                                ₹
                                {
                                    service.price ||
                                    0
                                }
                            </p>

                        </div>

                        <button
                            onClick={() =>
                                deleteService(
                                    service.service_id
                                )
                            }
                            style={{
                                width: "44px",
                                height: "44px",
                                borderRadius:
                                    "12px",
                                border: "none",
                                background:
                                    "rgba(239,68,68,0.12)",
                                color:
                                    "#EF4444",
                                cursor:
                                    "pointer",
                                display: "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "center"
                            }}
                        >
                            <Trash2
                                size={18}
                            />
                        </button>

                    </div>

                ))}

            </div>

        </Card>

    );

};

export default VendorServices;