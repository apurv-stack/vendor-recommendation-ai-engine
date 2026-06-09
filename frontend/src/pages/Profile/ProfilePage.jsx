import {

useEffect,
useState

} from "react";

import {

useNavigate

} from "react-router-dom";

import MainLayout
from "../../components/layouts/MainLayout/MainLayout";

import axiosInstance
from "../../api/axiosInstance";

import VendorPricing
from "../../components/vendor/VendorPricing/VendorPricing";

import RecentlyViewed
from "../../components/vendor/RecentlyViewed/RecentlyViewed";

import VendorAnalytics
from "../../components/vendor/VendorAnalytics/VendorAnalytics";

import InternalTeams
from "../../components/vendor/InternalTeams/InternalTeams";

import Loader
from "../../components/common/Loader/Loader";

import PageHeader
from "../../components/common/PageHeader/PageHeader";

import Card
from "../../components/common/Card/Card";

import KpiCard
from "../../components/common/KpiCard/KpiCard";

import {

FaUserEdit,
FaUsers,
FaEye,
FaEnvelope,
FaMapMarkerAlt,
FaBuilding,
FaChartLine

} from "react-icons/fa";

const ProfilePage=()=>{

const navigate=

useNavigate();

const[
vendor,
setVendor
]=useState({});

const[
loading,
setLoading
]=useState(true);

const[
analytics,
setAnalytics
]=useState([]);

const[
visitors,
setVisitors
]=useState([]);

const fetchProfile=

async()=>{

try{

setLoading(true);

const response=

await axiosInstance.get(

"/vendors/profile"

);

const profile=

response.data?.data?.vendor||

response.data?.vendor||

{};

setVendor(

profile

);

const views=

Number(

profile.views

)||0;

const analyticsData=

profile.analytics?.length

?

profile.analytics

:

[

{

day:"Mon",

views:

Math.max(

5,

Math.floor(

views*0.15

)

)

},

{

day:"Tue",

views:

Math.floor(

views*0.30

)

},

{

day:"Wed",

views:

Math.floor(

views*0.42

)

},

{

day:"Thu",

views:

Math.floor(

views*0.58

)

},

{

day:"Fri",

views:

Math.floor(

views*0.72

)

},

{

day:"Sat",

views:

Math.floor(

views*0.85

)

},

{

day:"Sun",

views

}

];

setAnalytics(

analyticsData

);

setVisitors(

profile.recentVisitors||

[]

);

}

catch(error){

console.log(

error

);

}

finally{

setLoading(false);

}

};

useEffect(()=>{

fetchProfile();

},[]);

if(

loading

){

return(

<MainLayout>

<Loader

text="Loading Profile"

/>

</MainLayout>

);

}

const followers=

Number(

vendor.followers

)||0;

const views=

Number(

vendor.views

)||0;

const engagement=

views>0

?

Math.min(

100,

Math.floor(

(

followers/

views

)

*100

)

)

:0;

const stats=[

{

title:"Followers",

value:

followers,

icon:<FaUsers/>,

color:

"bg-violet-100"

},

{

title:"Views",

value:

views,

icon:<FaEye/>,

color:

"bg-blue-100"

},

{

title:"Engagement",

value:

`${engagement}%`,

icon:<FaChartLine/>,

color:

"bg-green-100"

}

];

return(

<MainLayout>

<div

className="

max-w-7xl

mx-auto

space-y-8

"

>

<PageHeader

title={

vendor.name||

"Vendor"

}

subtitle="Manage vendor hierarchy, pricing and business intelligence"

action={

<button

onClick={()=>

navigate(

"/profile/edit"

)

}

className="

glass
px-6
py-4
rounded-2xl
flex
gap-3
items-center
font-semibold

"

>

<FaUserEdit/>

Edit Profile

</button>

}

/>

<Card>

<div

className="

flex
flex-col
lg:flex-row
gap-6
items-center

"

>

<div

className="

h-24
w-24
rounded-[28px]
bg-indigo-100
flex
items-center
justify-center

"

>

<FaBuilding

size={34}

className="

text-indigo-600

"

/>

</div>

<div>

<div

className="

space-y-3
text-slate-500

"

>

<p

className="

flex
gap-3
items-center

"

>

<FaEnvelope/>

{

vendor.business_email||

"N/A"

}

</p>

<p

className="

flex
gap-3
items-center

"

>

<FaMapMarkerAlt/>

{

vendor.city||

"Location"

}

</p>

</div>

</div>

</div>

</Card>

<div

className="

grid
md:grid-cols-3
gap-6

"

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

<InternalTeams/>

<VendorPricing

minPrice={

vendor.price_min

}

maxPrice={

vendor.price_max

}

/>

</div>

</MainLayout>

);

};

export default ProfilePage;