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

import { useLocation } from "react-router-dom";

import { useTheme } from "../../context/ThemeContext";

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
const theme = useTheme();
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
errorMessage,
setErrorMessage
]=useState("");

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

const location = useLocation();
useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openId = params.get("open");
    if (openId) {
        fetchVendorByIdAndOpen(openId);
    }
}, [location.search]);

const fetchVendorByIdAndOpen = async (id) => {
    try {
        const response = await axiosInstance.get(`/vendors/${id}`);
        const vendor = response.data?.data || response.data;
        setSelectedVendor(vendor);
    } catch (error) {
        console.log("Failed to open vendor", error);
    }
};

const fetchVendorCategories=

async()=>{

try{

const response=

await axiosInstance.get(

"/vendors/categories"

);

const payload=

response.data?.data||

response.data;

const categoryList=

payload?.categories||

[];

setCategories(

categoryList.map(

name=>({

category_id:

name,

name:

name

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

    setErrorMessage("");

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

filters.minPrice === ""
? undefined
: Number(filters.minPrice),

max_price:

filters.maxPrice === ""
? undefined
: Number(filters.maxPrice),

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

const vendorResults =
    payload?.vendors || [];

const filteredResults =
    filters.query
        ? vendorResults.filter(vendor =>
              (
                  vendor.name ||
                  vendor.vendor_name ||
                  ""
              )
                  .toLowerCase()
                  .includes(
                      filters.query.toLowerCase()
                  )
          )
        : vendorResults;

setVendors(filteredResults);

setTotalResults(

payload?.total_results||

0

);

setTotalPages(

Math.max(
1,
Math.ceil(
(payload?.total_results || 0)
/
limit
)
)

);

setPage(

payload?.page||

1

);

}

catch(error){

setErrorMessage(

error?.response?.data?.detail ||

error?.response?.data?.message ||

"Search failed"

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


const saveVendor = async (vendor) => {

    try {

        if (vendor.is_saved) {

            await axiosInstance.delete(
                `/vendors/${vendor.vendor_id}/save`
            );

        } else {

            await axiosInstance.post(
                `/vendors/${vendor.vendor_id}/save`
            );

        }

        setVendors(previous =>
            previous.map(item =>
                item.vendor_id === vendor.vendor_id
                    ? {
                        ...item,
                        is_saved: !item.is_saved
                    }
                    : item
            )
        );

        if (
            selectedVendor &&
            selectedVendor.vendor_id === vendor.vendor_id
        ) {

            setSelectedVendor(prev => ({
                ...prev,
                is_saved: !prev.is_saved
            }));

        }

    } catch (error) {

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


const stats = [

    {
        title: "Vendors",
        value: totalResults,
        icon: <Building2 />,
        color: "#3B82F6"
    },

    {
        title: "Categories",
        value: categories.length,
        icon: <Users />,
        color: "#7C5AF6"
    },

    {
        title: "Avg Rating",
        value: averageRating,
        icon: <Star />,
        color: "#F59E0B"
    },

    {
        title: "Growth",
        value:
            vendors.length
                ? `+${vendors.length * 3}%`
                : "0%",
        icon: <TrendingUp />,
        color: "#22C55E"
    }

];


return(

<MainLayout>
<div
    className="
        max-w-7xl
        mx-auto
        space-y-6
        px-4
        sm:px-6
        lg:px-8
    "
>


<PageHeader
    title="Vendor Marketplace"
    subtitle="Search vendors, compare pricing, ratings and business intelligence."
/>


<div
className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4"
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

{
errorMessage && (

<div
className="
text-red-500
text-sm
font-medium
mt-2
"
>
{errorMessage}
</div>

)
}

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
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4"
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