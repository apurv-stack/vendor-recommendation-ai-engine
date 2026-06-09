import {

useEffect,
useState

} from "react";

import axiosInstance
from "../../../api/axiosInstance";

import Card
from "../../common/Card/Card";

import Button
from "../../common/Button/Button";

import {

Users,
Plus,
Building2

} from "lucide-react";


const InternalTeams=()=>{

const[

teams,
setTeams

]=useState([]);

const[

teamName,
setTeamName

]=useState("");

const[

description,
setDescription

]=useState("");

const[

loading,
setLoading

]=useState(false);

const[

error,
setError

]=useState("");

const[

success,
setSuccess

]=useState("");


// =============================
// FETCH INTERNAL TEAMS
// =============================

useEffect(()=>{

fetchTeams();

},[]);


const fetchTeams=

async()=>{

try{

const response=

await axiosInstance.get(

"/vendors/internal-team"

);

const payload=

response.data?.data||

response.data;

setTeams(

payload?.teams||

[]

);

}

catch(error){

console.log(

"Team fetch failed",

error

);

}

};


// =============================
// CREATE TEAM
// =============================

const createTeam=

async()=>{

setError("");

setSuccess("");


if(

!teamName.trim()

){

setError(

"Team name required"

);

return;

}


try{

setLoading(true);

await axiosInstance.post(

"/vendors/internal-team",

{

name:

teamName,

description:

description

}

);

setSuccess(

"Team created successfully"

);

setTeamName("");

setDescription("");

fetchTeams();

}

catch(error){

setError(

error?.response

?.data

?.message

||

error?.response

?.data

?.detail

||

"Unable to create team"

);

}

finally{

setLoading(false);

}

};


// =============================
// UI
// =============================

return(

<Card>

<div

className="

flex

items-center

gap-3

mb-6

"

>

<Users/>

<h2

className="

font-bold

text-xl

"

>

Internal Teams

</h2>

</div>


<div

className="

grid

md:grid-cols-2

gap-4

mb-5

"

>

<input

placeholder=

"Category Vendor Name"

value={teamName}

onChange={(event)=>

setTeamName(

event.target.value

)

}

className="

border

rounded-xl

p-3

"

/>


<input

placeholder=

"Description"

value={description}

onChange={(event)=>

setDescription(

event.target.value

)

}

className="

border

rounded-xl

p-3

"

/>

</div>


{

error&&(

<p

className="

text-red-500

mb-3

"

>

{error}

</p>

)

}


{

success&&(

<p

className="

text-emerald-600

mb-3

"

>

{success}

</p>

)

}


<Button

onClick={createTeam}

disabled={loading}

icon={<Plus/>}

>

{

loading

?

"Creating..."

:

"Create Team"

}

</Button>


<div

className="

mt-6

space-y-4

"

>

{

!teams.length&&(

<p

className="

text-slate-400

"

>

No category vendors created

</p>

)

}


{

teams.map(

team=>(

<div

key={

team.vendor_id

}

className="

border

rounded-xl

p-5

"

>

<div

className="

flex

items-center

gap-3

mb-2

"

>

<Building2

size={18}

/>

<h3

className="

font-bold

"

>

{

team.name

}

</h3>

</div>


<p

className="

text-slate-500

"

>

{

team.description||

"No description"

}

</p>

</div>

)

)

}

</div>

</Card>

);

};

export default InternalTeams;