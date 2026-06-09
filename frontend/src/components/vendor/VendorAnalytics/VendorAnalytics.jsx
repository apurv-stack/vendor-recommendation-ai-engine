import {

ResponsiveContainer,
AreaChart,
Area,
CartesianGrid,
XAxis,
YAxis,
Tooltip

} from "recharts";

import {

TrendingUp,
Activity,
Eye

} from "lucide-react";

import Card
from "../../common/Card/Card";


const VendorAnalytics=({

analytics=[]

})=>{

const safeAnalytics=

Array.isArray(

analytics

)

?

analytics.map(

item=>({

day:

item.day||

item.date||

"Unknown",

views:

Number(

item.views??

item.total_views??

item.count??

0

)

})

)

:

[];


// =========================
// KPI
// =========================

const totalViews=

safeAnalytics.reduce(

(

sum,
item

)=>

sum+

item.views,

0

);


const growth=

safeAnalytics.length>1

?

Math.round(

(

(

safeAnalytics[

safeAnalytics.length-1

]?.views||

0

)

-

(

safeAnalytics[0]

?.views||

0

)

)

/

Math.max(

safeAnalytics[0]

?.views||

1,

1

)

)

*100

:

0;


const engagement=

Math.min(

95,

Math.floor(

totalViews/

25

)

);


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

top-0

right-0

h-60

w-60

bg-indigo-100

blur-3xl

rounded-full

opacity-60

"

/>


{/* HEADER */}

<div

className="

relative

flex

flex-col

xl:flex-row

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

tracking-[4px]

font-semibold

text-xs

mb-3

"

>

Analytics Intelligence

</p>


<h2

className="

text-3xl

font-bold

text-slate-800

mb-2

"

>

Profile Traffic Insights

</h2>


<p

className="

text-slate-500

"

>

Vendor performance analytics

</p>

</div>


<div

className="

flex

gap-4

flex-wrap

"

>

<MetricCard

title="Views"

value={

totalViews

}

icon={<Eye/>}

bg="bg-blue-50"

text="text-blue-600"

/>


<MetricCard

title="Growth"

value={`${growth}%`}

icon={<TrendingUp/>}

bg="bg-green-50"

text="text-green-600"

/>


<MetricCard

title="Engagement"

value={`${engagement}%`}

icon={<Activity/>}

bg="bg-purple-50"

text="text-purple-600"

/>

</div>

</div>


{/* CHART */}

<div

className="

h-[340px]

"

>

{

safeAnalytics.length===0

?

(

<div

className="

h-full

flex

items-center

justify-center

text-slate-400

"

>

No analytics available

</div>

)

:

(

<ResponsiveContainer

width="100%"

height="100%"

>

<AreaChart

data={

safeAnalytics

}

>

<defs>

<linearGradient

id="traffic"

x1="0"

y1="0"

x2="0"

y2="1"

>

<stop

offset="0%"

stopColor="#6366F1"

stopOpacity={0.28}

/>

<stop

offset="100%"

stopColor="#6366F1"

stopOpacity={0}

/>

</linearGradient>

</defs>


<CartesianGrid

stroke="#E2E8F0"

strokeDasharray="4 4"

vertical={false}

/>


<XAxis

dataKey="day"

tick={{

fill:"#64748B"

}}

axisLine={false}

tickLine={false}

/>


<YAxis

tick={{

fill:"#64748B"

}}

axisLine={false}

tickLine={false}

/>


<Tooltip

contentStyle={{

borderRadius:"18px",

border:"none",

boxShadow:

"0 10px 30px rgba(0,0,0,0.08)"

}}

labelStyle={{

color:"#0F172A"

}}

itemStyle={{

color:"#4F46E5"

}}

/>


<Area

type="monotone"

dataKey="views"

stroke="#6366F1"

strokeWidth={3}

fill="url(#traffic)"

dot={{

r:5,

fill:"#6366F1"

}}

activeDot={{

r:7

}}

/>

</AreaChart>

</ResponsiveContainer>

)

}

</div>

</Card>

);

};


function MetricCard({

title,
value,
icon,
bg,
text

}){

return(

<div

className={`

${bg}

rounded-2xl

px-5

py-4

min-w-[150px]

`}

>

<div

className={`

flex

items-center

gap-2

mb-2

${text}

`}

>

{icon}

{title}

</div>


<h3

className="

text-2xl

font-bold

text-slate-800

"

>

{value}

</h3>

</div>

);

}


export default VendorAnalytics;