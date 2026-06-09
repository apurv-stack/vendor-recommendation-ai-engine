import {
useEffect,
useState,
useMemo
} from "react";

import {
Building2,
Users,
Star,
TrendingUp
} from "lucide-react";

import axiosInstance from "../../api/axiosInstance";

import MainLayout from "../../components/layouts/MainLayout/MainLayout";

import VendorFilters from "../../components/vendor/VendorFilters/VendorFilters";

import VendorCard from "../../components/vendor/VendorCard/VendorCard";

import VendorDetails from "../../components/vendor/VendorDetails/VendorDetails";

import Loader from "../../components/common/Loader/Loader";

import EmptyState from "../../components/common/EmptyState/EmptyState";

import Pagination from "../../components/common/Pagination/Pagination";

import Modal from "../../components/common/Modal/Modal";

import PageHeader from "../../components/common/PageHeader/PageHeader";

import KpiCard from "../../components/common/KpiCard/KpiCard";


const VendorDetailsPage=()=>{

const[
vendors,
setVendors
]=useState([]);

const[
categories,
setCategories
]=useState([]);

const[
selectedVendor,
setSelectedVendor
]=useState(null);

const[
loading,
setLoading
]=useState(false);

const[
page,
setPage
]=useState(1);

const[
totalResults,
setTotalResults
]=useState(0);

const[
totalPages,
setTotalPages
]=useState(1);

const[
searched,
setSearched
]=useState(false);

const limit=9;

const[
filters,
setFilters
]=useState({

query:"",
city:"",
category:"",
service:"",
minPrice:"",
maxPrice:"",
rating:"",
sort:"",
availability:""

});


useEffect(()=>{

fetchVendorCategories();

},[]);


const fetchVendorCategories=

async()=>{

try{

const response=

await axiosInstance.get(

"/vendors/internal-team"

);

const payload=

response.data?.data||

response.data;

const teams=

payload?.teams||

[];

setCategories(

teams.map(

team=>({

category_id:

team.vendor_id,

name:

team.name

})

)

);

}

catch(error){

console.log(

"Category fetch failed",

error

);

}

};


const fetchVendors=

async(

currentPage=1

)=>{

try{

setLoading(true);

setSearched(true);

const response=

await axiosInstance.get(

"/vendors/search",

{

params:{

query:

filters.query||

undefined,

city:

filters.city||

undefined,

category:

filters.category||

undefined,

service:

filters.service||

undefined,

min_price:

filters.minPrice||

undefined,

max_price:

filters.maxPrice||

undefined,

rating:

filters.rating||

undefined,

sort_by:

filters.sort||

undefined,

availability:

filters.availability||

undefined,

page:

currentPage,

limit

}

}

);

const payload=

response.data?.data||

response.data;

setVendors(

payload?.vendors||

[]

);

setTotalResults(

payload?.total_results||

0

);

setTotalPages(

payload?.total_pages||

1

);

setPage(

payload?.page||

1

);

}

catch(error){

console.log(

"Search failed",

error

);

}

finally{

setLoading(false);

}

};


const trackVendorView=

async(

vendorId

)=>{

try{

await axiosInstance.post(

`/vendors/${vendorId}/view`

);

}

catch(error){

console.log(error);

}

};


const openVendor=

async(

vendor

)=>{

await trackVendorView(

vendor.vendor_id

);

setSelectedVendor({

...vendor,

profile_views:

(

vendor.profile_views||

0

)+1

});

};


const saveVendor=

async(

vendor

)=>{

try{

await axiosInstance.post(

`/vendors/${vendor.vendor_id}/save`

);

setVendors(

previous=>

previous.map(

item=>

item.vendor_id===

vendor.vendor_id

?

{

...item,

saved:true

}

:

item

)

);

}

catch(error){

console.log(error);

}

};


const resetFilters=()=>{

setFilters({

query:"",
city:"",
category:"",
service:"",
minPrice:"",
maxPrice:"",
rating:"",
sort:"",
availability:""

});

setVendors([]);

setPage(1);

setTotalPages(1);

setTotalResults(0);

setSearched(false);

};


const averageRating=

useMemo(()=>{

if(

!vendors.length

){

return "0";

}

return(

vendors.reduce(

(

sum,

vendor

)=>

sum+

Number(

vendor.avg_rating||

0

),

0

)

/vendors.length

).toFixed(1);

},[vendors]);


const stats=[

{

title:"Vendors",

value:totalResults,

icon:<Building2/>,

color:"bg-blue-100"

},

{

title:"Categories",

value:categories.length,

icon:<Users/>,

color:"bg-purple-100"

},

{

title:"Avg Rating",

value:averageRating,

icon:<Star/>,

color:"bg-amber-100"

},

{

title:"Growth",

value:

vendors.length

?

`+${vendors.length*3}%`

:

"0%",

icon:<TrendingUp/>,

color:"bg-green-100"

}

];


return(

<MainLayout>

<div className="space-y-8">

<PageHeader

title="Vendor Marketplace"

subtitle="Search vendors compare pricing and analyze intelligence"

/>


<div

className="grid md:grid-cols-2 xl:grid-cols-4 gap-6"

>

{

stats.map(

card=>(

<KpiCard

key={card.title}

{...card}

/>

)

)

}

</div>


<VendorFilters

filters={filters}

setFilters={setFilters}

categories={categories}

onSearch={()=>

fetchVendors(1)

}

onReset={resetFilters}

/>


{

loading

?

<Loader/>

:

!searched

?

<EmptyState

title="Search Vendors"

message="Apply filters and click search to discover vendors"

buttonText="Search"

onClick={()=>

fetchVendors(1)

}

/>

:

vendors.length===0

?

<EmptyState

title="No Vendors Found"

message="Try adjusting filters and search again."

buttonText="Reset"

onClick={resetFilters}

/>

:

<>

<div

className="grid xl:grid-cols-3 lg:grid-cols-2 gap-6"

>

{

vendors.map(

vendor=>(

<VendorCard

key={vendor.vendor_id}

vendor={vendor}

onView={()=>

openVendor(vendor)

}

onSave={()=>

saveVendor(vendor)

}

/>

)

)

}

</div>


<Pagination

currentPage={page}

totalPages={totalPages}

onPageChange={fetchVendors}

/>

</>

}


<Modal

isOpen={!!selectedVendor}

onClose={()=>

setSelectedVendor(null)

}

title="Vendor Details"

size="lg"

>

{

selectedVendor&&(

<VendorDetails

vendor={selectedVendor}

/>

)

}

</Modal>

</div>

</MainLayout>

);

};

export default VendorDetailsPage;