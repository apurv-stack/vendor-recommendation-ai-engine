import {

useEffect,
useState

} from "react";

import {

useNavigate

} from "react-router-dom";

import { useTheme } from "../../context/ThemeContext";

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
    const theme = useTheme();

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

const[
error,
setError
]=useState("");

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
Number(profile.views)||0;

const analyticsData=
    profile.analytics?.length
        ? profile.analytics
        : [];

setAnalytics(analyticsData);

setVisitors(

profile.recentVisitors||

[]

);

}

catch(error){

console.log(error);

setError(

error?.response?.data?.detail ||

error?.response?.data?.message ||

"Failed to load profile"

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

const stats = [
    {
        title: "Followers",
        value: followers,
        icon: <FaUsers />,
        color: "#7C5AF6"
    },
    {
        title: "Views",
        value: views,
        icon: <FaEye />,
        color: "#3B82F6"
    },
    {
        title: "Engagement",
        value: `${engagement}%`,
        icon: <FaChartLine />,
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
        px-4
        py-2
        rounded-xl
        flex
        gap-2
        items-center
        font-semibold
        text-sm
    "
>
    <FaUserEdit/>
    Edit Profile
</button>

}

/>

{error && (
    <div
        style={{
            padding: "10px 14px",
            borderRadius: "12px",
            background: "rgba(239,68,68,0.10)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#EF4444",
            fontSize: "13px",
            fontWeight: 500
        }}
    >
        {error}
    </div>
)}

<Card>

    <div
        style={{
            display: "flex",
            gap: "16px",
            alignItems: "flex-start",
            flexWrap: "wrap"
        }}
    >

        <div
            style={{
                height: "56px",
                width: "56px",
                borderRadius: "16px",
                background: "rgba(124,90,246,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >

            <FaBuilding
                size={22}
                color="#7C5AF6"
            />

        </div>

        <div>

            <h2
                style={{
                    fontSize: "clamp(15px, 3vw, 18px)",
                    fontWeight: 700,
                    color: theme.textPrimary,
                    marginBottom: "8px",
                    wordBreak: "break-word"
                }}
            >
                {vendor.name || "Vendor"}
            </h2>

            <p
                style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    color: theme.textMuted,
                    marginBottom: "8px",
                    fontSize: "13px",
                    wordBreak: "break-all",
                    flexWrap: "wrap"
                }}
            >
                <FaEnvelope style={{ flexShrink: 0 }} />
                {vendor.business_email || "N/A"}
            </p>

            <p
                style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    color: theme.textMuted,
                    fontSize: "13px",
                    flexWrap: "wrap"
                }}
            >
                <FaMapMarkerAlt style={{ flexShrink: 0 }} />
                {vendor.city || "Location"}
            </p>

        </div>

    </div>

</Card>

<div
    className="
        grid
        grid-cols-2
        md:grid-cols-3
        gap-4
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

<VendorAnalytics
    analytics={analytics}
/>

<RecentlyViewed
    visitors={visitors}
/>

<InternalTeams />

<VendorPricing
    minPrice={vendor.price_min}
    maxPrice={vendor.price_max}
/>
</div>

</MainLayout>

);

};

export default ProfilePage;