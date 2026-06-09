import {

loginApi,

registerApi,

logoutApi,

refreshTokenApi,

checkUsernameApi,

checkEmailApi

} from "../api/authApi";


// =====================================
// LOGIN
// =====================================

export const loginService=

async(

loginData

)=>{

try{

return await loginApi(

loginData

);

}

catch(error){

throw(

error.response?.data||

{

detail:

"Login failed"

}

);

}

};


// =====================================
// REGISTER
// =====================================

export const registerService=

async(

registerData

)=>{

try{

return await registerApi(

registerData

);

}

catch(error){

throw(

error.response?.data||

{

detail:

"Registration failed"

}

);

}

};


// =====================================
// LOGOUT
// =====================================

export const logoutService=

async()=>{

try{

return await logoutApi();

}

catch(error){

throw(

error.response?.data||

{

detail:

"Logout failed"

}

);

}

};


// =====================================
// REFRESH TOKEN
// =====================================

export const refreshService=

async()=>{

try{

return await refreshTokenApi();

}

catch(error){

throw(

error.response?.data||

{

detail:

"Refresh failed"

}

);

}

};


// =====================================
// USERNAME CHECK
// =====================================

export const checkUsernameService=

async(

username

)=>{

try{

return await checkUsernameApi(

username

);

}

catch(error){

throw(

error.response?.data||

{

detail:

"Username validation failed"

}

);

}

};


// =====================================
// EMAIL CHECK
// =====================================

export const checkEmailService=

async(

email

)=>{

try{

return await checkEmailApi(

email

);

}

catch(error){

throw(

error.response?.data||

{

detail:

"Email validation failed"

}

);

}

};