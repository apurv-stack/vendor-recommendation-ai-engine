import {

useEffect,
useState

} from "react";

import useAuth
from "../../hooks/useAuth";

import axiosInstance
from "../../api/axiosInstance";

import {

ShieldCheck,
Users,
Building2,
UserCircle2,
Mail,
Sparkles,
Activity

} from "lucide-react";


const AdminPage=()=>{

const{

user

}=useAuth();


const[

stats,
setStats

]=useState({

users:0,
vendors:0,
health:"Healthy"

});


const[

loading,
setLoading

]=useState(true);


// ========================
// FETCH ADMIN METRICS
// ========================

useEffect(()=>{

fetchMetrics();

},[]);


const fetchMetrics=

async()=>{

try{

setLoading(true);

const[

userResponse,
vendorResponse

]=await Promise.all([

axiosInstance.get(

"/admin/users"

),

axiosInstance.get(

"/vendors"

)

]);


const users=

userResponse

.data

?.data

?.users

||

[];


const vendors=

vendorResponse

.data

?.data

?.vendors

||

vendorResponse

.data

?.vendors

||

[];


setStats({

users:

users.length,

vendors:

vendors.length,

health:

"Operational"

});

}

catch(error){

console.log(

"Admin metrics failed",

error

);

setStats({

users:0,
vendors:0,
health:"Operational"

});

}

finally{

setLoading(false);

}

};


const cards=[

{

title:"Users",

value:

loading

?

"..."

:

stats.users,

icon:<Users/>,

bg:"bg-blue-100"

},

{

title:"Vendors",

value:

loading

?

"..."

:

stats.vendors,

icon:<Building2/>,

bg:"bg-violet-100"

},

{

title:"Platform Health",

value:

stats.health,

icon:<Activity/>,

bg:"bg-green-100"

}

];


return(

<div

className="

min-h-screen

bg-gradient-to-br

from-[#F8FAFF]

to-[#EEF2FF]

p-8

"

>

<div

className="

max-w-7xl

mx-auto

space-y-8

"

>

{/* HERO */}

<div

className="

glass

rounded-[32px]

p-8

"

>

<p

className="

text-indigo-500

uppercase

tracking-[3px]

font-semibold

mb-3

"

>

Administrative Center

</p>


<h1

className="

text-5xl

font-bold

mb-3

text-slate-900

"

>

Welcome,

{

user?.full_name||

"Administrator"

}

</h1>


<p

className="

text-slate-500

"

>

Platform monitoring,

vendor intelligence,

and administration.

</p>

</div>


{/* KPI */}

<div

className="

grid

md:grid-cols-3

gap-6

"

>

{

cards.map(

card=>(

<div

key={card.title}

className="

glass

rounded-[28px]

p-6

"

>

<div

className="

flex

justify-between

"

>

<div>

<p

className="

text-slate-500

"

>

{

card.title

}

</p>


<h2

className="

text-4xl

font-bold

mt-3

text-slate-900

"

>

{

card.value

}

</h2>

</div>


<div

className={`

${card.bg}

h-14

w-14

rounded-2xl

flex

items-center

justify-center

text-slate-700

`}

>

{

card.icon

}

</div>

</div>

</div>

)

)

}

</div>


{/* PROFILE */}

<div

className="

glass

rounded-[32px]

p-8

"

>

<div

className="

flex

items-center

gap-4

mb-8

"

>

<div

className="

h-20

w-20

rounded-3xl

bg-indigo-100

flex

items-center

justify-center

"

>

<UserCircle2

size={40}

className="

text-indigo-600

"

/>

</div>


<div>

<h2

className="

text-3xl

font-bold

text-slate-900

"

>

Admin Profile

</h2>


<p

className="

text-slate-500

"

>

Platform Administrator

</p>

</div>

</div>


<div

className="

grid

md:grid-cols-2

gap-6

"

>

<InfoCard

icon={<ShieldCheck/>}

title="Role"

value={

user?.role||

"Admin"

}

/>


<InfoCard

icon={<Mail/>}

title="Email"

value={

user?.email||

"N/A"

}

/>


<InfoCard

icon={<Sparkles/>}

title="Access Level"

value="Full Administrative Control"

/>


<InfoCard

icon={<Activity/>}

title="System Status"

value="Operational"

/>

</div>

</div>

</div>

</div>

);

};


function InfoCard({

icon,
title,
value

}){

return(

<div

className="

glass

rounded-2xl

p-5

"

>

<div

className="

flex

gap-3

items-center

mb-3

"

>

{icon}

{title}

</div>

<p

className="

font-semibold

text-slate-800

"

>

{value}

</p>

</div>

);

}


export default AdminPage;