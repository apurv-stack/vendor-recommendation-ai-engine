import {

BrowserRouter,
Routes,
Route,
Navigate,
useNavigate

} from "react-router-dom";

import LoginPage
from "../pages/Login/LoginPage";

import RegisterPage
from "../pages/Register/RegisterPage";

import DashboardPage
from "../pages/Dashboard/DashboardPage";

import AdminPage
from "../pages/Admin/AdminPage";

import VendorDetailsPage
from "../pages/VendorDetails/VendorDetailsPage";

import ProfilePage
from "../pages/Profile/ProfilePage";

import InternalTeamsPage
from "../pages/InternalTeams/InternalTeamsPage";

import SavedVendorsPage
from "../pages/SavedVendors/SavedVendorsPage";

import RecommendationsPage
from "../pages/Recommendations/RecommendationsPage";

import SettingsPage
from "../pages/Settings/SettingsPage";

import EditProfilePage
from "../pages/EditProfile/EditProfilePage";

import ChatPage
from "../pages/Chat/ChatPage";

import ProtectedRoute
from "../components/auth/ProtectedRoute/ProtectedRoute";

import useAuth
from "../hooks/useAuth";


const UnauthorizedPage=()=>{

const navigate=

useNavigate();

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

rounded-[32px]

p-12

text-center

shadow-xl

"

>

<h1

className="

text-5xl

font-bold

text-red-500

mb-4

"

>

Access Denied

</h1>

<p

className="

text-slate-500

mb-6

"

>

You are not authorized.

</p>

<button

onClick={()=>{

navigate(

"/dashboard"

);

}}

className="

bg-indigo-500

text-white

px-6

py-3

rounded-xl

hover:bg-indigo-600

transition

"

>

Go Dashboard

</button>

</div>

</div>

);

};


const RedirectRoot=()=>{

const{

loading,
isAuthenticated

}=useAuth();


if(

loading

){

return null;

}


return(

<Navigate

replace

to={

isAuthenticated

?

"/dashboard"

:

"/login"

}

/>

);

};


const AppRoutes=()=>{

return(

<BrowserRouter>

<Routes>

<Route

path="/"

element={

<RedirectRoot/>

}

/>


<Route

path="/login"

element={

<LoginPage/>

}

/>


<Route

path="/register"

element={

<RegisterPage/>

}

/>


<Route

path="/dashboard"

element={

<ProtectedRoute

allowedRoles={[

"admin",
"vendor",
"user"

]}

>

<DashboardPage/>

</ProtectedRoute>

}

/>


<Route

path="/admin"

element={

<ProtectedRoute

allowedRoles={[

"admin"

]}

>

<AdminPage/>

</ProtectedRoute>

}

/>


<Route

path="/profile"

element={

<ProtectedRoute

allowedRoles={[

"admin",
"vendor",
"user"

]}

>

<ProfilePage/>

</ProtectedRoute>

}

/>


<Route

path="/profile/edit"

element={

<ProtectedRoute

allowedRoles={[

"admin",
"vendor",
"user"

]}

>

<EditProfilePage/>

</ProtectedRoute>

}

/>


<Route

path="/vendors"

element={

<ProtectedRoute

allowedRoles={[

"admin",
"vendor",
"user"

]}

>

<VendorDetailsPage/>

</ProtectedRoute>

}

/>


<Route

path="/vendors/:vendorId"

element={

<ProtectedRoute

allowedRoles={[

"admin",
"vendor",
"user"

]}

>

<VendorDetailsPage/>

</ProtectedRoute>

}

/>


<Route

path="/internal-teams"

element={

<ProtectedRoute

allowedRoles={[

"vendor"

]}

>

<InternalTeamsPage/>

</ProtectedRoute>

}

/>


<Route

path="/saved-vendors"

element={

<ProtectedRoute

allowedRoles={[

"user",
"vendor"

]}

>

<SavedVendorsPage/>

</ProtectedRoute>

}

/>


<Route

path="/recommendations"

element={

<ProtectedRoute

allowedRoles={[

"user",
"vendor"

]}

>

<RecommendationsPage/>

</ProtectedRoute>

}

/>


<Route

path="/settings"

element={

<ProtectedRoute

allowedRoles={[

"admin",
"vendor",
"user"

]}

>

<SettingsPage/>

</ProtectedRoute>

}

/>


<Route

path="/chat"

element={

<ProtectedRoute

allowedRoles={[

"admin",
"user",
"vendor"

]}

>

<ChatPage/>

</ProtectedRoute>

}

/>


<Route

path="/unauthorized"

element={

<UnauthorizedPage/>

}

/>


<Route

path="*"

element={

<RedirectRoot/>

}

/>

</Routes>

</BrowserRouter>

);

};


export default AppRoutes;