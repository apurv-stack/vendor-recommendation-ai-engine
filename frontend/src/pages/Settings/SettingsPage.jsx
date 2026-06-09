import {

useState,
useEffect

} from "react";

import MainLayout
from "../../components/layouts/MainLayout/MainLayout";

import axiosInstance
from "../../api/axiosInstance";

import Loader
from "../../components/common/Loader/Loader";

import PageHeader
from "../../components/common/PageHeader/PageHeader";

import Card
from "../../components/common/Card/Card";

import {

Bell,
Shield,
Moon,
UserCog,
Save

} from "lucide-react";


const STORAGE_KEY=

"vendor_settings";


const SettingsPage=()=>{

const[

loading,
setLoading

]=useState(true);


const[

saving,
setSaving

]=useState(false);


const[

settings,
setSettings

]=useState({

displayName:"",

email:"",

notifications:true,

darkMode:false,

securityAlerts:true

});


// =====================
// FETCH
// =====================

useEffect(()=>{

fetchSettings();

},[]);


const fetchSettings=

async()=>{

try{

setLoading(true);

const response=

await axiosInstance.get(

"/vendors/profile"

);


const vendor=

response.data?.data?.vendor||

response.data?.vendor||

{};


const saved=

JSON.parse(

localStorage.getItem(

STORAGE_KEY

)

||

"{}"

);


setSettings({

displayName:

vendor.name||

"",

email:

vendor.business_email||

"",

notifications:

saved.notifications??

true,

darkMode:

saved.darkMode??

false,

securityAlerts:

saved.securityAlerts??

true

});

}

catch(error){

console.log(

"Settings fetch failed",

error

);

}

finally{

setLoading(false);

}

};


// =====================
// UPDATE FIELD
// =====================

const updateField=(

field,
value

)=>{

setSettings(

previous=>({

...previous,

[field]:

value

})

);

};


// =====================
// SAVE
// =====================

const saveSettings=

async()=>{

try{

setSaving(true);


await axiosInstance.put(

"/vendors/profile",

{

name:

settings.displayName

}

);


localStorage.setItem(

STORAGE_KEY,

JSON.stringify({

notifications:

settings.notifications,

darkMode:

settings.darkMode,

securityAlerts:

settings.securityAlerts

})

);

}

catch(error){

console.log(

"Settings save failed",

error

);

}

finally{

setSaving(false);

}

};


const options=[

{

title:

"Notifications",

icon:

<Bell/>,

field:

"notifications"

},

{

title:

"Light Dashboard",

icon:

<Moon/>,

field:

"darkMode"

},

{

title:

"Security Alerts",

icon:

<Shield/>,

field:

"securityAlerts"

}

];


if(

loading

){

return(

<MainLayout>

<Loader

text="Loading Settings"

/>

</MainLayout>

);

}


return(

<MainLayout>

<div className="space-y-8">

<PageHeader

title="Settings"

subtitle="Manage vendor preferences and platform controls"

/>


<Card>

<div

className="

flex

items-center

gap-3

mb-7

"

>

<UserCog/>

<h2

className="

text-2xl

font-bold

"

>

Profile Preferences

</h2>

</div>


<div

className="

grid

md:grid-cols-2

gap-5

"

>

<input

value={

settings.displayName

}

onChange={(event)=>

updateField(

"displayName",

event.target.value

)

}

placeholder="Display Name"

className="

glass

rounded-2xl

p-4

outline-none

w-full

"

/>


<input

value={

settings.email

}

readOnly

className="

glass

rounded-2xl

p-4

outline-none

w-full

bg-slate-100

"

/>

</div>

</Card>


<Card>

<div className="space-y-5">

{

options.map(

item=>(

<div

key={

item.title

}

className="

flex

justify-between

items-center

glass

rounded-2xl

p-5

"

>

<div

className="

flex

items-center

gap-4

"

>

<div

className="

bg-indigo-100

h-12

w-12

rounded-2xl

flex

items-center

justify-center

text-indigo-600

"

>

{

item.icon

}

</div>

<h3

className="font-semibold"

>

{

item.title

}

</h3>

</div>


<button

onClick={()=>

updateField(

item.field,

!settings[

item.field

]

)

}

className={`

w-16

h-9

rounded-full

relative

transition-all

${

settings[

item.field

]

?

"bg-indigo-500"

:

"bg-slate-300"

}

`}

>

<div

className={`

absolute

top-1

h-7

w-7

bg-white

rounded-full

transition-all

${

settings[

item.field

]

?

"left-8"

:

"left-1"

}

`}

/>

</button>

</div>

)

)

}

</div>

</Card>


<button

onClick={

saveSettings

}

disabled={

saving

}

className="

bg-indigo-500

hover:bg-indigo-600

text-white

font-semibold

rounded-2xl

px-8

py-4

flex

items-center

gap-3

shadow-lg

"

>

{

saving

?

"Saving..."

:

<>

<Save/>

Save Settings

</>

}

</button>

</div>

</MainLayout>

);

};


export default SettingsPage;