import {

useState

} from "react";

import {

Eye,
EyeOff

} from "lucide-react";

import {

useTheme

} from "../../../context/ThemeContext";


const Input=({

label,
type="text",
placeholder,
name,
value,
onChange,
required=false,
disabled=false,
error="",
helperText="",
icon=null

})=>{

const theme=

useTheme();

const[

showPassword,
setShowPassword

]=useState(false);


const actualType=

type==="password"

?

(

showPassword

?

"text"

:

"password"

)

:

type;


return(

<div

className="w-full"

>

{/* LABEL */}

{

label&&(

<label

htmlFor={name}

className="

block

mb-2

text-sm

font-semibold

text-slate-700

"

>

{

label

}

{

required&&(

<span

className="

text-red-500

ml-1

"

>

*

</span>

)

}

</label>

)

}


{/* INPUT WRAPPER */}

<div

className="relative"

>

{/* ICON */}

{

icon&&(

<div

className="

absolute

left-4

top-1/2

-translate-y-1/2

text-slate-400

"

>

{

icon

}

</div>

)

}


{/* INPUT */}

<input

id={name}

type={actualType}

name={name}

placeholder={placeholder}

value={value}

onChange={onChange}

required={required}

disabled={disabled}

className={`

w-full

py-4

px-5

bg-white

border

rounded-2xl

shadow-sm

text-slate-800

placeholder-slate-400

transition-all

duration-300

outline-none

disabled:opacity-60

disabled:cursor-not-allowed

focus:ring-4

focus:ring-indigo-100

focus:border-indigo-500

hover:border-slate-300

${

icon

?

"pl-12"

:

""

}

${

type==="password"

?

"pr-12"

:

""

}

${

error

?

`

border-red-500

focus:ring-red-100

focus:border-red-500

`

:

`

border-slate-200

`

}

`}

/>


{/* PASSWORD */}

{

type==="password"&&(

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

right-4

top-1/2

-translate-y-1/2

text-slate-400

hover:text-indigo-600

transition-all

"

>

{

showPassword

?

<EyeOff

size={18}

/>

:

<Eye

size={18}

/>

}

</button>

)

}

</div>


{/* ERROR */}

{

error&&(

<p

className="

mt-2

text-sm

text-red-500

font-medium

"

>

{

error

}

</p>

)

}


{/* HELPER */}

{

helperText&&

!error&&(

<p

className="

mt-2

text-sm

text-slate-500

"

>

{

helperText

}

</p>

)

}

</div>

);

};

export default Input;