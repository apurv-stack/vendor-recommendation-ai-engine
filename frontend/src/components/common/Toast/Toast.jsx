import {

CheckCircle,
AlertCircle,
Info,
X

} from "lucide-react";


const Toast=({

message,

type="success",

onClose

})=>{

const variants={

success:{

icon:

<CheckCircle

size={20}

/>,

iconBg:

"bg-emerald-100",

iconColor:

"text-emerald-600",

border:

"border-emerald-100",

bg:

"bg-white"

},

error:{

icon:

<AlertCircle

size={20}

/>,

iconBg:

"bg-red-100",

iconColor:

"text-red-600",

border:

"border-red-100",

bg:

"bg-white"

},

info:{

icon:

<Info

size={20}

/>,

iconBg:

"bg-indigo-100",

iconColor:

"text-indigo-600",

border:

"border-indigo-100",

bg:

"bg-white"

}

};


const style=

variants[type];


return(

<div

className={`

relative

overflow-hidden

flex

items-center

justify-between

gap-4

px-5

py-4

rounded-[24px]

border

${style.border}

${style.bg}

backdrop-blur-xl

shadow-[0_12px_35px_rgba(15,23,42,0.08)]

animate-[slideUp_0.25s_ease]

min-w-[340px]

max-w-[500px]

`}

>

{/* LEFT */}

<div

className="

flex

items-center

gap-4

"

>

<div

className={`

h-11

w-11

rounded-2xl

flex

items-center

justify-center

${style.iconBg}

${style.iconColor}

`}

>

{

style.icon

}

</div>


<div>

<p

className="

font-semibold

text-slate-800

"

>

{

type==="success"

?

"Success"

:

type==="error"

?

"Error"

:

"Information"

}

</p>


<p

className="

text-slate-500

text-sm

leading-6

"

>

{

message

}

</p>

</div>

</div>


{/* CLOSE */}

<button

onClick={onClose}

className="

h-9

w-9

rounded-xl

flex

items-center

justify-center

text-slate-400

hover:bg-slate-100

hover:text-slate-700

transition-all

"

>

<X

size={16}

/>

</button>


{/* TOP ACCENT */}

<div

className={`

absolute

top-0

left-0

h-1

w-full

${

type==="success"

?

"bg-emerald-500"

:

type==="error"

?

"bg-red-500"

:

"bg-indigo-500"

}

`}

/>

</div>

);

};

export default Toast;