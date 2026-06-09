import {

MapPin,
Phone,
Mail,
Star,
Users,
BadgeCheck,
IndianRupee,
ArrowUpRight,
TrendingUp,
Briefcase,
CheckCircle,
XCircle,
Heart,
Bookmark

} from "lucide-react";

import {

useState,
useEffect

} from "react";

import axiosInstance
from "../../../api/axiosInstance";

import Card
from "../../common/Card/Card";

import Button
from "../../common/Button/Button";

import EmptyState
from "../../common/EmptyState/EmptyState";

import VendorRating
from "../VendorRating/VendorRating";

import VendorPricing
from "../VendorPricing/VendorPricing";


const VendorDetails=({

vendor

})=>{

const[

following,
setFollowing

]=useState(false);

const[

saved,
setSaved

]=useState(false);

const[

followLoading,
setFollowLoading

]=useState(false);

const[

saveLoading,
setSaveLoading

]=useState(false);


useEffect(()=>{

if(

vendor?.vendor_id

){

trackView();

}

},[

vendor?.vendor_id

]);


const trackView=

async()=>{

try{

await axiosInstance.post(

`/vendors/${vendor.vendor_id}/view`

);

}

catch(error){

console.log(

error

);

}

};


const toggleFollow=

async()=>{

try{

setFollowLoading(

true

);

if(

following

){

await axiosInstance.delete(

`/vendors/${vendor.vendor_id}/follow`

);

setFollowing(

false

);

}

else{

await axiosInstance.post(

`/vendors/${vendor.vendor_id}/follow`

);

setFollowing(

true

);

}

}

catch(error){

console.log(

error

);

}

finally{

setFollowLoading(

false

);

}

};


const toggleSave=

async()=>{

try{

setSaveLoading(

true

);

if(

saved

){

await axiosInstance.delete(

`/vendors/${vendor.vendor_id}/save`

);

setSaved(

false

);

}

else{

await axiosInstance.post(

`/vendors/${vendor.vendor_id}/save`

);

setSaved(

true

);

}

}

catch(error){

console.log(

error

);

}

finally{

setSaveLoading(

false

);

}

};


if(

!vendor

){

return(

<EmptyState

title="No Vendor Selected"

message=

"Choose a vendor to view profile information."

/>

);

}


const services=

vendor?.services||

[];

const verified=

vendor?.is_verified||

false;

const available=

vendor?.is_available??

true;


const stats=[

{

label:"Reviews",

value:

vendor?.review_count||

0,

icon:

<Users/>

},

{

label:"Services",

value:

services.length,

icon:

<Briefcase/>

},

{

label:"Rating",

value:

Number(

vendor?.avg_rating||

0

).toFixed(1),

icon:

<Star/>

}

];


return(

<div

className="space-y-7"

>

<Card

className="

relative

overflow-hidden

"

>

<div

className="

absolute

-right-20

-top-20

h-56

w-56

bg-indigo-100

blur-3xl

rounded-full

opacity-60

"

/>


<div

className="

relative

flex

flex-col

xl:flex-row

justify-between

gap-8

"

>

<div>

<div

className="

flex

items-center

gap-3

mb-5

"

>

<h1

className="

text-5xl

font-bold

text-slate-800

"

>

{

vendor?.name||

"Vendor"

}

</h1>

{

verified&&(

<BadgeCheck

size={24}

className="text-indigo-600"

/>

)

}

</div>


<div

className="

space-y-4

text-slate-600

"

>

<InfoRow

icon={<MapPin/>}

text={

vendor?.city||

"Location unavailable"

}

/>

<InfoRow

icon={<Phone/>}

text={

vendor?.contact_phone||

"Unavailable"

}

/>

<InfoRow

icon={<Mail/>}

text={

vendor?.business_email||

"Unavailable"

}

/>

<InfoRow

icon={

available

?

<CheckCircle/>

:

<XCircle/>

}

text={

available

?

"Available"

:

"Unavailable"

}

/>

</div>


<div

className="

flex

gap-3

mt-6

flex-wrap

"

>

<button

onClick={

toggleFollow

}

disabled={

followLoading

}

className={`

px-5

py-3

rounded-2xl

font-semibold

flex

items-center

gap-2

transition

${

following

?

"bg-red-500 text-white"

:

"bg-indigo-600 text-white"

}

`}

>

<Heart size={18}/>

{

followLoading

?

"Loading..."

:

following

?

"Following"

:

"Follow"

}

</button>


<button

onClick={

toggleSave

}

disabled={

saveLoading

}

className={`

px-5

py-3

rounded-2xl

font-semibold

flex

items-center

gap-2

border

transition

${

saved

?

"bg-amber-500 text-white"

:

"bg-white"

}

`}

>

<Bookmark size={18}/>

{

saveLoading

?

"Saving..."

:

saved

?

"Saved"

:

"Save"

}

</button>

</div>

</div>


<Card

className="

min-w-[260px]

bg-gradient-to-r

from-indigo-50

to-purple-50

"

>

<VendorRating

rating={

vendor?.avg_rating||

0

}

totalReviews={

vendor?.review_count||

0

}

/>

<div

className="

mt-5

flex

items-center

gap-2

font-semibold

text-emerald-600

"

>

<TrendingUp/>

{

verified

?

"Verified Vendor"

:

"Standard Vendor"

}

</div>

</Card>

</div>

</Card>


<Card>

<h2

className="

text-2xl

font-bold

mb-5

"

>

About Vendor

</h2>

<p

className="

leading-8

text-slate-600

"

>

{

vendor?.description||

"No description available."

}

</p>

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

item=>(

<MetricCard

key={item.label}

{...item}

/>

)

)

}

</div>


<Card>

<h2

className="

text-2xl

font-bold

mb-6

"

>

Services

</h2>

{

services.length===0

?

<p>

No services available

</p>

:

<div

className="

flex

flex-wrap

gap-3

"

>

{

services.map(

(

service,
index

)=>(

<div

key={

service.service_id||

index

}

className="

px-5

py-3

rounded-2xl

bg-slate-100

"

>

{

service.service_name||

service

}

</div>

)

)

}

</div>

}

</Card>


<VendorPricing

minPrice={

vendor?.price_min

}

maxPrice={

vendor?.price_max

}

/>


<Button

icon={

<ArrowUpRight/>

}

>

<IndianRupee/>

Request Vendor Quote

</Button>

</div>

);

};


function InfoRow({

icon,
text

}){

return(

<div

className="

flex

items-center

gap-3

"

>

{icon}

{text}

</div>

);

}


function MetricCard({

label,
value,
icon

}){

return(

<Card>

<div

className="

h-14

w-14

rounded-2xl

bg-indigo-50

flex

items-center

justify-center

mb-5

"

>

{icon}

</div>

<h2

className="

text-4xl

font-bold

mb-2

"

>

{value}

</h2>

<p>

{label}

</p>

</Card>

);

}


export default VendorDetails;