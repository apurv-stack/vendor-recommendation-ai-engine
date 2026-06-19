import React from "react";
import Card from "../common/Card/Card";
import { useTheme } from "../../context/ThemeContext";

const COLORS = [
  "#7C5AF6", "#3B82F6", "#22C55E", "#F59E0B",
  "#EF4444", "#EC4899", "#14B8A6", "#94A3B8"
];

const TOP_N = 6;

const groupTopN = (entries) => {
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  if (sorted.length <= TOP_N) return sorted;
  const top = sorted.slice(0, TOP_N);
  const othersCount = sorted.slice(TOP_N).reduce((sum, [, c]) => sum + c, 0);
  return [...top, ["Others", othersCount]];
};

const BusinessAnalytics = ({ vendors = [] }) => {
  const theme = useTheme();

  const categoryStats = {};
  const cityStats = {};

  vendors.forEach((vendor) => {
    const cats = vendor.all_categories
      ? vendor.all_categories.split(",").map(c => c.trim()).filter(Boolean)
      : [vendor.category || "Other"];
    cats.forEach(category => {
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });

    const city = vendor.city || "Unknown";
    cityStats[city] = (cityStats[city] || 0) + 1;
  });

  const PRIORITY_CITIES = ["Delhi", "Jaipur", "Noida", "Gurgaon"];

  const buildCityData = (stats, topN = TOP_N) => {
    const priorityEntries = PRIORITY_CITIES
      .filter(city => stats[city])
      .map(city => [city, stats[city]]);

    const priorityNames = new Set(priorityEntries.map(([c]) => c));
    const remaining = Object.entries(stats)
      .filter(([city]) => !priorityNames.has(city))
      .sort((a, b) => b[1] - a[1]);

    const remainingSlots = Math.max(topN - priorityEntries.length, 0);
    const topRemaining = remaining.slice(0, remainingSlots);
    const othersCount = remaining.slice(remainingSlots).reduce((sum, [, c]) => sum + c, 0);

    const result = [...priorityEntries, ...topRemaining];
    if (othersCount > 0) result.push(["Others", othersCount]);
    return result;
  };

  const total = vendors.length || 1;
  const categoryData = groupTopN(Object.entries(categoryStats));
  const cityData = buildCityData(cityStats);
  const maxCityCount = Math.max(...cityData.map(([, c]) => c), 1);

  // Build conic-gradient stops for the donut
  let cumulative = 0;
  const gradientStops = categoryData.map(([, count], i) => {
    const start = (cumulative / total) * 360;
    cumulative += count;
    const end = (cumulative / total) * 360;
    return `${COLORS[i % COLORS.length]} ${start}deg ${end}deg`;
  }).join(", ");

  const cardInner = {
    background: theme.panelBg,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: "16px",
    padding: "20px",
  };

  return (
    <Card>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: theme.textPrimary, margin: "0 0 4px" }}>
          Business Analytics
        </h2>
        <p style={{ fontSize: "12px", color: theme.textMuted, margin: 0 }}>
          Vendor distribution across categories and cities
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "16px"
      }}>

        {/* DONUT — Vendors by Category */}
        <div style={cardInner}>
          <h3 style={{ fontSize: "13px", fontWeight: 600, color: theme.textPrimary, margin: "0 0 18px" }}>
            Vendors by Category
          </h3>

          {categoryData.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>

              {/* Donut */}
              <div style={{
                position: "relative",
                width: "150px",
                height: "150px",
                flexShrink: 0,
                borderRadius: "50%",
                background: `conic-gradient(${gradientStops})`,
              }}>
                <div style={{
                  position: "absolute",
                  top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "94px", height: "94px",
                  borderRadius: "50%",
                  background: theme.panelBg,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: theme.textPrimary }}>
                    {vendors.length}
                  </span>
                  <span style={{ fontSize: "10px", color: theme.textMuted }}>Total</span>
                </div>
              </div>

              {/* Legend */}
              <div style={{ flex: 1, minWidth: "150px" }}>
                {categoryData.map(([category, count], i) => (
                  <div key={category} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "5px 0", fontSize: "12px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{
                        width: "8px", height: "8px", borderRadius: "50%",
                        background: COLORS[i % COLORS.length], flexShrink: 0
                      }} />
                      <span style={{ color: theme.textPrimary, textTransform: "capitalize" }}>
                        {category}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "6px", color: theme.textMuted }}>
                      <strong style={{ color: theme.textPrimary }}>{count}</strong>
                      <span>({((count / total) * 100).toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: theme.textMuted, fontSize: "12px" }}>No category data available</p>
          )}
        </div>

        {/* BAR CHART — Vendors by City */}
        <div style={cardInner}>
          <h3 style={{ fontSize: "13px", fontWeight: 600, color: theme.textPrimary, margin: "0 0 18px" }}>
            Vendors by City
          </h3>

          {cityData.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {cityData.map(([city, count], i) => (
                <div key={city}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    marginBottom: "4px", fontSize: "12px"
                  }}>
                    <span style={{ color: theme.textPrimary }}>{city}</span>
                    <span style={{ color: theme.textMuted }}>
                      <strong style={{ color: theme.textPrimary }}>{count}</strong>{" "}
                      ({((count / total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{
                    width: "100%", height: "8px", borderRadius: "8px",
                    background: theme.cardBorder, overflow: "hidden"
                  }}>
                    <div style={{
                      width: `${(count / maxCityCount) * 100}%`,
                      height: "100%",
                      borderRadius: "8px",
                      background: COLORS[i % COLORS.length],
                      transition: "width 0.3s ease"
                    }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: theme.textMuted, fontSize: "12px" }}>No city data available</p>
          )}
        </div>

      </div>
    </Card>
  );
};

export default BusinessAnalytics;