import {

Search,
SlidersHorizontal,
RotateCcw,
MapPin,
IndianRupee,
Star,
ChevronDown,
AlertCircle

} from "lucide-react";

import {

useState

} from "react";

import Card
from "../../common/Card/Card";

import Button
from "../../common/Button/Button";

import SearchBar
from "../../common/SearchBar/SearchBar";


const inputClass=`

w-full

bg-white

border

border-slate-200

rounded-2xl

px-5

py-4

text-slate-700

placeholder:text-slate-400

focus:outline-none

focus:ring-4

focus:ring-indigo-100

focus:border-indigo-500

shadow-sm

transition-all

`;


function InputField({

icon,
placeholder,
value,
onChange,
type="text",
min

}){

return(

<div className="relative">

<div

className="

absolute

left-4

top-1/2

-translate-y-1/2

text-slate-400

z-10

"

>

{icon}

</div>

<input

type={type}

min={min}

placeholder={placeholder}

value={value}

onChange={onChange}

className={`

${inputClass}

pl-12

`}

/>

</div>

);

}


const VendorFilters=({

filters,
setFilters,
categories=[],
onSearch,
onReset

})=>{

const[

error,
setError

]=useState("");


const updateField=(

field,
value

)=>{

if(

field==="minPrice"

||

field==="maxPrice"

){

if(

value!==""&&

Number(value)<0

){

setError(

"Price cannot be negative"

);

return;

}

}

setError("");

setFilters(

previous=>({

...previous,

[field]:

value

})

);

};


const validateFilters=()=>{

const min=

Number(

filters.minPrice

);

const max=

Number(

filters.maxPrice

);


if(

min&&

max&&

min>max

){

setError(

"Maximum price must exceed minimum price"

);

return false;

}


if(

filters.rating

&&

(

Number(

filters.rating

)<0

||

Number(

filters.rating

)>5

)

){

setError(

"Rating must be between 0 and 5"

);

return false;

}


setError("");

return true;

};


const handleSearch=()=>{

if(

!validateFilters()

){

return;

}

onSearch();

};


const handleReset=()=>{

setError("");

onReset();

};


return(

<Card>

<div

className="

flex

justify-between

items-center

flex-wrap

gap-5

mb-8

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

h-14

w-14

rounded-2xl

bg-gradient-to-r

from-indigo-500

to-purple-500

flex

items-center

justify-center

"

>

<SlidersHorizontal

size={22}

className="text-white"

/>

</div>

<div>

<p

className="

uppercase

tracking-[3px]

text-xs

font-semibold

text-indigo-600

mb-1

"

>

Marketplace Intelligence

</p>

<h2

className="

text-3xl

font-bold

text-slate-800

"

>

Vendor Filters

</h2>

</div>

</div>

<p

className="

text-sm

text-slate-500

"

>

Refine vendors intelligently

</p>

</div>


<div

className="

grid

grid-cols-1

md:grid-cols-2

xl:grid-cols-4

gap-5

"

>

<SearchBar

value={filters.query}

onChange={(e)=>

updateField(

"query",

e.target.value

)

}

placeholder="Search Vendor"

onClear={()=>

updateField(

"query",

""

)

}

/>


<InputField

icon={<MapPin size={18}/>}

placeholder="City"

value={filters.city}

onChange={(e)=>

updateField(

"city",

e.target.value

)

}

/>


<div className="relative">

<select

value={filters.category}

onChange={(e)=>

updateField(

"category",

e.target.value

)

}

className={`

${inputClass}

appearance-none

pr-12

`}

>

<option value="">

Category

</option>

{

categories.map(

category=>(

<option

key={

category.category_id

}

value={

category.name

}

>

{

category.name

}

</option>

)

)

}

</select>

<ChevronDown

size={18}

className="

absolute

right-4

top-1/2

-translate-y-1/2

text-slate-400

pointer-events-none

"

/>

</div>


<InputField

icon={<IndianRupee size={18}/>}

placeholder="Minimum Price"

type="number"

value={filters.minPrice}

onChange={(e)=>

updateField(

"minPrice",

e.target.value

)

}

/>


<InputField

icon={<IndianRupee size={18}/>}

placeholder="Maximum Price"

type="number"

value={filters.maxPrice}

onChange={(e)=>

updateField(

"maxPrice",

e.target.value

)

}

/>


<div className="relative">

<Star

size={18}

className="

absolute

left-4

top-1/2

-translate-y-1/2

text-yellow-500

z-10

"

/>

<select

value={filters.rating}

onChange={(e)=>

updateField(

"rating",

e.target.value

)

}

className={`

${inputClass}

pl-12

appearance-none

pr-12

`}

>

<option value="">

Rating

</option>

<option value="4">

4+

</option>

<option value="3">

3+

</option>

<option value="2">

2+

</option>

</select>

<ChevronDown

size={18}

className="

absolute

right-4

top-1/2

-translate-y-1/2

text-slate-400

pointer-events-none

"

/>

</div>


<div className="relative">

<select

value={filters.sort}

onChange={(e)=>

updateField(

"sort",

e.target.value

)

}

className={`

${inputClass}

appearance-none

pr-12

`}

>

<option value="">

Sort By

</option>

<option value="rating">

Highest Rated

</option>

<option value="price_low">

Price Low → High

</option>

<option value="price_high">

Price High → Low

</option>

<option value="latest">

Latest Vendors

</option>

</select>

<ChevronDown

size={18}

className="

absolute

right-4

top-1/2

-translate-y-1/2

text-slate-400

pointer-events-none

"

/>

</div>

</div>


{

error&&(

<div

className="

mt-5

flex

items-center

gap-2

text-red-500

font-medium

"

>

<AlertCircle size={18}/>

{error}

</div>

)

}


<div

className="

flex

gap-4

flex-wrap

mt-8

"

>

<Button

onClick={handleSearch}

fullWidth={false}

icon={<Search/>}

>

Search Vendors

</Button>


<Button

variant="outline"

onClick={handleReset}

fullWidth={false}

icon={<RotateCcw/>}

>

Reset

</Button>

</div>

</Card>

);

};

export default VendorFilters;