import {

useState,
useEffect

} from "react";

import axiosInstance
from "../../../api/axiosInstance";

import Card
from "../../common/Card/Card";

import Button
from "../../common/Button/Button";

import {

Plus,
Trash2

} from "lucide-react";


const VendorServices=()=>{

const[
services,
setServices
]=useState([]);

const[
serviceName,
setServiceName
]=useState("");

const[
description,
setDescription
]=useState("");

const[
price,
setPrice
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

fetchServices();

},[]);


// ====================
// FETCH SERVICES
// ====================

const fetchServices=

async()=>{

try{

const response=

await axiosInstance.get(

"/vendors/service"

);

const payload=

response.data?.data||

response.data;

setServices(

payload?.services||

[]

);

}

catch(error){

console.log(

"Service fetch failed",

error

);

}

};


// ====================
// VALIDATION
// ====================

const validate=()=>{

if(

!serviceName.trim()

){

return

"Service name required";

}


if(

price&&

Number(price)<0

){

return

"Price cannot be negative";

}


if(

price&&

Number(price)<500

){

return

"Minimum price ₹500";

}

return "";

};


// ====================
// ADD SERVICE
// ====================

const addService=

async()=>{

setError("");

setSuccess("");

const validation=

validate();

if(validation){

setError(

validation

);

return;

}

try{

setLoading(true);

await axiosInstance.post(

"/vendors/service",

{

service_name:

serviceName.trim(),

description:

description.trim(),

price:

price

?

Number(price)

:

null

}

);

setSuccess(

"Service added successfully"

);

setServiceName("");

setDescription("");

setPrice("");

fetchServices();

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

"Unable to add service"

);

}

finally{

setLoading(false);

}

};


// ====================
// DELETE
// ====================

const deleteService=

async(

serviceId

)=>{

try{

await axiosInstance.delete(

`/vendors/service/${serviceId}`

);

fetchServices();

}

catch(error){

console.log(

error

);

}

};


return(

<Card>

<h2

className="

text-xl

font-bold

mb-5

"

>

Manage Services

</h2>


<div

className="

grid

md:grid-cols-3

gap-4

mb-4

"

>

<input

placeholder=

"Service Name"

value={serviceName}

onChange={(event)=>

setServiceName(

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


<input

type="number"

min="500"

placeholder="Price"

value={price}

onChange={(event)=>

setPrice(

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

onClick={addService}

disabled={loading}

icon={<Plus/>}

>

{

loading

?

"Adding..."

:

"Add Service"

}

</Button>


<div

className="

mt-6

space-y-4

"

>

{

!services.length&&(

<p

className="

text-slate-400

"

>

No services added yet

</p>

)

}


{

services.map(

service=>(

<div

key={

service.service_id

}

className="

border

rounded-2xl

p-5

flex

justify-between

"

>

<div>

<h3

className="font-semibold"

>

{

service.service_name

}

</h3>


<p>

{

service.description||

"No description"

}

</p>


<p>

₹{

service.price||

0

}

</p>

</div>


<button

onClick={()=>

deleteService(

service.service_id

)

}

>

<Trash2/>

</button>

</div>

)

)

}

</div>

</Card>

);

};

export default VendorServices;