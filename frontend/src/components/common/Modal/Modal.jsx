import {

X

} from "lucide-react";

import {

useEffect

} from "react";


const Modal=({

isOpen,
onClose,
title,
children,
size="md"

})=>{

useEffect(()=>{

const close=(event)=>{

if(

event.key==="Escape"

){

onClose();

}

};

document.addEventListener(

"keydown",

close

);

return()=>{

document.removeEventListener(

"keydown",

close

);

};

},[onClose]);


if(

!isOpen

){

return null;

}


const sizes={

sm:"max-w-md",

md:"max-w-2xl",

lg:"max-w-3xl",

xl:"max-w-7xl"

};


return(

<div

className="

fixed

inset-0

z-[100]

flex

items-center

justify-center

p-5

"

>

{/* BACKDROP */}

<div

onClick={onClose}

className="

absolute

inset-0

bg-slate-900/40

backdrop-blur-md

animate-[fadeIn_0.2s_ease]

"

/>


{/* MODAL */}

<div

className={`

relative

w-full

${sizes[size]}

bg-white

rounded-[36px]

border

border-slate-200

shadow-[0_25px_70px_rgba(15,23,42,0.18)]

overflow-hidden

animate-[modalEnter_0.25s_ease]

max-h-[88vh]

flex

flex-col

`}

>

{/* PREMIUM GLOW */}

<div

className="

absolute

-top-24

-right-24

h-72

w-72

bg-indigo-100

rounded-full

blur-3xl

opacity-60

"

/>


{/* HEADER */}

<div

className="

relative

flex

justify-between

items-center

px-6

py-4

border-b

border-slate-200

bg-gradient-to-r

from-indigo-50

to-purple-50

"

>

<div>

<p

className="

text-indigo-600

uppercase

tracking-[1.5px]

text-xs

font-semibold

mb-1

"

>

Enterprise View

</p>


<h2

className="

text-xl

font-bold

text-slate-800

"

>

{

title

}

</h2>

</div>


<button

onClick={onClose}

className="

h-9

w-9

rounded-xl

bg-white

border

border-slate-200

flex

items-center

justify-center

hover:bg-slate-100

transition-all

duration-300

hover:scale-105

"

>

<X

size={20}

className="

text-slate-600

"

/>

</button>

</div>


{/* BODY */}

<div

className="

relative

overflow-y-auto

px-5

pt-4

pb-5

bg-gradient-to-br

from-[#FCFCFF]

to-[#F6F8FC]

"

>

{

children

}

</div>

</div>

</div>

);

};

export default Modal;