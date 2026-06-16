import {

useEffect,
useState

} from "react";

import MainLayout
from "../../components/layouts/MainLayout/MainLayout";

import { useTheme } from "../../context/ThemeContext";

import axiosInstance
from "../../api/axiosInstance";

import Loader
from "../../components/common/Loader/Loader";

import EmptyState
from "../../components/common/EmptyState/EmptyState";

import PageHeader
from "../../components/common/PageHeader/PageHeader";

import Card
from "../../components/common/Card/Card";

import KpiCard
from "../../components/common/KpiCard/KpiCard";

import {

Users,
UserPlus,
Mail,
Shield,
Briefcase,
Circle,
TrendingUp

} from "lucide-react";

const InternalTeamsPage=()=>{
    const theme = useTheme();

const[

loading,
setLoading

]=useState(true);

const[

teamMembers,
setTeamMembers

]=useState([]);

useEffect(()=>{

fetchTeams();

},[]);

const fetchTeams=async()=>{

try{

setLoading(true);

const response=

await axiosInstance.get(

"/vendors/internal-team"

);

setTeamMembers(

response.data.teams||

[]

);

}

catch(error){

console.log(error);

}

finally{

setLoading(false);

}

};

const getStatusColor = (status) => {

    if (status?.toLowerCase() === "active") {

        return {
            background: "rgba(34,197,94,0.12)",
            color: "#22C55E"
        };
    }

    if (status?.toLowerCase() === "away") {

        return {
            background: "rgba(249,115,22,0.12)",
            color: "#F97316"
        };
    }

    return {
        background: "rgba(100,116,139,0.12)",
        color: "#94A3B8"
    };
};

const activeMembers=

teamMembers.filter(

member=>

member.status?.toLowerCase()

==="active"

).length;

const stats=[

{

title:"Team Members",

value:teamMembers.length,

icon:<Users/>,

color:"purple"

},

{

title:"Active Members",

value:activeMembers,

icon:<TrendingUp/>,

color:"green"

}

];

return(

<MainLayout>

<div
    className="
        space-y-6
        px-4
        sm:px-6
        lg:px-8
    "
>

<PageHeader

title="Internal Teams"

subtitle="Manage collaboration, roles and vendor operations"

action={

<button
    style={{
        background:
            "linear-gradient(135deg,#7C5AF6,#A78BFA)",
        color:"#fff",
        padding:"8px 16px",
        borderRadius:"10px",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        gap:"8px",
        border:"none",
        fontWeight:600,
        fontSize:"13px",
        cursor:"pointer",
        minHeight:"40px",
        whiteSpace:"nowrap"
    }}
>
    <UserPlus/>
    Add Team Member
</button>

}

/>

<div
    className="
        grid
        grid-cols-2
        md:grid-cols-2
        xl:grid-cols-3
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

{

loading

?

(

<Loader

text="Loading Team Members"

/>

)

:

teamMembers.length===0

?

(

<EmptyState

title="No Team Members"

message="Start building your vendor team."

/>

)

:

(

<div
    className="
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-4
    "
>
{

teamMembers.map(

member=>(

<Card

key={

member.team_id||

member.email

}

className="

hover:-translate-y-1

transition-all

"

>

<div
    className="
        flex
        justify-between
        items-start
        gap-3
        flex-wrap
    "
>
<div>

<h3

className="

text-base

font-bold

"

>

{

member.name||

"Team Member"

}

</h3>

<div

style={{
    display:"flex",
    alignItems:"center",
    gap:"8px",
    marginTop:"12px",
    color:theme.textMuted
}}

>

<Briefcase

size={16}

/>

{

member.role||

"Vendor Team"

}

</div>

<div

style={{
    display:"flex",
    alignItems:"center",
    gap:"8px",
    marginTop:"8px",
    wordBreak:"break-all",
    color:theme.textMuted
}}

>

<Mail

size={16}

/>

{

member.email||

"N/A"

}

</div>

</div>

<div
    style={{
        ...getStatusColor(member.status),
        padding:"6px 12px",
        borderRadius:"999px",
        display:"flex",
        alignItems:"center",
        gap:"6px",
        fontWeight:600,
        fontSize:"12px",
        whiteSpace:"nowrap",
        flexShrink: 0
    }}
>

<Circle

size={10}

fill="currentColor"

/>

{

member.status||

"Unknown"

}

</div>

</div>

<div

style={{
    marginTop:"12px",
    paddingTop:"12px",
    borderTop:`1px solid ${theme.cardBorder}`
}}

>

<div

style={{
    display:"flex",
    alignItems:"center",
    gap:"8px",
    color:theme.textMuted
}}

>

<Shield

size={16}

/>

Vendor Team Access

</div>

</div>

</Card>

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

export default InternalTeamsPage;