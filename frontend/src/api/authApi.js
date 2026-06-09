import axiosInstance from "./axiosInstance";


// ====================================
// LOGIN
// ====================================

export const loginApi = async (

loginData

)=>{

const response=

await axiosInstance.post(

"/auth/login",

loginData

);

return response.data;

};


// ====================================
// REGISTER
// ====================================

export const registerApi = async (

registerData

)=>{

const response=

await axiosInstance.post(

"/auth/register",

registerData

);

return response.data;

};


// ====================================
// LOGOUT
// ====================================

export const logoutApi = async ()=>{

const response=

await axiosInstance.post(

"/auth/logout"

);

return response.data;

};


// ====================================
// REFRESH TOKEN
// ====================================

export const refreshTokenApi=

async()=>{

const response=

await axiosInstance.post(

"/auth/refresh"

);

return response.data;

};


// ====================================
// CHECK USERNAME
// ====================================

export const checkUsernameApi=

async(

username

)=>{

const response=

await axiosInstance.get(

`/auth/check-username/${username}`

);

return response.data;

};


// ====================================
// CHECK EMAIL
// ====================================

export const checkEmailApi=

async(

email

)=>{

const response=

await axiosInstance.get(

`/auth/check-email/${email}`

);

return response.data;

};