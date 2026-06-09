/** @type {import('tailwindcss').Config} */

export default {

    content:[

        "./index.html",

        "./src/**/*.{js,ts,jsx,tsx}"

    ],

    theme:{

        extend:{

            fontFamily:{

                sans:[

                    "Inter",

                    "sans-serif"

                ],

                heading:[

                    "Sora",

                    "sans-serif"

                ]

            },

            boxShadow:{

                premium:

                "0 20px 50px rgba(0,0,0,0.35)",

                cyan:

                "0 12px 35px rgba(34,211,238,0.12)",

                glass:

                "0 8px 32px rgba(0,0,0,0.28)"

            },

            colors:{

                premium:{

                    bg:"#020617",

                    card:"#0F172A",

                    cyan:"#22D3EE",

                    text:"#F8FAFC",

                    muted:"#94A3B8"

                }

            },

            borderRadius:{

                premium:"32px"

            },

            animation:{

                fade:

                "fadeIn .3s ease",

                modal:

                "modalEnter .25s ease",

                slide:

                "slideUp .4s ease"

            }

        }

    },

    plugins:[]

};

/** @type {import('tailwindcss').Config} */

export default{

content:[

"./index.html",

"./src/**/*.{js,ts,jsx,tsx}"

],

theme:{

extend:{

animation:{

shimmer:

"shimmer 1.8s infinite"

},

keyframes:{

shimmer:{

"100%":{

transform:

"translateX(200%)"

}

}

}

}

},

plugins:[]

};