import { useState } from "react";

import {
Eye,
EyeOff,
Shield,
User,
Building2
} from "lucide-react";

import {
Link,
useNavigate
} from "react-router-dom";

import {
registerService,
checkUsernameService,
checkEmailService
} from "../../../services/authService";

import Input from "../../common/Input/Input";
import Button from "../../common/Button/Button";

import i1 from "../../../assets/login/i1.png";

const RegisterForm=()=>{

const navigate=useNavigate();

const[loading,setLoading]=useState(false);

const[showPassword,setShowPassword]=useState(false);

const[showConfirm,setShowConfirm]=useState(false);

const[success,setSuccess]=useState(false);

const[message,setMessage]=useState("");

const[errors,setErrors]=useState({});

const[formData,setFormData]=useState({

username:"",
full_name:"",
email:"",
business_email:"",
phone_number:"",
role:"user",
password:"",
confirm_password:""

});

const validateField=(name,value)=>{

let error="";

switch(name){

case "username":

if(
value &&
!/^[a-zA-Z0-9._-]+$/.test(value)
){

error="Only letters numbers . _ - allowed";

}

else if(
value &&
value.length<3
){

error="Minimum 3 characters";

}

break;

case "full_name":

if(
value &&
!/^[A-Za-z ]+$/.test(value)
){

error="Only letters allowed";

}

break;

case "email":

case "business_email":

if(
value &&
!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
){

error="Invalid email";

}

break;

case "phone_number":

if(
value &&
!/^[0-9]*$/.test(value)
){

error="Digits only";

}

else if(
value.length>10
){

error="Maximum 10 digits";

}

break;

case "password":

if(
value &&
value.length<8
){

error="Minimum 8 characters";

}

else if(
value &&
!/[A-Z]/.test(value)
){

error="Need uppercase";

}

else if(
value &&
!/[a-z]/.test(value)
){

error="Need lowercase";

}

else if(
value &&
!/[0-9]/.test(value)
){

error="Need number";

}

else if(
value &&
!/[\W_]/.test(value)
){

error="Need special symbol";

}

break;

case "confirm_password":

if(
value &&
value!==formData.password
){

error="Passwords do not match";

}

break;

default:

break;

}

return error;

};

const handleChange=async(e)=>{

const{
name,
value
}=e.target;

let updated=value;

if(name==="phone_number"){

updated=

value.replace(

/[^0-9]/g,

""

);

}

if(name==="full_name"){

updated=

value.replace(

/[^A-Za-z ]/g,

""

);

}

setFormData(prev=>({

...prev,

[name]:updated

}));

let error=

validateField(

name,

updated

);

if(

name==="username"&&

updated.length>=3&&

!error

){

try{

const response=

await checkUsernameService(updated);

if(!response.available){

error="Username already exists";

}

}catch{}

}

if(

name==="email"&&

updated&&

!error

){

try{

const response=

await checkEmailService(updated);

if(!response.available){

error="Email already registered";

}

}catch{}

}

setErrors(prev=>({

...prev,

[name]:error

}));

};

const handleSubmit=async(e)=>{

e.preventDefault();

if(

Object.values(errors)

.some(Boolean)

){

return;

}

try{

setLoading(true);

setMessage("");

const response=

await registerService(formData);

setSuccess(true);

setMessage(response.message);

setTimeout(()=>{

navigate("/login");

},1500);

}

catch(error){

setSuccess(false);

setMessage(

error?.message ||

"Registration failed"

);

}

finally{

setLoading(false);

}

};

return(

<div

className="

min-h-screen

grid

lg:grid-cols-[1.15fr_0.85fr]

bg-[#F5F7FD]

"

>

{/* LEFT */}

<div

className="

hidden

lg:flex

relative

overflow-hidden

"

>

<img

src={i1}

alt="AI"

className="

absolute

inset-0

w-full

h-full

object-cover

"

/>

<div

className="

absolute

inset-0

bg-gradient-to-r

from-[#020617]/85

via-[#111827]/70

to-[#1E1B4B]/70

"

/>

<div

className="

relative

z-20

px-16

py-16

flex

flex-col

justify-center

"

>

<p

className="

uppercase

tracking-[6px]

text-indigo-200

font-bold

mb-6

"

>

Enterprise Intelligence

</p>

<h1

className="

text-[64px]

font-black

leading-[68px]

mb-8

"

>

<span className="text-white">

Vendor

</span>

<span

className="

bg-gradient-to-r

from-indigo-300

via-violet-300

to-cyan-300

bg-clip-text

text-transparent

"

>

Discovery

</span>

<span className="text-white">

Platform

</span>

</h1>

<p

className="

text-slate-100

text-xl

leading-10

max-w-[550px]

"

>

Discover vendors,

analyze capabilities,

benchmark pricing

and drive procurement

decisions through AI.

</p>

</div>

</div>

{/* RIGHT */}

<div

className="

flex

justify-center

items-center

p-6

"

>

<div

className="

bg-white

rounded-[36px]

shadow-xl

border

border-slate-200

w-full

max-w-[700px]

max-h-[92vh]

overflow-y-auto

p-8

"

>

<div className="flex justify-center mb-5">

<div

className="

w-16

h-16

rounded-3xl

bg-indigo-100

flex

justify-center

items-center

"

>

<Shield className="text-indigo-600"/>

</div>

</div>

<h2 className="text-4xl font-bold text-center">

Create Account

</h2>

<p className="text-center text-slate-500 mb-8">

Setup your workspace

</p>

<form
onSubmit={handleSubmit}
className="space-y-4"
>

<div className="grid grid-cols-2 gap-4">

<button
type="button"
onClick={()=>setFormData(prev=>({...prev,role:"user"}))}
className={`

p-4

rounded-2xl

border

font-semibold

transition-all

${

formData.role==="user"

?

"bg-indigo-100 border-indigo-500"

:

"bg-white"

}

`}
>

<User className="mx-auto mb-2"/>

Register User

</button>

<button
type="button"
onClick={()=>setFormData(prev=>({...prev,role:"vendor"}))}
className={`

p-4

rounded-2xl

border

font-semibold

transition-all

${

formData.role==="vendor"

?

"bg-indigo-100 border-indigo-500"

:

"bg-white"

}

`}
>

<Building2 className="mx-auto mb-2"/>

Register Vendor

</button>

</div>

<Input label="Username" name="username" value={formData.username} onChange={handleChange}/>
<p className="text-red-500 text-sm">{errors.username}</p>

<Input label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange}/>
<p className="text-red-500 text-sm">{errors.full_name}</p>

<Input label="Email" name="email" value={formData.email} onChange={handleChange}/>
<p className="text-red-500 text-sm">{errors.email}</p>

{
formData.role==="vendor"&&(
<>
<Input label="Business Email" name="business_email" value={formData.business_email} onChange={handleChange}/>
<p className="text-red-500 text-sm">{errors.business_email}</p>
</>
)
}

<Input label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleChange}/>
<p className="text-red-500 text-sm">{errors.phone_number}</p>

<div className="relative">

<Input
label="Password"
name="password"
type={showPassword?"text":"password"}
value={formData.password}
onChange={handleChange}
/>

<button
type="button"
onClick={()=>setShowPassword(prev=>!prev)}
className="absolute right-4 top-11"
>

{showPassword?<EyeOff/>:<Eye/>}

</button>

</div>

<div className="relative">

<Input
label="Confirm Password"
name="confirm_password"
type={showConfirm?"text":"password"}
value={formData.confirm_password}
onChange={handleChange}
/>

<button
type="button"
onClick={()=>setShowConfirm(prev=>!prev)}
className="absolute right-4 top-11"
>

{showConfirm?<EyeOff/>:<Eye/>}

</button>

</div>

<p className="text-red-500 text-sm">

{errors.confirm_password}

</p>

{
message&&(
<p className={success?"text-green-600":"text-red-500"}>
{message}
</p>
)
}

<button
type="submit"
disabled={loading}
className="w-full bg-indigo-600 text-white py-4 rounded-2xl"
>
{
loading
?
"Creating..."
:
"Create Account"
}
</button>

<p className="text-center">

Already have account?

<Link
to="/login"
className="ml-2 font-semibold text-indigo-600"
>

Login

</Link>

</p>

</form>

</div>

</div>

</div>

);

};

export default RegisterForm;