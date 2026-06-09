import {

Navigate

} from "react-router-dom";

import useAuth from "../../../hooks/useAuth";


const ProtectedRoute=({

children,

allowedRoles=[]

})=>{

const{

isAuthenticated,

loading,

role

}=useAuth();


// =====================================
// SESSION VALIDATION LOADER
// =====================================

if(loading){

return(

<div

className="

min-h-screen

flex

items-center

justify-center

bg-[#F8FAFF]

"

>

<div

className="

glass

rounded-[24px]

px-10

py-8

text-center

"

>

<div

className="

w-10

h-10

border-4

border-indigo-500

border-t-transparent

rounded-full

animate-spin

mx-auto

mb-4

"

/>

<h2

className="

text-lg

font-semibold

text-slate-700

"

>

Validating session...

</h2>

<p

className="

text-slate-500

text-sm

mt-2

"

>

Restoring authentication

</p>

</div>

</div>

);

}


// =====================================
// NOT LOGGED IN
// =====================================

if(

!isAuthenticated

){

return(

<Navigate

to="/login"

replace

/>

);

}


// =====================================
// ROLE PROTECTION
// =====================================

if(

allowedRoles.length>0

&&

(

!role

||

!allowedRoles.includes(

role

)

)

){

return(

<Navigate

to="/unauthorized"

replace

/>

);

}


// =====================================
// AUTHORIZED
// =====================================

return children;

};

export default ProtectedRoute;