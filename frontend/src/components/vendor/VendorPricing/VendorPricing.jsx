import {

IndianRupee,
TrendingUp,
TrendingDown,
Wallet,
BarChart3,
BadgeDollarSign

} from "lucide-react";

import Card
from "../../common/Card/Card";


const VendorPricing=({

minPrice,
maxPrice,
averageMarketPrice=45000

})=>{


// =========================
// SAFE VALUES
// =========================

const vendorMin=

Math.max(

0,

Number(

minPrice

)||0

);


const vendorMax=

Math.max(

vendorMin,

Number(

maxPrice

)||0

);


const hasPricing=

vendorMin>0||

vendorMax>0;


const averageVendorPrice=

hasPricing

?

Math.floor(

(

vendorMin+

vendorMax

)/2

)

:

0;


const difference=

averageVendorPrice-

averageMarketPrice;


const aboveMarket=

difference>=0;


const trend=

aboveMarket

?

"up"

:

"down";


return(

<Card

className="

relative

overflow-hidden

"

>

{/* GLOW */}

<div

className="

absolute

-right-20

-top-20

h-60

w-60

bg-indigo-100

blur-3xl

rounded-full

opacity-70

"

/>


{/* HEADER */}

<div

className="

relative

flex

flex-col

lg:flex-row

justify-between

gap-6

mb-8

"

>

<div>

<p

className="

text-indigo-600

uppercase

tracking-[3px]

text-xs

font-semibold

mb-2

"

>

Pricing Intelligence

</p>


<h2

className="

text-3xl

font-bold

text-slate-800

mb-2

"

>

Vendor Pricing Analytics

</h2>


<p

className="

text-slate-500

"

>

AI powered pricing benchmarks

and marketplace positioning

</p>

</div>


<div

className="

h-16

w-16

rounded-2xl

bg-indigo-100

flex

items-center

justify-center

"

>

<Wallet

size={28}

className="

text-indigo-600

"

/>

</div>

</div>


{/* KPI */}

<div

className="

grid

lg:grid-cols-3

gap-6

mb-7

"

>

<PriceCard

title="Vendor Range"

value={

hasPricing

?

`₹${vendorMin} - ₹${vendorMax}`

:

"Unavailable"

}

description="Vendor service pricing"

icon={

<IndianRupee/>

}

/>


<PriceCard

title="Average Vendor Price"

value={

hasPricing

?

`₹${averageVendorPrice}`

:

"Unavailable"

}

description="AI calculated average"

highlight

icon={

<Wallet/>

}

/>


<PriceCard

title="Market Benchmark"

value={`₹${averageMarketPrice}`}

description={

hasPricing

?

(

aboveMarket

?

`₹${Math.abs(difference)} above benchmark`

:

`₹${Math.abs(difference)} below benchmark`

)

:

"No pricing available"

}

trend={trend}

icon={

trend==="up"

?

<TrendingUp/>

:

<TrendingDown/>

}

/>

</div>


{/* INSIGHT */}

<div

className="

bg-gradient-to-r

from-indigo-50

to-purple-50

border

border-indigo-100

rounded-[28px]

p-6

flex

flex-col

lg:flex-row

justify-between

gap-5

"

>

<div>

<div

className="

flex

gap-2

items-center

mb-3

"

>

<BarChart3

size={18}

className="

text-indigo-600

"

/>


<h4

className="

font-bold

text-slate-800

"

>

Pricing Insight

</h4>

</div>


<p

className="

text-slate-600

leading-7

"

>

{

!hasPricing

?

"Pricing information not available yet."

:

aboveMarket

?

"Vendor pricing indicates premium positioning."

:

"Vendor pricing remains competitive."

}

</p>

</div>


<div

className="

flex

items-center

gap-2

font-semibold

text-indigo-600

"

>

<BadgeDollarSign/>

AI Pricing Engine

</div>

</div>

</Card>

);

};


function PriceCard({

title,
value,
description,
icon,
highlight=false,
trend

}){

return(

<div

className="

bg-slate-50

border

border-slate-200

rounded-[28px]

p-6

"

>

<p

className="

text-slate-500

mb-3

"

>

{title}

</p>


<div

className="

flex

items-center

gap-2

mb-3

"

>

<div

className={`

${

highlight

?

"text-indigo-600"

:

"text-slate-700"

}

`}

>

{icon}

</div>


<h3

className={`

font-bold

text-3xl

${

highlight

?

"text-indigo-600"

:

"text-slate-800"

}

`}

>

{value}

</h3>

</div>


<div

className="

flex

items-center

gap-2

text-sm

text-slate-500

"

>

{

trend&&icon

}

{description}

</div>

</div>

);

}


export default VendorPricing;