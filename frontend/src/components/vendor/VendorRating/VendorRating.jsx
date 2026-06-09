import {

Star,
MessageCircle

} from "lucide-react";

import Card
from "../../common/Card/Card";


const VendorRating=({

rating=0,
totalReviews=0,
size=20,
showNumber=true

})=>{

const safeRating=

Number(

Math.min(

5,

Math.max(

0,

Number(

rating)||0

)

).toFixed(1)

);

const safeReviews=

Math.max(

0,

Number(

totalReviews)||0

);

const stars=[

1,
2,
3,
4,
5

];

return(

<Card

className="

relative

overflow-hidden

min-w-[260px]

"

>

{/* GLOW */}

<div

className="

absolute

-top-10

-right-10

h-28

w-28

bg-indigo-100

rounded-full

blur-3xl

opacity-70

"

/>

{/* HEADER */}

<p

className="

relative

text-indigo-600

uppercase

tracking-[3px]

text-xs

font-semibold

mb-4

"

>

Vendor Reputation

</p>

{/* STARS */}

<div

className="

relative

flex

gap-2

mb-5

"

>

{

stars.map(

star=>(

<StarIcon

key={star}

filled={

star<=

Math.round(

safeRating

)

}

size={size}

/>

)

)

}

</div>

{

showNumber&&(

<div

className="

relative

flex

justify-between

items-center

"

>

<div>

<h2

className="

text-4xl

font-bold

text-slate-800

"

>

{

safeRating.toFixed(1)

}

</h2>

<p

className="

text-slate-500

mt-1

"

>

Average Rating

</p>

</div>

<div

className="

flex

flex-col

items-end

gap-2

"

>

<div

className="

flex

items-center

gap-2

text-sm

text-slate-500

"

>

<MessageCircle

size={16}

/>

{

safeReviews

}

reviews

</div>

<div

className="

text-xs

text-slate-400

"

>

Backend verified

</div>

</div>

</div>

)

}

</Card>

);

};


function StarIcon({

filled,
size

}){

return(

<Star

size={size}

className={

filled

?

`

text-amber-400

fill-amber-400

`

:

`

text-slate-300

`

}

/>

);

}

export default VendorRating;