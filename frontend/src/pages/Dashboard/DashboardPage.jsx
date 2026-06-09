import {
useState,
useEffect,
useMemo
} from "react";

import MainLayout
from "../../components/layouts/MainLayout/MainLayout";

import axiosInstance
from "../../api/axiosInstance";

import useAuth
from "../../hooks/useAuth";

import VendorAnalytics
from "../../components/vendor/VendorAnalytics/VendorAnalytics";

import Skeleton
from "../../components/common/Skeleton/Skeleton";

import Card
from "../../components/common/Card/Card";

import PageHeader
from "../../components/common/PageHeader/PageHeader";

import KpiCard
from "../../components/common/KpiCard/KpiCard";

import {

Bell,
Eye,
Users,
TrendingUp,
IndianRupee

} from "lucide-react";


const DashboardPage=()=>{

const{
user
}=useAuth();

const[
loading,
setLoading
]=useState(true);

const[
vendorName,
setVendorName
]=useState("");

const[
dashboard,
setDashboard
]=useState({

views:0,

followers:0,

engagement:0,

growth:0,

avgPricing:0,

analytics:[],

notifications:[]

});


const greeting=

useMemo(()=>{

const hour=

new Date()

.getHours();

if(

hour<12

){

return "Good Morning";

}

if(

hour<18

){

return "Good Afternoon";

}

return "Good Evening";

},[]);


useEffect(()=>{

fetchDashboard();

},[]);


const fetchDashboard=

async()=>{

try{

setLoading(true);

const[

profileResponse,

pricingResponse,

analyticsResponse,

notificationResponse

]=await Promise.all([

axiosInstance.get(

"/vendors/profile"

),

axiosInstance.get(

"/vendors/profile/pricing"

).catch(

()=>({

data:{

avg_pricing:0

}

})

),

axiosInstance.get(

"/vendors/profile/analytics"

).catch(

()=>({

data:{

analytics:[],

growth:0,

followers:0,

views:0,

engagement:0

}

})

),

axiosInstance.get(

"/vendors/notifications"

).catch(

()=>({

data:{

notifications:[]

}

})

)

]);

const vendor=

profileResponse.data?.vendor||

profileResponse.data?.data?.vendor||

{};

const analytics=

analyticsResponse.data||

{};

const pricing=

pricingResponse.data||

{};

const notificationData=

notificationResponse.data?.notifications||

[];

const views=

analytics.views||

0;

const followers=

analytics.followers||

0;

const engagement=

analytics.engagement||

0;

const growth=

analytics.growth||

0;

const avgPricing=

pricing.avg_pricing||

(

vendor.price_min&&

vendor.price_max

?

Math.floor(

(

vendor.price_min+

vendor.price_max

)/2

)

:0

);

setVendorName(

vendor.name||

user?.full_name||

"Vendor"

);

setDashboard({

views,

followers,

engagement,

growth,

avgPricing,

analytics:

analytics.analytics||

[],

notifications:

notificationData

});

}

catch(error){

console.log(

"Dashboard failed",

error

);

}

finally{

setLoading(false);

}

};


const stats=[

{

title:"Views",

value:

dashboard.views,

icon:<Eye/>,

color:

"bg-blue-100"

},

{

title:"Followers",

value:

dashboard.followers,

icon:<Users/>,

color:

"bg-violet-100"

},

{

title:"Engagement",

value:

`${dashboard.engagement}%`,

icon:<TrendingUp/>,

color:

"bg-emerald-100"

},

{

title:"Growth",

value:

`${dashboard.growth}%`,

icon:<TrendingUp/>,

color:

"bg-green-100"

},

{

title:"Pricing",

value:

dashboard.avgPricing

?

`₹${dashboard.avgPricing}`

:

"—",

icon:<IndianRupee/>,

color:

"bg-orange-100"

}

];


return(

<MainLayout>

<div
className="space-y-8"
>

<PageHeader

title={

vendorName

?

`${greeting}, ${vendorName}`

:

greeting

}

subtitle=

"Monitor vendor analytics growth and business intelligence."

/>


<div
className="grid xl:grid-cols-5 md:grid-cols-2 gap-6"
>

{

stats.map(

card=>(

<KpiCard

key={

card.title

}

title={

card.title

}

value={

loading

?

<Skeleton/>

:

card.value

}

icon={

card.icon

}

color={

card.color

}

/>

)

)

}

</div>


<div
className="grid lg:grid-cols-3 gap-6"
>

<div
className="lg:col-span-2"
>

<VendorAnalytics

analytics={

dashboard.analytics

}

/>

</div>


<Card>

<div
className=

"flex gap-2 mb-6 font-semibold"
>

<Bell/>

Notifications

</div>

{

loading

?

<Skeleton/>

:

dashboard.notifications.length

?

dashboard.notifications.map(

item=>(

<div

key={

item.notification_id

}

className=

"py-4 border-b"

>

<p
className="font-semibold"
>

{

item.title

}

</p>

<p
className="text-slate-500 text-sm"
>

{

item.message

}

</p>

<p
className="text-xs text-slate-400 mt-1"
>

{

new Date(

item.created_at

)

.toLocaleString()

}

</p>

</div>

)

)

:

(

<p
className="text-slate-500"
>

No notifications

</p>

)

}

</Card>

</div>

</div>

</MainLayout>

);

};

export default DashboardPage;