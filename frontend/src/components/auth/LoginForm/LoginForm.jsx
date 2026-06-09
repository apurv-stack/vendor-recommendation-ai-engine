import { useState } from "react";

import {
Shield,
Eye,
EyeOff,
BarChart3,
Brain,
ShieldCheck
} from "lucide-react";

import {
Link,
useNavigate
} from "react-router-dom";

import useAuth from "../../../hooks/useAuth";

import {
loginApi
} from "../../../api/authApi";

import i1 from "../../../assets/login/i1.png";

const LoginForm=()=>{

const navigate=useNavigate();

const{
login
}=useAuth();

const[
showPassword,
setShowPassword
]=useState(false);

const[
loading,
setLoading
]=useState(false);

const[
error,
setError
]=useState("");

const[
form,
setForm
]=useState({

email:"",
password:""

});

const handleChange=(event)=>{

setForm(previous=>({

...previous,

[event.target.name]:

event.target.value

}));

};

const handleSubmit=async(event)=>{

event.preventDefault();

try{

setLoading(true);

setError("");

const response=

await loginApi({

identifier:
form.email,

password:
form.password

});

login({

access_token:
response.access_token,

user:
response.user

});

navigate(

"/dashboard",

{

replace:true

}

);

}

catch(error){

setError(

error?.response?.data?.detail||

"Invalid credentials"

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

lg:grid-cols-[1.25fr_0.75fr]

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

{/* BACKGROUND IMAGE */}

<img

src={i1}

alt="AI Vendor"

className="

absolute

inset-0

w-full

h-full

object-cover

opacity-90

"

/>

{/* DARK OVERLAY */}

<div

className="

absolute

inset-0

bg-gradient-to-r

from-[#050816]/85

via-[#101B45]/70

to-[#1F2560]/60

backdrop-blur-[1px]

"

/>

{/* GLOW */}

<div

className="

absolute

top-[-120px]

left-[-100px]

w-[420px]

h-[420px]

bg-indigo-500/20

blur-[140px]

rounded-full

"

/>

<div

className="

absolute

bottom-[-120px]

right-[-120px]

w-[350px]

h-[350px]

bg-cyan-500/20

blur-[130px]

rounded-full

"

/>


{/* CONTENT */}

<div

className="

relative

z-20

px-12

xl:px-16

py-14

flex

flex-col

justify-center

h-full

max-w-[680px]

"

>

<p

className="

uppercase

tracking-[6px]

text-indigo-200

font-bold

text-sm

mb-6

drop-shadow-lg

"

>

Enterprise Intelligence

</p>


<h1

className="

font-black

leading-[0.95]

text-[62px]

xl:text-[78px]

mb-6

"

>

<span

className="

text-white

drop-shadow-[0_0_20px_rgba(255,255,255,0.25)]

"

>

AI

</span>

<br/>

<span

className="

bg-gradient-to-r

from-white

via-indigo-300

to-cyan-300

bg-clip-text

text-transparent

drop-shadow-[0_0_25px_rgba(99,102,241,0.6)]

"

>

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

drop-shadow-[0_0_30px_rgba(129,140,248,0.8)]

"

>

Discovery

</span>

<span

className="

text-white

drop-shadow-[0_0_20px_rgba(255,255,255,0.25)]

"

>

Platform

</span>

</h1>


<p

className="

text-slate-100

text-[25px]

leading-10

max-w-xl

font-medium

drop-shadow-lg

"

>

Discover vendors,

analyze capabilities,

benchmark pricing

and drive procurement

decisions through AI.

</p>


<div

className="

flex

flex-wrap

gap-4

mt-10

"

>

{

[

"Smart Analytics",

"AI Insights",

"Data Driven"

]

.map(

item=>(

<div

key={item}

className="

px-6

py-4

rounded-2xl

bg-white/10

backdrop-blur-xl

border

border-white/20

text-white

font-semibold

shadow-[0_0_30px_rgba(129,140,248,0.25)]

hover:scale-105

hover:bg-white/15

transition-all

duration-300

"

>

{item}

</div>

)

)

}

</div>

</div>

</div>


{/* RIGHT */}

<div

className="

flex

justify-center

items-center

p-8

bg-[#F5F7FD]

"

>

<div

className="

bg-white/95

backdrop-blur-xl

rounded-[40px]

border

border-slate-200

shadow-xl

p-10

w-full

max-w-[500px]

"

>

<div

className="

text-center

mb-10

"

>

<div

className="

h-16

w-16

rounded-3xl

bg-indigo-100

flex

items-center

justify-center

mx-auto

mb-5

"

>

<Shield

className="

text-indigo-600

"

/>

</div>

<h2

className="

text-5xl

font-bold

text-slate-900

"

>

Welcome Back

</h2>

<p

className="

text-slate-500

mt-3

"

>

Login to continue

</p>

</div>


<form

onSubmit={handleSubmit}

className="space-y-6"

>

<input

name="email"

placeholder="Email or Username"

value={form.email}

onChange={handleChange}

required

className="

w-full

px-5

py-4

rounded-2xl

border

border-slate-200

bg-white

text-slate-900

placeholder-slate-400

outline-none

transition-all

duration-300

hover:border-indigo-300

focus:border-indigo-500

focus:ring-4

focus:ring-indigo-100

focus:shadow-lg

focus:shadow-indigo-200/40

"

/>

<div className="relative">

<input

name="password"

placeholder="Password"

type={

showPassword

?

"text"

:

"password"

}

value={form.password}

onChange={handleChange}

required

className="

w-full

px-5

py-4

pr-14

rounded-2xl

border

border-slate-200

bg-white

text-slate-900

placeholder-slate-400

outline-none

transition-all

duration-300

hover:border-indigo-300

focus:border-indigo-500

focus:ring-4

focus:ring-indigo-100

focus:shadow-lg

focus:shadow-indigo-200/40

"

/>

<button

type="button"

onClick={()=>

setShowPassword(

previous=>

!previous

)

}

className="

absolute

right-5

top-1/2

-translate-y-1/2

text-slate-500

hover:text-indigo-600

transition-all

"

>

{

showPassword

?

<EyeOff/>

:

<Eye/>

}

</button>

</div>

{

error&&(

<div

className="

bg-red-50

border

border-red-200

text-red-500

rounded-xl

px-4

py-3

"

>

{error}

</div>

)

}

<button

disabled={loading}

className="

w-full

py-4

rounded-2xl

bg-indigo-600

hover:bg-indigo-700

hover:scale-[1.02]

active:scale-[0.98]

transition-all

duration-300

shadow-lg

hover:shadow-indigo-400/40

text-white

font-semibold

disabled:opacity-70

"

>

{

loading

?

"Logging In..."

:

"Access Platform"

}

</button>

<div

className="

text-center

text-slate-500

"

>

Don't have an account?

<Link

to="/register"

className="

ml-2

text-indigo-600

font-semibold

hover:text-indigo-800

"

>

Create Account

</Link>

</div>

</form>

</div>

</div>

</div>

);

};

export default LoginForm;