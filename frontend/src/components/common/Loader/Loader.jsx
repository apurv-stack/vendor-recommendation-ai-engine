const Loader=({

text="Loading..."

})=>{

return(

<div

className="

min-h-[320px]

flex

flex-col

items-center

justify-center

gap-8

"

>

{/* PREMIUM LOADER */}

<div

className="

relative

h-24

w-24

"

>

{/* OUTER GLOW */}

<div

className="

absolute

inset-0

rounded-full

bg-indigo-200

blur-2xl

opacity-60

animate-pulse

"

/>


{/* OUTER RING */}

<div

className="

absolute

inset-0

rounded-full

border-[5px]

border-slate-200

"

/>


{/* ACTIVE SPINNER */}

<div

className="

absolute

inset-0

rounded-full

border-[5px]

border-transparent

border-t-indigo-600

border-r-purple-500

animate-spin

"

/>


{/* CENTER */}

<div

className="

absolute

inset-[18px]

rounded-full

bg-white

border

border-slate-200

shadow-sm

"

/>

</div>


{/* TEXT */}

<div

className="

text-center

"

>

<h3

className="

text-slate-800

font-semibold

text-lg

mb-2

"

>

{

text

}

</h3>


<p

className="

text-slate-500

text-sm

"

>

Preparing enterprise insights

</p>

</div>

</div>

);

};

export default Loader;