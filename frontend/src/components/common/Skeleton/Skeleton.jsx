const Skeleton=({

height="h-6",

width="w-full",

rounded="rounded-2xl",

className=""

})=>{

return(

<div

className={`

relative

overflow-hidden

bg-slate-200

border

border-slate-100

shadow-sm

${height}

${width}

${rounded}

${className}

`}

>

{/* SHIMMER */}

<div

className="

absolute

inset-0

-translate-x-full

animate-[shimmer_1.8s_infinite]

bg-gradient-to-r

from-transparent

via-white/80

to-transparent

"

/>

</div>

);

};

export default Skeleton;