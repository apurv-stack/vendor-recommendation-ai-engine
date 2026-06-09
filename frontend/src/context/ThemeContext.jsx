import {

createContext,
useContext

} from "react";

const ThemeContext=

createContext();

export const ThemeProvider=({

children

})=>{

const theme={

colors:{

background:`

bg-gradient-to-br

from-[#F8FAFF]

via-[#F5F7FC]

to-[#EEF2FF]

`,

sidebar:`

bg-white/75

backdrop-blur-2xl

border-r

border-slate-200

shadow-[0_10px_35px_rgba(15,23,42,0.06)]

`,

navbar:`

bg-white/70

backdrop-blur-2xl

border-b

border-slate-200

shadow-sm

`,

card:`

glass

bg-white/75

border

border-white/60

shadow-md

hover:shadow-xl

transition-all

duration-300

`,

input:`

bg-white/80

border

border-slate-200

text-slate-700

placeholder-slate-400

focus:ring-4

focus:ring-indigo-100

focus:border-indigo-500

outline-none

shadow-sm

transition-all

duration-200

`,

primary:`

bg-gradient-to-r

from-indigo-600

to-violet-600

hover:from-indigo-700

hover:to-violet-700

`,

secondary:`

bg-slate-100

hover:bg-slate-200

text-slate-700

`,

success:

"text-emerald-600",

warning:

"text-orange-500",

danger:

"text-red-500",

purple:

"text-violet-600",

accent:

"text-indigo-600",

textPrimary:

"text-slate-900",

textSecondary:

"text-slate-500"

},

radius:{

card:

"rounded-[30px]",

button:

"rounded-2xl",

input:

"rounded-2xl"

},

spacing:{

section:

"px-8 py-8",

cardPadding:

"p-7"

},

shadow:{

premium:`

shadow-[0_20px_50px_rgba(99,102,241,0.10)]

`,

card:`

shadow-[0_10px_30px_rgba(15,23,42,0.08)]

`

},

animation:{

hover:`

hover:-translate-y-1

transition-all

duration-300

`,

button:`

transition-all

duration-200

active:scale-[0.98]

`

}

};

return(

<ThemeContext.Provider

value={theme}

>

{

children

}

</ThemeContext.Provider>

);

};

export const useTheme=()=>{

const context=

useContext(

ThemeContext

);

if(

!context

){

throw new Error(

"useTheme must be used inside ThemeProvider"

);

}

return context;

};