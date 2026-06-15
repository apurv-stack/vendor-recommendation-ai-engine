import {

Component

} from "react";

import Button
from "../Button/Button";

import {

AlertTriangle,
RefreshCw

} from "lucide-react";


class ErrorBoundary extends Component{

constructor(props){

super(props);

this.state={

hasError:false,
error:null

};

}


static getDerivedStateFromError(

error

){

return{

hasError:true,
error

};

}


componentDidCatch(

error,
errorInfo

){

console.error(

"Application Error:",

error,

errorInfo

);

}


handleRefresh=()=>{

window.location.reload();

};


render(){

if(

this.state.hasError

){

return(

<div

className="

min-h-screen

bg-gradient-to-br

from-[#F8FAFF]

via-[#F4F7FC]

to-[#EEF2FF]

flex

items-center

justify-center

p-6

"

>

<div

className="

relative

overflow-hidden

bg-white/80

backdrop-blur-xl

border

border-slate-200

rounded-[28px]

p-7

max-w-xl

w-full

shadow-[0_20px_60px_rgba(0,0,0,0.08)]

"

>

{/* GLOW */}

<div

className="

absolute

-top-20

-right-20

w-56

h-56

bg-red-400/10

rounded-full

blur-3xl

"

/>


<div

className="

relative

z-10

text-center

"

>

<div

className="

mx-auto

mb-4

w-16

h-16

rounded-2xl

bg-red-100

flex

items-center

justify-center

"

>

<AlertTriangle

size={28}

className="

text-red-500

"

/>

</div>


<p

className="

uppercase

tracking-[3px]

text-xs

font-semibold

text-indigo-500

mb-3

"

>

System Exception

</p>


<h1

className="

text-2xl

font-bold

text-slate-800

mb-4

"

>

Something Went Wrong

</h1>


<p

className="

text-slate-500

leading-7

mb-5

max-w-lg

mx-auto

text-sm

"

>

An unexpected error occurred while processing the application.

Please refresh the page and try again.

</p>


<div

className="

flex

justify-center

"

>

<Button

onClick={

this.handleRefresh

}

icon={

<RefreshCw

size={18}

/>

}

fullWidth={false}

>

Refresh Application

</Button>

</div>


{

import.meta.env.DEV&&(

<div

className="

mt-5

bg-slate-50

rounded-2xl

border

border-slate-200

p-4

overflow-auto

text-left

"

>

<p

className="

font-semibold

text-red-500

mb-3

"

>

Development Error

</p>


<pre

className="

text-sm

text-slate-700

whitespace-pre-wrap

"

>

{

this.state.error

?.toString()

}

</pre>

</div>

)

}

</div>

</div>

</div>

);

}

return(

this.props.children

);

}

}

export default ErrorBoundary;