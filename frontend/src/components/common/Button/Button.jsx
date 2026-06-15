import { Loader2 } from "lucide-react";

import {

useTheme

} from "../../../context/ThemeContext";


const Button=({

children,
type="button",
onClick,
disabled=false,
loading=false,
variant="primary",
icon=null,
fullWidth=false,
className=""

})=>{

const theme=

useTheme();


const variants={

primary:`

bg-indigo-600

text-white

hover:bg-indigo-700

shadow-lg

shadow-indigo-200

`,

secondary:`

bg-slate-100

text-slate-700

hover:bg-slate-200

border

border-slate-200

`,

danger:`

bg-red-600

text-white

hover:bg-red-700

shadow-lg

shadow-red-100

`,

outline:`

border

border-indigo-200

bg-white

text-indigo-600

hover:bg-indigo-50

`

};


return(

<button

type={type}

onClick={onClick}

disabled={

disabled||

loading

}

className={`

${

fullWidth

?

"w-full"

:

""

}

px-3

py-1.5

rounded-lg

font-medium

text-xs

flex

items-center

justify-center

gap-1.5

transition-all

duration-300

hover:scale-[1.01]

active:scale-[0.98]

disabled:opacity-50

disabled:cursor-not-allowed

${

variants[variant]

}

${className}

`}

>

{

loading

?

(

<Loader2

size={14}

className="

animate-spin

"

/>

)

:

icon

}


<span>

{

children

}

</span>

</button>

);

};

export default Button;