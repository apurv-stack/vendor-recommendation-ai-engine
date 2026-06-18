import React from "react";
import Card from "../common/Card/Card";

const BusinessAnalytics = ({ vendors = [] }) => {
  // =========================
  // Category Statistics
  // =========================
  const categoryStats = {};

  // =========================
  // City Statistics
  // =========================
  const cityStats = {};

  vendors.forEach((vendor) => {
    const category = vendor.category || "Other";
    const city = vendor.city || "Unknown";

    categoryStats[category] =
      (categoryStats[category] || 0) + 1;

    cityStats[city] =
      (cityStats[city] || 0) + 1;
  });

  const categoryData = Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1]);

  const cityData = Object.entries(cityStats)
    .sort((a, b) => b[1] - a[1]);

  return (
    <Card>
        <div
        style={{
            marginBottom: "20px"
        }}
        >
        <h2
            style={{
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "6px"
            }}
        >
            Business Analytics
        </h2>

        <p
            style={{
                opacity: 0.7,
                fontSize: "14px"
            }}
        >
            Vendor distribution across categories and cities
        </p>
        </div>

        <div
        style={{
            display: "grid",
            gridTemplateColumns:
                "repeat(auto-fit,minmax(280px,1fr))",
            gap: "16px"
        }}
        >
        <Card style={{ padding: "16px" }}>
            <h3
            style={{
                fontSize: "16px",
                fontWeight: 600,
                marginBottom: "16px"
            }}
            >
                Vendors by Category
            </h3>

            {categoryData.length > 0 ? (
            categoryData.map(([category, count]) => (
                <div
                    key={category}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0"
                    }}
                >
                    <span>{category}</span>
                    <strong>{count}</strong>
                </div>
            ))
            ) : (
                <p>No category data available</p>
            )}
        </Card>

      <Card style={{ padding: "16px" }}>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 600,
            marginBottom: "16px"
          }}
        >
          Vendors by City
        </h3>

        {cityData.length > 0 ? (
          cityData.map(([city, count]) => (
            <div
              key={city}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0"
              }}
            >
              <span>{city}</span>
              <strong>{count}</strong>
            </div>
          ))
        ) : (
          <p>No city data available</p>
        )}
      </Card>
    </div>
  </Card>
);
};

export default BusinessAnalytics;