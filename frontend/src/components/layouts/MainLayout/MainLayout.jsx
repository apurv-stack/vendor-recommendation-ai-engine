import {

useState,
useEffect

} from "react";

import Navbar
from "../Navbar/Navbar";

import Sidebar
from "../Sidebar/Sidebar";

import {

useTheme

} from "../../../context/ThemeContext";

const MainLayout=({

children

})=>{

const theme=

useTheme();

const[

sidebarCollapsed,
setSidebarCollapsed

]=useState(false);

const[

mobileSidebar,
setMobileSidebar

]=useState(false);

const[

isMobile,
setIsMobile

]=useState(

window.innerWidth<1024

);

useEffect(()=>{

const handleResize=()=>{

const mobile=

window.innerWidth<1024;

setIsMobile(

mobile

);

if(

!mobile

){

setMobileSidebar(

false

);

}

};

window.addEventListener(

"resize",

handleResize

);

return()=>{

window.removeEventListener(

"resize",

handleResize

);

};

},[]);

const handleSidebarToggle=()=>{

if(

isMobile

){

setMobileSidebar(

previous=>

!previous

);

return;

}

setSidebarCollapsed(

previous=>

!previous

);

};

return(

<div

className={`

min-h-screen

flex

overflow-hidden

relative

${

theme.colors.background

}

`}

>

{

mobileSidebar&&(

<div

onClick={()=>

setMobileSidebar(

false

)

}

className="

fixed

inset-0

bg-black/30

backdrop-blur-sm

z-40

lg:hidden

"

/>

)

}

<Sidebar

sidebarOpen={

mobileSidebar

}

setSidebarOpen={

setMobileSidebar

}

collapsed={

sidebarCollapsed

}

setCollapsed={

setSidebarCollapsed

}

/>

<div

className={`

flex-1

flex

flex-col

transition-all

duration-300

min-w-0

${

sidebarCollapsed

?

"lg:ml-[95px]"

:

"lg:ml-[280px]"

}

`}

>

<Navbar

toggleSidebar={

handleSidebarToggle

}

setSidebarOpen={

setMobileSidebar

}

/>

<main

className="

flex-1

overflow-y-auto

px-6

py-6

md:px-8

lg:px-10

lg:py-8

"

>

<div

className="

max-w-[1550px]

mx-auto

"

>

{

children

}

</div>

</main>

</div>

</div>

);

};

export default MainLayout;