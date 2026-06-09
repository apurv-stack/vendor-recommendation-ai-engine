import {

createContext,
useEffect,
useState

} from "react";

import axiosInstance,{

setAccessToken,
clearAccessToken

} from "../api/axiosInstance";


export const AuthContext=

createContext();


export const AuthProvider=({

children

})=>{


const[

user,
setUser

]=useState(null);


const[

loading,
setLoading

]=useState(true);


const[

isAuthenticated,
setIsAuthenticated

]=useState(false);


// ====================================
// RESTORE SESSION
// ====================================

const restoreSession=

async()=>{

try{

setLoading(true);


// ALWAYS REFRESH

const refresh=

await axiosInstance.post(

"/auth/refresh"

);


const accessToken=

refresh.data?.data?.access_token||

refresh.data?.access_token;


if(

!accessToken

){

throw Error();

}


setAccessToken(

accessToken

);


const me=

await axiosInstance.get(

"/auth/me"

);


const currentUser=

me.data?.data?.user||

me.data?.user;


if(

!currentUser

){

throw Error();

}


setUser(

currentUser

);


setIsAuthenticated(

true

);

}

catch(error){

clearAccessToken();

setUser(null);

setIsAuthenticated(false);

}

finally{

setLoading(false);

}

};


useEffect(()=>{

restoreSession();

},[]);


// ====================================
// LOGIN
// ====================================

const login=(

authData

)=>{

const token=

authData?.data?.access_token||

authData?.access_token;


const currentUser=

authData?.data?.user||

authData?.user;


if(

!token

){

return;

}


setAccessToken(

token

);


setUser(

currentUser

);


setIsAuthenticated(

true

);

};


// ====================================
// LOGOUT
// ====================================

const logout=

async()=>{

try{

await axiosInstance.post(

"/auth/logout"

);

}

catch(error){

console.log(error);

}


clearAccessToken();

setUser(null);

setIsAuthenticated(false);

};


// ====================================
// PROVIDER
// ====================================

return(

<AuthContext.Provider

value={{

user,

role:user?.role,

loading,

login,

logout,

isAuthenticated

}}

>

{children}

</AuthContext.Provider>

);

};