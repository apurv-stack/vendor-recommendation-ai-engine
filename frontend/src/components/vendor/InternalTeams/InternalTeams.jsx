import {

useEffect,
useState

} from "react";

import axiosInstance
from "../../../api/axiosInstance";

import Card
from "../../common/Card/Card";
import { useTheme }
from "../../../context/ThemeContext";

import {

Plus,
Trash2,
FolderTree,
Pencil,
Check,
X

} from "lucide-react";

const InternalTeams=()=>{
const theme = useTheme();

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
style={{
    display: "flex",
    alignItems: "center",
    gap: "7px",
    marginBottom: "15px"
}}
>

<FolderTree
    size={18}
    color="#7C5AF6"
/>

<h2
style={{
fontWeight: 700,
fontSize: "20px",
color: theme.textPrimary
}}
>

Vendor Hierarchy

</h2>

</div>

<div
style={{
background: theme.cardBg,
border: `1px solid ${theme.cardBorder}`,
borderRadius: "16px",
padding: "16px",
marginBottom: "20px"
}}
>

<div
    className="
        flex
        gap-3
        flex-wrap
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

style={{
flex: 1,
padding: "10px 12px",
background: theme.pageBg,
border: `1px solid ${theme.cardBorder}`,
borderRadius: "12px",
color: theme.textPrimary
}}

/>

<button

onClick={createCategory}

style={{
background: "linear-gradient(135deg,#7C5AF6,#A78BFA)",
color: "#fff",
border: "none",
padding: "10px 14px",
borderRadius: "10px"
}}

>

<Plus/>

</button>

</div>

</div>

{error&&(

<div
style={{
background: "rgba(239,68,68,0.12)",
color: "#EF4444",
padding: "12px",
borderRadius: "12px",
marginBottom: "20px",
border: "1px solid rgba(239,68,68,0.25)"
}}
>

{error}

</div>

)}

{success&&(

<div
style={{
background: "rgba(34,197,94,0.12)",
color: "#22C55E",
padding: "12px",
borderRadius: "12px",
marginBottom: "20px",
border: "1px solid rgba(34,197,94,0.25)"
}}
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

style={{
background: theme.cardBg,
border: `1px solid ${theme.cardBorder}`,
borderRadius: "16px",
padding: "16px"
}}

>

<div
    className="
        flex
        justify-between
        items-center
        mb-4
        gap-2
        flex-wrap
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
setEditValue(e.target.value)
}
style={{
flex: 1,
padding: "10px 12px",
background: theme.pageBg,
border: `1px solid ${theme.cardBorder}`,
borderRadius: "10px",
color: theme.textPrimary
}}
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

<h3
    style={{
        fontSize: "16px",
        fontWeight: 700,
        color: theme.textPrimary
    }}
>
    {category.name}
</h3>

<div
className="
flex
gap-2
"
>

<button
    onClick={() => {
        setEditing(category.vendor_id);
        setEditValue(category.name);
    }}
    style={{
        background: "transparent",
        border: "none",
        color: theme.textMuted,
        cursor: "pointer"
    }}
>
    <Pencil size={16} />
</button>

<button
    onClick={() =>
        deleteNode(
            category.vendor_id,
            false
        )
    }
    style={{
        background: "transparent",
        border: "none",
        color: "#EF4444",
        cursor: "pointer"
    }}
>
    <Trash2 size={16} />
</button>

</div>

</>

}

</div>

{

services.map(

service=>(

<div
    key={service.service_id}
    style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "8px",
        background: theme.panelBg,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: "12px",
        padding: "8px 10px",
        marginBottom: "6px"
    }}
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
    style={{
        flex: 1,
        padding: "10px 12px",
        background: theme.pageBg,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: "10px",
        color: theme.textPrimary
    }}
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

<span
    style={{
        color: theme.textPrimary,
        fontWeight: 500,
        wordBreak: "break-word",
        flex: 1
    }}
>
    {service.name}
</span>

<div
className="
flex
gap-2
"
>

<button
    onClick={() => {
        setEditing(service.service_id);
        setEditValue(service.name);
    }}
    style={{
        background: "transparent",
        border: "none",
        color: theme.textMuted,
        cursor: "pointer"
    }}
>
    <Pencil size={14} />
</button>

<button
    onClick={() =>
        deleteNode(
            service.service_id,
            true
        )
    }
    style={{
        background: "transparent",
        border: "none",
        color: "#EF4444",
        cursor: "pointer"
    }}
>
    <Trash2 size={14} />
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
        mt-3
        flex-wrap
    "
>

<input
placeholder="Add Service"
value={
serviceInputs[
category.vendor_id
] || ""
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

style={{
flex: 1,
padding: "10px 12px",
background: theme.pageBg,
border: `1px solid ${theme.cardBorder}`,
borderRadius: "12px",
color: theme.textPrimary
}}

/>

<button

onClick={()=>
createService(
category.vendor_id
)
}
style={{
padding: "10px 14px",
background:
"linear-gradient(135deg,#7C5AF6,#A78BFA)",
color: "#fff",
border: "none",
borderRadius: "12px",
fontWeight: 600,
cursor: "pointer"
}}
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