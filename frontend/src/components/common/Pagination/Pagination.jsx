import {

ChevronLeft,
ChevronRight,
MoreHorizontal

} from "lucide-react";


const Pagination=({

currentPage,
totalPages,
onPageChange

})=>{

if(

totalPages<=1

){

return null;

}


const visiblePages=()=>{

const pages=[];

const maxVisible=5;


if(

totalPages<=maxVisible

){

return Array.from(

{

length:totalPages

},

(_,index)=>

index+1

);

}


pages.push(1);


if(

currentPage>3

){

pages.push("...");

}


const start=

Math.max(

2,
currentPage-1

);


const end=

Math.min(

totalPages-1,
currentPage+1

);


for(

let i=start;

i<=end;

i++

){

pages.push(i);

}


if(

currentPage<

totalPages-2

){

pages.push("...");

}


pages.push(

totalPages

);

return pages;

};


const pages=

visiblePages();


return(

<div

className="

mt-10

bg-white

border

border-slate-200

rounded-[28px]

shadow-sm

px-7

py-5

flex

flex-wrap

justify-between

items-center

gap-5

"

>

{/* INFO */}

<div

className="

text-slate-500

font-medium

"

>

Page

<span

className="

mx-2

font-bold

text-indigo-600

"

>

{

currentPage

}

</span>

of

<span

className="

ml-2

font-bold

text-slate-800

"

>

{

totalPages

}

</span>

</div>


{/* CONTROLS */}

<div

className="

flex

items-center

gap-2

"

>

{/* PREV */}

<button

disabled={

currentPage===1

}

onClick={()=>

onPageChange(

currentPage-1

)

}

className="

h-11

w-11

rounded-2xl

border

border-slate-200

bg-white

flex

items-center

justify-center

text-slate-600

hover:bg-indigo-50

hover:text-indigo-600

transition-all

disabled:opacity-40

disabled:cursor-not-allowed

"

>

<ChevronLeft

size={18}

/>

</button>


{

pages.map(

(

page,
index

)=>{

if(

page==="..."

){

return(

<div

key={index}

className="

px-2

text-slate-400

"

>

<MoreHorizontal

size={18}

/>

</div>

);

}


return(

<button

key={page}

onClick={()=>

onPageChange(

page

)

}

className={`

min-w-[44px]

h-11

px-4

rounded-2xl

font-semibold

transition-all

${

currentPage===page

?

`

bg-indigo-600

text-white

shadow-lg

shadow-indigo-200

`

:

`

bg-white

border

border-slate-200

text-slate-700

hover:bg-indigo-50

hover:text-indigo-600

`

}

`}

>

{

page

}

</button>

);

}

)

}


{/* NEXT */}

<button

disabled={

currentPage===

totalPages

}

onClick={()=>

onPageChange(

currentPage+1

)

}

className="

h-11

w-11

rounded-2xl

border

border-slate-200

bg-white

flex

items-center

justify-center

text-slate-600

hover:bg-indigo-50

hover:text-indigo-600

transition-all

disabled:opacity-40

disabled:cursor-not-allowed

"

>

<ChevronRight

size={18}

/>

</button>

</div>

</div>

);

};

export default Pagination;