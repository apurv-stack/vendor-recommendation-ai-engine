import {

useEffect,
useState

} from "react";

import axiosInstance
from "../../../api/axiosInstance";

import Card
from "../../common/Card/Card";

import {

Plus,
Trash2,
FolderTree,
Layers3,
ChevronDown,
ChevronUp,
Pencil,
Check,
X

} from "lucide-react";

const InternalTeams=()=>{

const[
hierarchy,
setHierarchy
]=useState([]);

const[
categoryName,
setCategoryName
]=useState("");

const[
serviceInputs,
setServiceInputs
]=useState({});

const[
expanded,
setExpanded
]=useState({});

const[
editing,
setEditing
]=useState(null);

const[
editValue,
setEditValue
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

useEffect(()=>{

fetchHierarchy();

},[]);

const showMessage=(

message,
type="success"

)=>{

if(type==="error"){

setError(message);
setSuccess("");

}
else{

setSuccess(message);
setError("");

}

setTimeout(()=>{

setError("");
setSuccess("");

},3000);

};

const fetchHierarchy=async()=>{

try{

const response=

await axiosInstance.get(

"/vendors/internal-team"

);

setHierarchy(

response.data?.teams||

[]

);

}
catch{

showMessage(

"Unable to load hierarchy",

"error"

);

}

};

const createCategory=async()=>{

try{

if(

!categoryName.trim()

){

return;

}

setLoading(true);

await axiosInstance.post(

"/vendors/team",

null,

{

params:{

team_name:

categoryName.trim()

}

}

);

setCategoryName("");

showMessage(

"Category created"

);

await fetchHierarchy();

}
catch(error){

showMessage(

error?.response?.data?.detail||

"Unable to create category",

"error"

);

}
finally{

setLoading(false);

}

};

const createService=async(

parentId

)=>{

try{

const value=

serviceInputs[
parentId
];

if(

!value?.trim()

){

return;

}

await axiosInstance.post(

"/vendors/team",

null,

{

params:{

team_name:

value.trim(),

parent_vendor_id:

parentId

}

}

);

setServiceInputs(

previous=>({

...previous,

[parentId]:""

})

);

showMessage(

"Service created"

);

await fetchHierarchy();

}
catch(error){

showMessage(

error?.response?.data?.detail||

"Unable to create service",

"error"

);

}

};

const deleteNode=async(

id,
isService=false

)=>{

try{

const url=

isService

?

`/vendors/service/${id}`

:

`/vendors/${id}`;

await axiosInstance.delete(

url

);

showMessage(

"Deleted successfully"

);

await fetchHierarchy();

}
catch(error){

showMessage(

error?.response?.data?.detail||

"Delete failed",

"error"

);

}

};

const renameNode=async(

id,
isService=false

)=>{

try{

if(

!editValue.trim()

){

return;

}

const url=

isService

?

`/vendors/service/${id}/rename`

:

`/vendors/${id}/rename`;

await axiosInstance.put(

url,

null,

{

params:{

name:

editValue.trim()

}

}

);

showMessage(

"Updated successfully"

);

setEditing(null);

setEditValue("");

await fetchHierarchy();

}
catch(error){

showMessage(

error?.response?.data?.detail||

"Rename failed",

"error"

);

}

};

return(

<Card>

<div
className="
flex
items-center
gap-3
mb-8
"
>

<FolderTree/>

<h2
className="
font-bold
text-2xl
"
>

Vendor Hierarchy

</h2>

</div>

<div
className="
bg-slate-50
rounded-3xl
p-6
mb-8
"
>

<div
className="
flex
gap-3
"
>

<input

value={categoryName}

placeholder="Create Category"

onChange={(e)=>

setCategoryName(

e.target.value

)

}

className="
flex-1
border
rounded-xl
p-4
"

/>

<button

onClick={createCategory}

className="
bg-indigo-600
text-white
px-5
rounded-xl
"

>

<Plus/>

</button>

</div>

</div>

{error&&(

<div
className="
bg-red-100
text-red-700
p-3
rounded-xl
mb-5
"
>

{error}

</div>

)}

{success&&(

<div
className="
bg-green-100
text-green-700
p-3
rounded-xl
mb-5
"
>

{success}

</div>

)}

<div
className="
space-y-5
"
>

{

hierarchy.map(

category=>{

const services=

category.managed_teams||

[];

return(

<div

key={
category.vendor_id
}

className="
border
rounded-3xl
p-6
"

>

<div
className="
flex
justify-between
mb-4
"
>

{

editing===

category.vendor_id

?

<div
className="
flex
gap-2
flex-1
"
>

<input

value={editValue}

onChange={(e)=>

setEditValue(

e.target.value

)

}

className="
border
p-2
rounded
flex-1
"

/>

<button

onClick={()=>

renameNode(

category.vendor_id,

false

)

}

>

<Check/>

</button>

<button

onClick={()=>

setEditing(null)

}

>

<X/>

</button>

</div>

:

<>

<h3>

{category.name}

</h3>

<div
className="
flex
gap-2
"
>

<button

onClick={()=>{

setEditing(

category.vendor_id

);

setEditValue(

category.name

);

}}

>

<Pencil/>

</button>

<button

onClick={()=>

deleteNode(

category.vendor_id,

false

)

}

>

<Trash2/>

</button>

</div>

</>

}

</div>

{

services.map(

service=>(

<div

key={
service.service_id
}

className="
flex
justify-between
bg-slate-50
rounded-xl
p-3
mb-2
"

>

{

editing===

service.service_id

?

<div
className="
flex
gap-2
flex-1
"
>

<input

value={editValue}

onChange={(e)=>

setEditValue(

e.target.value

)

}

className="
border
rounded
p-2
flex-1
"

/>

<button

onClick={()=>

renameNode(

service.service_id,

true

)

}

>

<Check/>

</button>

<button

onClick={()=>

setEditing(null)

}

>

<X/>

</button>

</div>

:

<>

<span>

{service.name}

</span>

<div
className="
flex
gap-2
"
>

<button

onClick={()=>{

setEditing(

service.service_id

);

setEditValue(

service.name

);

}}

>

<Pencil size={14}/>

</button>

<button

onClick={()=>

deleteNode(

service.service_id,

true

)

}

>

<Trash2
size={14}
/>

</button>

</div>

</>

}

</div>

)

)

}

<div
className="
flex
gap-3
mt-4
"
>

<input

value={

serviceInputs[
category.vendor_id
]||

""

}

onChange={(e)=>{

setServiceInputs(

previous=>({

...previous,

[category.vendor_id]:

e.target.value

})

);

}}

className="
border
rounded-xl
p-3
flex-1
"

/>

<button

onClick={()=>

createService(

category.vendor_id

)

}

className="
bg-indigo-600
text-white
px-4
rounded-xl
"

>

+ Add Service

</button>

</div>

</div>

);

}

)

}

</div>

</Card>

);

};

export default InternalTeams;