import { useTheme } from "../../../context/ThemeContext";

const Loader = ({ text = "Loading..." }) => {

    const theme = useTheme();

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "200px",
                gap: "12px"
            }}
        >

            <div
                style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "999px",
                    border: `3px solid rgba(124,90,246,0.15)`,
                    borderTop: `3px solid #7C5AF6`,
                    animation: "spin 0.75s linear infinite"
                }}
            />

            <p
                style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: theme.textMuted
                }}
            >
                {text}
            </p>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>

        </div>
    );

};

export default Loader;