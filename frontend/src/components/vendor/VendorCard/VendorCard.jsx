import {

Star,
MapPin,
Eye,
Users,
Heart,
BadgeCheck,
ArrowUpRight

} from "lucide-react";

import Card
from "../../common/Card/Card";

import Button
from "../../common/Button/Button";


const VendorCard=({

vendor,
onView,
onSave

})=>{

const verified=

vendor?.is_verified??

false;

const available=

vendor?.is_available??

true;

const services=

vendor?.services||

[];

const rating=

Number(

vendor?.avg_rating||

0

).toFixed(1);

const reviews=

vendor?.review_count||

0;


return(

<Card

className="

relative

overflow-hidden

group

hover:-translate-y-2

transition-all

duration-300

"

>

{/* TOP BAR */}

<div

className="

absolute

top-0

left-0

right-0

h-1

bg-gradient-to-r

from-indigo-500

via-purple-500

to-cyan-500

"

/>


{/* GLOW */}

<div

className="

absolute

-right-16

-top-16

h-40

w-40

bg-indigo-200/30

blur-3xl

rounded-full

"

/>


{/* HEADER */}

<div

className="

relative

flex

justify-between

items-start

mb-6

"

>

<div>

<div

className="

flex

items-center

gap-2

mb-2

"

>

<h2

className="

text-2xl

font-bold

text-slate-800

"

>

{

vendor?.name||

"Vendor"

}

</h2>


{

verified&&(

<BadgeCheck

size={18}

className="

text-indigo-500

"

/>

)

}

</div>


<div

className="

flex

items-center

gap-2

text-slate-500

"

>

<MapPin size={16}/>

{

vendor?.city||

"Location unavailable"

}

</div>

</div>


<button

onClick={()=>

onSave?.(

vendor

)

}

className="

h-11

w-11

rounded-2xl

bg-slate-100

hover:bg-rose-100

flex

items-center

justify-center

transition-all

"

>

<Heart

size={18}

className="

text-slate-500

hover:text-rose-500

"

/>

</button>

</div>


{/* STATUS */}

<div

className="

flex

gap-2

flex-wrap

mb-5

"

>

{

verified&&(

<span

className="

bg-indigo-50

text-indigo-600

px-4

py-2

rounded-full

font-semibold

text-sm

"

>

Verified

</span>

)

}


<span

className={`

px-4

py-2

rounded-full

font-semibold

text-sm

${

available

?

"bg-emerald-100 text-emerald-700"

:

"bg-red-100 text-red-700"

}

`}

>

{

available

?

"Available"

:

"Unavailable"

}

</span>

</div>


{/* DESCRIPTION */}

<p

className="

text-slate-500

leading-7

line-clamp-3

mb-6

"

>

{

vendor?.description||

"No description available"

}

</p>


{/* PRICE */}

<div

className="

bg-gradient-to-r

from-indigo-50

to-purple-50

rounded-3xl

p-5

mb-6

border

border-indigo-100

"

>

<p

className="

text-slate-500

text-sm

mb-2

"

>

Pricing Range

</p>


<h3

className="

text-3xl

font-bold

text-slate-800

"

>

₹

{

vendor?.price_min??

0

}

-

₹

{

vendor?.price_max??

0

}

</h3>

</div>


{/* SERVICES */}

{

services.length>0&&(

<div

className="

flex

flex-wrap

gap-2

mb-6

"

>

{

services

.slice(

0,

3

)

.map(

(

service,
index

)=>(

<span

key={

service.service_id||

index

}

className="

px-4

py-2

bg-slate-100

rounded-2xl

text-sm

font-medium

text-slate-600

"

>

{

service.service_name||

service

}

</span>

)

)

}

</div>

)

}


{/* KPI */}

<div

className="

grid

grid-cols-3

gap-3

mb-6

"

>

<Metric

icon={

<Users size={16}/>

}

value={reviews}

label="Reviews"

iconColor="text-indigo-500"

/>


<Metric

icon={

<Eye size={16}/>

}

value={

services.length

}

label="Services"

iconColor="text-cyan-500"

/>


<Metric

icon={

<Star

size={16}

fill="#FACC15"

color="#FACC15"

/>

}

value={rating}

label="Rating"

iconColor=""

/>

</div>


<Button

onClick={()=>

onView?.(

vendor

)

}

icon={

<ArrowUpRight/>

}

>

View Details

</Button>

</Card>

);

};


const Metric=({

icon,
value,
label,
iconColor

})=>(

<div

className="

bg-slate-50

rounded-2xl

p-3

text-center

"

>

<div

className={`

mx-auto

mb-2

flex

justify-center

${

iconColor

}

`}

>

{

icon

}

</div>


<p

className="

font-bold

text-slate-800

"

>

{

value

}

</p>


<p

className="

text-xs

text-slate-500

"

>

{

label

}

</p>

</div>

);


export default VendorCard;