import {

Shield,
Sparkles,
BrainCircuit,
TrendingUp

} from "lucide-react";

const AuthLayout=({

subtitle,
children

})=>{

return(

<div

className="

min-h-screen

relative

overflow-hidden

bg-gradient-to-br

from-[#F8FAFF]

via-[#F5F7FC]

to-[#EEF2FF]

flex

items-center

justify-center

px-6

py-10

"

>

{/* BACKGROUND BLOBS */}

<div

className="

absolute

top-[-120px]

right-[-120px]

h-[380px]

w-[380px]

rounded-full

bg-indigo-300/20

blur-3xl

"

/>

<div

className="

absolute

bottom-[-120px]

left-[-120px]

h-[320px]

w-[320px]

rounded-full

bg-sky-300/20

blur-3xl

"

/>

<div

className="

absolute

top-[40%]

left-[45%]

h-[250px]

w-[250px]

rounded-full

bg-violet-300/10

blur-3xl

"

/>

<div

className="

relative

z-10

grid

lg:grid-cols-2

gap-12

items-center

max-w-7xl

w-full

"

>

{/* LEFT */}

<div

className="hidden lg:block"

>

<p

className="

uppercase

tracking-[4px]

font-semibold

text-indigo-600

mb-5

"

>

Enterprise Intelligence

</p>

<h1

className="

text-6xl

font-bold

leading-tight

text-slate-900

mb-6

"

>

AI Vendor

<span

className="

text-indigo-600

"

>

 Discovery

</span>

Platform

</h1>

<p

className="

text-slate-600

text-lg

leading-8

mb-10

max-w-xl

"

>

Discover vendors,

analyze capabilities,

benchmark pricing

and drive procurement

decisions through

AI-powered intelligence.

</p>

<div

className="space-y-5"

>

<div

className="

glass

rounded-[28px]

p-5

flex

gap-4

items-start

"

>

<div

className="

h-12

w-12

rounded-2xl

bg-indigo-100

flex

items-center

justify-center

"

>

<BrainCircuit

className="

text-indigo-600

"

/>

</div>

<div>

<h3

className="

font-bold

text-lg

mb-1

"

>

AI Recommendations

</h3>

<p

className="

text-slate-500

"

>

Smart vendor suggestions

powered by analytics.

</p>

</div>

</div>

<div

className="

glass

rounded-[28px]

p-5

flex

gap-4

items-start

"

>

<div

className="

h-12

w-12

rounded-2xl

bg-emerald-100

flex

items-center

justify-center

"

>

<TrendingUp

className="

text-emerald-600

"

/>

</div>

<div>

<h3

className="

font-bold

text-lg

mb-1

"

>

Vendor Benchmarking

</h3>

<p

className="

text-slate-500

"

>

Compare pricing,

performance and

engagement metrics.

</p>

</div>

</div>

</div>

</div>

{/* RIGHT */}

<div

className="

glass

rounded-[40px]

shadow-xl

border

border-white/60

p-10

max-w-md

w-full

mx-auto

"

>

<div

className="

flex

justify-center

mb-6

"

>

<div

className="

h-16

w-16

rounded-3xl

bg-indigo-100

flex

items-center

justify-center

"

>

<Shield

size={28}

className="

text-indigo-600

"

/>

</div>

</div>

<h2

className="

text-4xl

font-bold

text-center

mb-3

"

>

Welcome

</h2>

<p

className="

text-slate-500

text-center

mb-8

"

>

{

subtitle

}

</p>

{

children

}

<div

className="

flex

justify-center

items-center

gap-2

mt-8

text-slate-400

text-sm

"

>

<Sparkles

size={14}

/>

Enterprise AI Platform

</div>

</div>

</div>

</div>

);

};

export default AuthLayout;