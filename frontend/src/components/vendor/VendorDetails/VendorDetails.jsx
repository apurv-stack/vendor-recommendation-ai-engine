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

import { useTheme }
from "../../../context/ThemeContext";

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

const theme = useTheme();

const[
    following,
    setFollowing
]=useState(
    vendor?.is_following ||
    vendor?.following ||
    false
);

const[
    saved,
    setSaved
]=useState(
    vendor?.is_saved ||
    false
);

useEffect(() => {

    setSaved(
        vendor?.is_saved || false
    );

}, [vendor]);

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

(vendor?.managed_teams || [])
    .flatMap(team => team?.services || []);

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

className="space-y-4"

>

<Card

className="

relative

overflow-hidden

"

>

<div

style={{
position: "absolute",
right: "-80px",
top: "-80px",
height: "224px",
width: "224px",
borderRadius: "999px",
background: "rgba(124,90,246,0.12)",
filter: "blur(60px)",
opacity: 0.8
}}

/>


<div
className="
relative
grid
grid-cols-1
xl:grid-cols-[1fr_260px]
gap-4
items-stretch
"
>

<div>

<div

className="

flex

items-center

gap-3

mb-3

"

>

<h1

style={{
fontSize:"16px",
fontWeight:700,
color:theme.textPrimary
}}
>

{

vendor?.name||

"Vendor"

}

</h1>

{

verified&&(

<BadgeCheck

size={18}

color="#7C5AF6"

/>

)

}

</div>


<div

style={{
display:"flex",
flexDirection:"column",
color:theme.textMuted,
fontSize:"13px"
}}

>

<InfoRow

icon={<MapPin size={16} />}

text={

vendor?.city||

"Location unavailable"

}

/>

<InfoRow

icon={<Phone size={16} />}

text={

vendor?.contact_phone||

"Unavailable"

}

/>

<InfoRow

icon={<Mail size={16} />}

text={

vendor?.business_email||

"Unavailable"

}

/>

<InfoRow

icon={

available

?

<CheckCircle size={16}/>

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
mt-3
flex-wrap
w-full
"
>

{/* <button

onClick={

toggleFollow

}

disabled={

followLoading

}

style={{
padding: "8px 14px",
borderRadius: "12px",
fontSize: "13px",
fontWeight: 600,
display: "flex",
alignItems: "center",
gap: "8px",
border: "none",
cursor: "pointer",
background: following
? "#7C5AF6"
: theme.panelBg,
color: following
? "#fff"
: theme.textPrimary,
border: `1px solid ${theme.cardBorder}`
}}

>

<Heart
    size={18}
    fill={following ? "currentColor" : "none"}
/>

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

</button> */}


<button

onClick={

toggleSave

}

disabled={

saveLoading

}

style={{
padding: "8px 14px",
borderRadius: "12px",
fontSize: "13px",
fontWeight: 600,
display: "flex",
alignItems: "center",
justifyContent: "center",
gap: "8px",
cursor: "pointer",
width: "100%",
maxWidth: "200px",
background: saved ? "#F59E0B" : theme.panelBg,
color: saved ? "#fff" : theme.textPrimary,
border: `1px solid ${theme.cardBorder}`
}}
>

<Bookmark
    size={18}
    fill={saved ? "currentColor" : "none"}
/>

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


<div
style={{
background: theme.panelBg,
border: `1px solid ${theme.cardBorder}`,
borderRadius: "20px",
padding: "16px",
height: "auto",
minHeight: "120px",
display: "flex",
flexDirection: "column",
justifyContent: "center",
minWidth: 0,
overflow: "hidden"
}}
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

style={{
marginTop: "12px",
display: "flex",
alignItems: "center",
gap: "8px",
fontWeight: 600,
fontSize: "13px",
color: verified
? "#22C55E"
: theme.textMuted
}}

>

<TrendingUp size={16}/>

{

verified

?

"Verified Vendor"

:

"Standard Vendor"

}

</div>

</div>

</div>

</Card>


<Card>

<h2
style={{
fontSize: "16px",
fontWeight: 700,
marginBottom: "12px",
color: theme.textPrimary
}}
>

About Vendor

</h2>

<p

style={{
color:theme.textMuted,
lineHeight:1.5
}}

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
grid-cols-1
sm:grid-cols-3
gap-4
"
>

{

stats.map(

item=>(

<MetricCard

key={item.label}

{...item}
theme={theme}

/>

)

)

}

</div>


<Card>

<h2
style={{
fontSize: "16px",
fontWeight: 700,
marginBottom: "16px",
color: theme.textPrimary
}}
>

Services

</h2>

{

services.length===0

?

<p
style={{
color: theme.textMuted
}}
>
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

style={{
padding:"8px 12px",
borderRadius:"12px",
fontSize:"12px",
background:theme.panelBg,
border:`1px solid ${theme.cardBorder}`,
color:theme.textSecondary
}}

>

{

service.name||

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


<div style={{ width: "100%" }}>
<Button
    icon={<ArrowUpRight />}
    style={{ width: "100%" }}
>
    <IndianRupee />
    Request Vendor Quote
</Button>
</div>
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
icon,
theme

}){

return(

<Card>

<div

style={{
height:"40px",
width:"40px",
borderRadius:"12px",
background:"rgba(124,90,246,0.12)",
display:"flex",
alignItems:"center",
justifyContent:"center",
marginBottom:"12px",
color:"#7C5AF6"
}}

>

{icon}

</div>

<h2
style={{
fontSize: "16px",
fontWeight: 700,
marginBottom: "8px",
color: theme.textPrimary
}}
>
{value}
</h2>

<p
style={{
color: theme.textMuted
}}
>
{label}
</p>

</Card>

);

}


export default VendorDetails;