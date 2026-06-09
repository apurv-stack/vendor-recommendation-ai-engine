import {

useEffect,
useState

} from "react";

import MainLayout
from "../../components/layouts/MainLayout/MainLayout";

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

const getStatusColor=(status)=>{

if(

status?.toLowerCase()==="active"

){

return

"bg-emerald-100 text-emerald-700";

}

if(

status?.toLowerCase()==="away"

){

return

"bg-orange-100 text-orange-700";

}

return

"bg-slate-100 text-slate-600";

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

color:"bg-blue-100"

},

{

title:"Active Members",

value:activeMembers,

icon:<TrendingUp/>,

color:"bg-emerald-100"

}

];

return(

<MainLayout>

<div

className="

space-y-8

"

>

<PageHeader

title="Internal Teams"

subtitle="Manage collaboration, roles and vendor operations"

action={

<button

className="

glass

px-6

py-4

rounded-2xl

font-semibold

flex

items-center

gap-3

hover:scale-[1.02]

transition-all

"

>

<UserPlus/>

Add Team Member

</button>

}

/>

<div

className="

grid

md:grid-cols-2

xl:grid-cols-3

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

lg:grid-cols-2

gap-6

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

gap-4

"

>

<div>

<h3

className="

text-2xl

font-bold

"

>

{

member.name||

"Team Member"

}

</h3>

<div

className="

flex

items-center

gap-2

text-slate-500

mt-3

"

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

className="

flex

items-center

gap-2

text-slate-500

mt-2

break-all

"

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

className={`

px-4

py-2

rounded-full

flex

items-center

gap-2

font-medium

${

getStatusColor(

member.status

)

}

`}

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

className="

mt-6

pt-5

border-t

border-slate-200

"

>

<div

className="

flex

items-center

gap-2

text-slate-500

"

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