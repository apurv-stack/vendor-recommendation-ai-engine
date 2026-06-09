import {

useEffect,
useState

} from "react";

import MainLayout
from "../../components/layouts/MainLayout/MainLayout";

import axiosInstance
from "../../api/axiosInstance";

import VendorCard
from "../../components/vendor/VendorCard/VendorCard";

import EmptyState
from "../../components/common/EmptyState/EmptyState";

import PageHeader
from "../../components/common/PageHeader/PageHeader";

import Skeleton
from "../../components/common/Skeleton/Skeleton";

import Button
from "../../components/common/Button/Button";

import {

RefreshCw,
Bookmark

} from "lucide-react";


const SavedVendorsPage=()=>{

const[

vendors,
setVendors

]=useState([]);

const[

loading,
setLoading

]=useState(true);

const[

error,
setError

]=useState("");



useEffect(()=>{

fetchSaved();

},[]);



const fetchSaved=

async()=>{

try{

setLoading(

true

);

setError(

""

);

const response=

await axiosInstance.get(

"/vendors/saved"

);

setVendors(

response.data?.vendors||

[]

);

}

catch(error){

console.log(

error

);

setError(

"Unable to load saved vendors"

);

}

finally{

setLoading(

false

);

}

};



return(

<MainLayout>

<div

className="space-y-8"

>

<PageHeader

title="Saved Vendors"

subtitle={

`${vendors.length} bookmarked vendors`

}

/>


<div

className="

flex

justify-end

"

>

<Button

onClick={

fetchSaved

}

icon={

<RefreshCw size={18}/>

}

>

Refresh

</Button>

</div>


{

loading

?

(

<div

className="

grid

md:grid-cols-2

xl:grid-cols-3

gap-6

"

>

{

Array.from({

length:6

}).map(

(_,

index

)=>(

<Skeleton

key={index}

className="

h-[280px]

rounded-3xl

"

/>

)

)

}

</div>

)

:

error

?

(

<EmptyState

title="Failed loading vendors"

message={error}

/>

)

:

vendors.length===0

?

(

<EmptyState

title="No saved vendors"

message=

"Bookmark vendors to build your shortlist."

icon={

<Bookmark/>

}

/>

)

:

(

<>

<div

className="

flex

items-center

gap-2

text-slate-500

font-medium

"

>

<Bookmark size={18}/>

{

vendors.length

}

saved vendors

</div>


<div

className="

grid

md:grid-cols-2

xl:grid-cols-3

gap-6

"

>

{

vendors.map(

vendor=>(

<VendorCard

key={

vendor.vendor_id

}

vendor={

vendor

}

/>

)

)

}

</div>

</>

)

}

</div>

</MainLayout>

);

};

export default SavedVendorsPage;