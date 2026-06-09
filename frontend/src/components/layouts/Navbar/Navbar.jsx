import {
Menu,
Bell,
Search,
ChevronDown,
Users,
Eye
} from "lucide-react";

import {
useState,
useEffect,
useRef
} from "react";

import {
useNavigate
} from "react-router-dom";

import axiosInstance
from "../../../api/axiosInstance";

import useAuth
from "../../../hooks/useAuth";

const Navbar=({

toggleSidebar

})=>{

const{

user,
logout

}=useAuth();

const navigate=

useNavigate();

const[

profileOpen,
setProfileOpen

]=useState(false);

const[

notificationOpen,
setNotificationOpen

]=useState(false);

const[

followers,
setFollowers

]=useState(0);

const[

views,
setViews

]=useState(0);

const[

notifications,
setNotifications

]=useState([]);

const[

loadingNotifications,
setLoadingNotifications

]=useState(false);

const profileRef=

useRef(null);

const notificationRef=

useRef(null);


useEffect(()=>{

fetchNavbarData();

fetchNotifications();

},[]);


const fetchNavbarData=

async()=>{

try{

const response=

await axiosInstance.get(

"/vendors/profile/views"

);

setViews(

response.data?.views||0

);

setFollowers(

response.data?.followers||0

);

}

catch(error){

console.log(

error

);

}

};


const fetchNotifications=

async()=>{

try{

setLoadingNotifications(

true

);

const response=

await axiosInstance.get(

"/vendors/notifications"

);

setNotifications(

response.data?.notifications||

[]

);

}

catch(error){

console.log(

error

);

}

finally{

setLoadingNotifications(

false

);

}

};


const markRead=

async(

notificationId

)=>{

try{

await axiosInstance.put(

`/vendors/notifications/${notificationId}`

);

setNotifications(

previous=>

previous.map(

item=>

item.notification_id===notificationId

?

{

...item,

is_read:true

}

:

item

)

);

}

catch(error){

console.log(error);

}

};


useEffect(()=>{

const close=(event)=>{

if(

profileRef.current&&

!profileRef.current.contains(

event.target

)

){

setProfileOpen(false);

}

if(

notificationRef.current&&

!notificationRef.current.contains(

event.target

)

){

setNotificationOpen(false);

}

};

document.addEventListener(

"mousedown",

close

);

return()=>{

document.removeEventListener(

"mousedown",

close

);

};

},[]);


const unreadCount=

notifications.filter(

item=>

!item.is_read

).length;


const acronym=(

user?.full_name||

user?.username||

"Vendor"

)

.split(" ")

.map(

word=>word[0]

)

.join("")

.slice(0,2)

.toUpperCase();


return(

<header

className="

sticky
top-0
z-30

bg-white/80
backdrop-blur-xl

border-b
border-slate-200

px-8
py-5

flex
items-center
justify-between

"

>

<div

className="

flex
items-center
gap-5

"

>

<button

onClick={toggleSidebar}

className="

h-14
w-14

rounded-2xl

bg-white

border
border-slate-200

shadow-sm

flex
items-center
justify-center

hover:bg-slate-50

"

>

<Menu size={22}/>

</button>


<div>

<p

className="

uppercase

tracking-[4px]

text-xs

text-indigo-500

font-semibold

mb-1

"

>

Enterprise Suite

</p>

<h1

className="

text-[18px]

font-bold

leading-tight

"

>

AI Vendor

<br/>

Discovery

</h1>

</div>

</div>


<div

className="

hidden
lg:flex

flex-1

justify-center

px-10

"

>

<div

className="

relative

w-full

max-w-2xl

"

>

<Search

size={18}

className="

absolute

left-5
top-4

text-slate-400

"

/>

<input

placeholder=

"Search vendors categories services"

className="

w-full

pl-14
pr-5
py-4

rounded-2xl

border

border-slate-200

outline-none

focus:ring-2

focus:ring-indigo-200

"

/>

</div>

</div>


<div

className="

flex
items-center
gap-4

"

>

<div

className="

hidden
xl:flex

items-center
gap-3

bg-indigo-50

px-5
py-3

rounded-2xl

"

>

<Users size={18}/>

<div>

<p

className="font-bold"

>

{followers}

</p>

<p

className="text-xs"

>

Followers

</p>

</div>

</div>


<div

className="

hidden
xl:flex

items-center
gap-3

bg-green-50

px-5
py-3

rounded-2xl

"

>

<Eye size={18}/>

<div>

<p

className="font-bold"

>

{views}

</p>

<p

className="text-xs"

>

Views

</p>

</div>

</div>


<div

ref={notificationRef}

className="relative"

>

<button

onClick={()=>{

setNotificationOpen(

previous=>!previous

);

setProfileOpen(false);

}}

className="

relative

h-14
w-14

border

border-slate-200

rounded-2xl

bg-white

shadow-sm

flex
items-center
justify-center

"

>

<Bell size={20}/>

{

unreadCount>0&&(

<div

className="

absolute

top-2
right-2

h-5
w-5

rounded-full

bg-red-500

text-white

text-[10px]

font-bold

flex

items-center

justify-center

"

>

{

unreadCount

}

</div>

)

}

</button>


{

notificationOpen&&(

<div

className="

absolute

right-0
top-16

w-80

bg-white

rounded-3xl

shadow-xl

border

p-5

z-50

"

>

<h3

className="font-bold mb-4"

>

Notifications

</h3>

{

loadingNotifications

?

<p>

Loading...

</p>

:

notifications.length

?

notifications.map(

item=>(

<div

key={

item.notification_id

}

onClick={()=>

markRead(

item.notification_id

)

}

className="

p-3

border-b

cursor-pointer

hover:bg-slate-50

rounded-lg

"

>

<p>

{item.title}

</p>

<p

className="

text-sm

text-slate-500

"

>

{item.message}

</p>

</div>

)

)

:

<p>

No notifications

</p>

}

</div>

)

}

</div>


<div

ref={profileRef}

className="relative"

>

<button

onClick={()=>{

setProfileOpen(

previous=>!previous

);

setNotificationOpen(false);

}}

className="

bg-white

border

border-slate-200

rounded-2xl

px-4
py-2

flex

items-center

gap-3

shadow-sm

"

>

<div

className="

h-12
w-12

rounded-full

bg-indigo-600

text-white

font-bold

flex

items-center

justify-center

"

>

{acronym}

</div>


<div

className="

hidden
md:block

text-left

"

>

<p

className="font-semibold"

>

{

user?.full_name||

"Vendor"

}

</p>

<p

className="

text-sm

text-slate-500

"

>

@

{

user?.username||

"user"

}

</p>

</div>


<ChevronDown

size={18}

className={`

transition-transform

${

profileOpen

?

"rotate-180"

:

""

}

`}

/>

</button>


{

profileOpen&&(

<div

className="

absolute

right-0
top-16

w-56

bg-white

rounded-3xl

shadow-xl

border

border-slate-200

p-2

flex

flex-col

gap-1

z-50

"

>

<button

onClick={()=>{

navigate(

"/profile"

);

setProfileOpen(false);

}}

className="

text-left

px-4
py-3

rounded-xl

hover:bg-slate-100

"

>

Profile

</button>


<button

onClick={()=>{

navigate(

"/settings"

);

setProfileOpen(false);

}}

className="

text-left

px-4
py-3

rounded-xl

hover:bg-slate-100

"

>

Settings

</button>


<button

onClick={()=>{

logout();

navigate(

"/login"

);

}}

className="

text-left

px-4
py-3

rounded-xl

text-red-500

hover:bg-red-50

"

>

Logout

</button>

</div>

)

}

</div>

</div>

</header>

);

};

export default Navbar;