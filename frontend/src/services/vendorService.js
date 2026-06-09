import axiosInstance from "../api/axiosInstance"


// ===================================
// SEARCH VENDORS
// ===================================

export const searchVendors = async (

filters={}

)=>{

try{

const response=

await axiosInstance.get(

"/vendors/search",

{

params:filters

}

)

return response.data

}

catch(error){

console.error(

"Vendor search failed",

error

)

throw error

}

}


// ===================================
// GET ALL VENDORS
// ===================================

export const getAllVendors=

async()=>{

try{

const response=

await axiosInstance.get(

"/vendors/"

)

return response.data

}

catch(error){

console.error(

"Fetch vendors failed",

error

)

throw error

}

}


// ===================================
// GET VENDOR PROFILE
// ===================================

export const getVendorProfile=

async()=>{

try{

const response=

await axiosInstance.get(

"/vendors/profile"

)

return response.data

}

catch(error){

console.error(

"Vendor profile failed",

error

)

throw error

}

}


// ===================================
// UPDATE PROFILE
// ===================================

export const updateVendorProfile=

async(data)=>{

try{

const response=

await axiosInstance.put(

"/vendors/profile",

data

)

return response.data

}

catch(error){

console.error(

"Update profile failed",

error

)

throw error

}

}


// ===================================
// GET SINGLE VENDOR
// ===================================

export const getVendorById=

async(

vendorId

)=>{

try{

const response=

await axiosInstance.get(

`/vendors/${vendorId}`

)

return response.data

}

catch(error){

console.error(

"Vendor detail failed",

error

)

throw error

}

}


// ===================================
// CREATE INTERNAL TEAM
// ===================================

export const createInternalTeam=

async(

payload

)=>{

try{

const response=

await axiosInstance.post(

"/vendors/internal-team",

payload

)

return response.data

}

catch(error){

console.error(

"Create team failed",

error

)

throw error

}

}


// ===================================
// GET INTERNAL TEAMS
// ===================================

export const getInternalTeams=

async()=>{

try{

const response=

await axiosInstance.get(

"/vendors/internal-team"

)

return response.data

}

catch(error){

console.error(

"Internal teams failed",

error

)

throw error

}

}


// ===================================
// CREATE SERVICE
// ===================================

export const createVendorService=

async(

payload

)=>{

try{

const response=

await axiosInstance.post(

"/vendors/service",

payload

)

return response.data

}

catch(error){

console.error(

"Create service failed",

error

)

throw error

}

}


// ===================================
// GET SERVICES
// ===================================

export const getVendorServices=

async()=>{

try{

const response=

await axiosInstance.get(

"/vendors/service"

)

return response.data

}

catch(error){

console.error(

"Vendor services failed",

error

)

throw error

}

}


// ===================================
// DELETE SERVICE
// ===================================

export const deleteVendorService=

async(

serviceId

)=>{

try{

const response=

await axiosInstance.delete(

`/vendors/service/${serviceId}`

)

return response.data

}

catch(error){

console.error(

"Delete service failed",

error

)

throw error

}

}


// ===================================
// RECENTLY VIEWED
// ===================================

export const getRecentlyViewed=

async()=>{

try{

const response=

await axiosInstance.get(

"/vendors/recent"

)

return response.data

}

catch(error){

console.error(

"Recent vendors failed",

error

)

throw error

}

}