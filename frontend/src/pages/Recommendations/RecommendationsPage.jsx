import {

useEffect,
useState

} from "react";

import MainLayout
from "../../components/layouts/MainLayout/MainLayout";

import VendorCard
from "../../components/vendor/VendorCard/VendorCard";

import Loader
from "../../components/common/Loader/Loader";

import EmptyState
from "../../components/common/EmptyState/EmptyState";

import PageHeader
from "../../components/common/PageHeader/PageHeader";

import Card
from "../../components/common/Card/Card";

import axiosInstance
from "../../api/axiosInstance";

import {

Sparkles,
TrendingUp,
Target

} from "lucide-react";


const RecommendationsPage=()=>{

const[

recommendations,
setRecommendations

]=useState([]);


const[

loading,
setLoading

]=useState(true);


// =====================
// STABLE SCORE ENGINE
// =====================

const scoreVendor=(vendor)=>{

const followers=

Number(

vendor.followers

)||0;

const rating=

Number(

vendor.avg_rating

)||0;

const views=

Number(

vendor.views

)||0;

const pricing=

Math.floor(

(

Number(

vendor.price_min

)||0

+

Number(

vendor.price_max

)||0

)

/

2

);

const aiScore=

Math.min(

99,

Math.floor(

rating*15+

followers*0.04+

views*0.02+

(pricing?8:0)

)

);


const budgetMatch=

Math.min(

100,

Math.max(

70,

90-

Math.floor(

pricing/5000

)

)

);


const categoryMatch=

Math.min(

100,

75+

Math.floor(

rating*5

)

);


return{

...vendor,

aiScore:

`${aiScore}%`,

budgetMatch:

`${budgetMatch}%`,

categoryMatch:

`${categoryMatch}%`

};

};


// =====================
// FETCH
// =====================

const fetchRecommendations=

async()=>{

try{

setLoading(true);

const response=

await axiosInstance.get(

"/vendors/recommendations"

);


const vendors=

response.data?.data?.recommendations||

response.data?.recommendations||

[];


setRecommendations(

vendors.map(

scoreVendor

)

);

}

catch(error){

console.log(

"Recommendation failed",

error

);

setRecommendations([]);

}

finally{

setLoading(false);

}

};


useEffect(()=>{

fetchRecommendations();

},[]);


if(

loading

){

return(

<MainLayout>

<Loader

text="Building AI Recommendations"

/>

</MainLayout>

);

}


return(

<MainLayout>

<div

className="space-y-8"

>

<PageHeader

title="Smart Recommendations"

subtitle="AI vendor intelligence using pricing, category relevance and vendor quality."

/>


{

recommendations.length===0

?

(

<EmptyState

title="No Recommendations Found"

message="AI recommendation engine could not identify vendor matches."

buttonText="Refresh"

onClick={

fetchRecommendations

}

/>

)

:

(

<div

className="

grid

xl:grid-cols-3

lg:grid-cols-2

gap-8

"

>

{

recommendations.map(

vendor=>(

<div

key={

vendor.vendor_id

}

className="space-y-5"

>

<Card>

<div

className="

flex

justify-between

items-center

"

>

<div>

<div

className="

flex

gap-2

items-center

text-indigo-600

font-semibold

mb-2

"

>

<Sparkles

size={18}

/>

AI Match

</div>


<h2

className="

text-3xl

font-bold

"

>

{

vendor.aiScore

}

</h2>

</div>


<div

className="space-y-3"

>

<div

className="

flex

items-center

gap-2

text-slate-600

"

>

<Target

size={18}

className="text-green-500"

/>

{

vendor.categoryMatch

}

Category

</div>


<div

className="

flex

items-center

gap-2

text-slate-600

"

>

<TrendingUp

size={18}

className="text-blue-500"

/>

{

vendor.budgetMatch

}

Budget

</div>

</div>

</div>

</Card>


<VendorCard

vendor={vendor}

/>

</div>

)

)

}

</div>

)

}

</div>

</MainLayout>

);

};


export default RecommendationsPage;