import {

Search,
X

} from "lucide-react";

import {

useTheme

} from "../../../context/ThemeContext";


const SearchBar=({

value,

onChange,

placeholder="Search...",

onClear,

className=""

})=>{

const theme=

useTheme();


return(

<div

className={`

relative

w-full

${className}

`}

>

{/* SEARCH ICON */}

<Search

size={18}

className="

absolute

left-5

top-1/2

-translate-y-1/2

text-slate-400

z-10

"

/>


{/* INPUT */}

<input

value={value}

onChange={onChange}

placeholder={placeholder}

className={`

w-full

h-[56px]

pl-14

pr-12

bg-white/80

backdrop-blur-xl

border

border-slate-200

rounded-2xl

text-slate-800

placeholder:text-slate-400

shadow-sm

transition-all

duration-300

outline-none

focus:border-indigo-500

focus:ring-4

focus:ring-indigo-100

hover:border-slate-300

${theme.fonts?.body||""}

`}

/>


{/* CLEAR */}

{

value&&(

<button

onClick={onClear}

className="

absolute

right-4

top-1/2

-translate-y-1/2

h-8

w-8

rounded-full

flex

items-center

justify-center

text-slate-400

hover:text-red-500

hover:bg-red-50

transition-all

duration-300

"

>

<X

size={16}

/>

</button>

)

}

</div>

);

};

export default SearchBar;