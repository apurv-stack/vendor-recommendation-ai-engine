import axios from "axios";

let accessToken = null;

let isRefreshing = false;

let failedQueue = [];

const API_TIMEOUT = 35000;

const processQueue = (

error,

token = null

) => {

failedQueue.forEach(

promise => {

if (

error

) {

promise.reject(

error

);

}

else {

promise.resolve(

token

);

}

}

);

failedQueue = [];

};


export const setAccessToken = (

token

) => {

accessToken = token;

};


export const clearAccessToken = () => {

accessToken = null;

};


const axiosInstance = axios.create({

baseURL:

import.meta.env

.VITE_API_BASE_URL,

withCredentials:true,

timeout:

API_TIMEOUT

});


axiosInstance.interceptors.request.use(

config => {

if (

accessToken

) {

config.headers.Authorization =

`Bearer ${accessToken}`;

}

return config;

},

error =>

Promise.reject(

error

)

);


axiosInstance.interceptors.response.use(

response =>

response,

async error => {

const originalRequest =

error?.config;


if (

error?.code ===

"ECONNABORTED"

) {

return Promise.reject(

new Error(

"Request timeout. Please try again."

)

);

}


if (

!error?.response

) {

return Promise.reject(

new Error(

"Backend unreachable."

)

);

}


const status =

error.response.status;


if (
    originalRequest?.url?.includes("/auth/login") ||
    originalRequest?.url?.includes("/auth/register")
) {
    return Promise.reject(error);
}


if (

originalRequest?.url?.includes(

"/auth/refresh"

)

) {

clearAccessToken();

return Promise.reject(

new Error(

"Session expired"

)

);

}


if (

status === 401

&&

!originalRequest._retry

) {

if (

isRefreshing

) {

return new Promise(

(

resolve,

reject

) => {

failedQueue.push({

resolve,

reject

});

}

)

.then(

token => {

originalRequest.headers.Authorization =

`Bearer ${token}`;

return axiosInstance(

originalRequest

);

}

);

}


originalRequest._retry = true;

isRefreshing = true;

try {

const refresh =

await axios.post(

`${

import.meta.env

.VITE_API_BASE_URL

}/auth/refresh`,

{},

{

withCredentials:true,

timeout:

API_TIMEOUT

}

);

const newToken =

refresh.data?.data?.access_token

||

refresh.data?.access_token;


if (

!newToken

) {

throw new Error(

"No access token returned"

);

}


setAccessToken(

newToken

);

processQueue(

null,

newToken

);

originalRequest.headers.Authorization =

`Bearer ${newToken}`;

return axiosInstance(

originalRequest

);

}

catch (

refreshError

) {

processQueue(

refreshError,

null

);

clearAccessToken();

return Promise.reject(

new Error(

"Session expired"

)

);

}

finally {

isRefreshing = false;

}

}


const apiMessage =

error.response?.data?.message

||

error.response?.data?.detail

||

error.response?.data?.error

||

error.response?.data?.error?.details?.[0]?.message

||

"Something went wrong";


return Promise.reject(

new Error(

apiMessage

)

);

}

);


export default axiosInstance;