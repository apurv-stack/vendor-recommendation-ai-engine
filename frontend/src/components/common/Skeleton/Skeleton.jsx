import { useTheme } from "../../../context/ThemeContext";

const Skeleton = ({
    height = "24px",
    width = "100%",
    rounded = "16px",
    className = ""
}) => {

    const theme = useTheme();

    return (
        <>
            <div
                className={className}
                style={{
                    position: "relative",
                    overflow: "hidden",

                    width,
                    height,

                    borderRadius: rounded,

                    background: theme.isDark
                        ? "#17172A"
                        : "#F1F5F9",

                    border: `1px solid ${theme.border}`
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: 0,

                        background:
                            theme.isDark
                                ? "linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)"
                                : "linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)",

                        animation: "skeletonShimmer 1.8s infinite"
                    }}
                />
            </div>

            <style>
                {`
                @keyframes skeletonShimmer{
                    0%{
                        transform:translateX(-100%);
                    }
                    100%{
                        transform:translateX(100%);
                    }
                }
                `}
            </style>
        </>
    );
};

export default Skeleton;