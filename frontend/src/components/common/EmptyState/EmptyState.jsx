import {

SearchX,
Sparkles,
RefreshCcw

} from "lucide-react";


const EmptyState=({

title="No Data Found",
message="Nothing available right now.",
buttonText,
onClick

})=>{

return(

<div

className="

relative

overflow-hidden

bg-white

border

border-slate-200

rounded-[32px]

shadow-sm

min-h-[360px]

flex

flex-col

items-center

justify-center

text-center

px-10

py-14

"

>

{/* PREMIUM GLOW */}

<div

className="

absolute

-top-20

-right-20

h-72

w-72

bg-indigo-100

rounded-full

blur-3xl

opacity-70

"

/>


{/* ICON */}

<div

className="

relative

mb-8

"

>

<div

className="

absolute

inset-0

bg-indigo-200

blur-2xl

rounded-full

opacity-60

"

/>


<div

className="

relative

h-24

w-24

rounded-full

bg-gradient-to-br

from-indigo-100

to-purple-100

flex

items-center

justify-center

border

border-indigo-100

"

>

<SearchX

size={38}

className="

text-indigo-600

"

/>

</div>

</div>


{/* LABEL */}

<div

className="

flex

items-center

gap-2

mb-4

"

>

<Sparkles

size={16}

className="

text-indigo-500

"

/>

<p

className="

uppercase

tracking-[3px]

text-xs

font-semibold

text-indigo-600

"

>

Enterprise Insights

</p>

</div>


{/* TITLE */}

<h2

className="

text-3xl

font-bold

text-slate-800

mb-4

"

>

{

title

}

</h2>


{/* MESSAGE */}

<p

className="

max-w-lg

leading-8

text-slate-500

mb-8

"

>

{

message

}

</p>


{/* BUTTON */}

{

buttonText&&(

<button

onClick={onClick}

className="

flex

items-center

gap-2

px-7

py-3

rounded-2xl

bg-indigo-600

hover:bg-indigo-700

text-white

font-semibold

transition-all

duration-300

shadow-lg

shadow-indigo-200

hover:scale-[1.02]

"

>

<RefreshCcw

size={16}

/>

{

buttonText

}

</button>

)

}

</div>

);

};

export default EmptyState;