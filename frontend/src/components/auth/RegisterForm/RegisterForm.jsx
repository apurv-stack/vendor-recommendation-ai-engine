import { useState } from "react";

import {
    Building2,
    Shield,
    User
} from "lucide-react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    checkEmailService,
    checkUsernameService,
    registerService
} from "../../../services/authService";

import Input from "../../common/Input/Input";

import i1 from "../../../assets/login/i1.png";

const RegisterForm=()=>{

const navigate=useNavigate();

const[loading,setLoading]=useState(false);
const[success,setSuccess]=useState(false);
const[message,setMessage]=useState("");
const[errors,setErrors]=useState({});

const[formData,setFormData]=useState({
username:"",
full_name:"",
email:"",
business_email:"",
phone_number:"",
role:"user",
password:"",
confirm_password:""
});

const validateField=(name,value)=>{
let error="";
switch(name){
case "username":
if(value&&!/^[a-zA-Z0-9._-]+$/.test(value)){error="Only letters numbers . _ - allowed";}
else if(value&&value.length<3){error="Minimum 3 characters";}
break;
case "full_name":
if(value&&!/^[A-Za-z ]+$/.test(value)){error="Only letters allowed";}
break;
case "email":
case "business_email":
if(value&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)){error="Invalid email";}
break;
case "phone_number":
if(value&&!/^[0-9]*$/.test(value)){error="Digits only";}
else if(value.length>10){error="Maximum 10 digits";}
break;
case "password":
if(value&&value.length<8){error="Minimum 8 characters";}
else if(value&&!/[A-Z]/.test(value)){error="Need uppercase";}
else if(value&&!/[a-z]/.test(value)){error="Need lowercase";}
else if(value&&!/[0-9]/.test(value)){error="Need number";}
else if(value&&!/[\W_]/.test(value)){error="Need special symbol";}
break;
case "confirm_password":
if(value&&value!==formData.password){error="Passwords do not match";}
break;
default:
break;
}
return error;
};

const handleChange=async(e)=>{
const{name,value}=e.target;
let updated=value;
if(name==="phone_number"){updated=value.replace(/[^0-9]/g,"");}
if(name==="full_name"){updated=value.replace(/[^A-Za-z ]/g,"");}
setFormData(prev=>({...prev,[name]:updated}));
let error=validateField(name,updated);
if(name==="username"&&updated.length>=3&&!error){
try{
const response=await checkUsernameService(updated);
if(!response.available){error="Username already exists";}
}catch{}
}
if(name==="email"&&updated&&!error&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updated)){
try{
const response=await checkEmailService(updated);
if(!response.available){error="Email already registered";}
}catch{}
}
setErrors(prev=>({...prev,[name]:error}));
};

const handleSubmit=async(e)=>{
e.preventDefault();
const required=["username","full_name","email","password","confirm_password"];
const newErrors={};
required.forEach((field)=>{if(!formData[field]){newErrors[field]="This field is required";}});
if(formData.role==="vendor"&&!formData.business_email){newErrors["business_email"]="Business email is required";}
if(Object.keys(newErrors).length>0){setErrors(prev=>({...prev,...newErrors}));return;}
const submitErrors={};
Object.keys(formData).forEach((field)=>{const err=validateField(field,formData[field]);if(err)submitErrors[field]=err;});
if(Object.keys(submitErrors).length>0){setErrors(submitErrors);return;}
try{
setLoading(true);
setMessage("");
const cleanedData={...formData,business_email:formData.business_email||null,phone_number:formData.phone_number||null};
const response=await registerService(cleanedData);
setSuccess(true);
setMessage(response.message);
setTimeout(()=>{navigate("/login");},1500);
}catch(error){
setSuccess(false);
setMessage(error?.message||"Registration failed");
}finally{
setLoading(false);
}
};

return (
  <div className="h-screen grid lg:grid-cols-[1.15fr_0.85fr] bg-[#F5F7FD] overflow-hidden">

    {/* LEFT */}
<div className="hidden lg:flex relative overflow-hidden">
  <img src={i1} alt="AI" className="absolute inset-0 w-full h-full object-cover"/>
  <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/85 via-[#111827]/70 to-[#1E1B4B]/70"/>
  <div className="relative z-20 px-10 py-10 flex flex-col justify-center">
    <p className="uppercase tracking-[4px] text-indigo-200 font-bold mb-3 text-xs">
      Enterprise Intelligence
    </p>
    <h1 className="text-[36px] font-black leading-[42px] mb-4">
      <span className="text-white">AI Vendor</span>
      <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">Discovery</span>
      <span className="text-white">Platform</span>
    </h1>
    <p className="text-slate-100 text-sm leading-7 max-w-[420px]">
      Discover vendors, analyze capabilities, benchmark pricing and drive procurement decisions through AI.
    </p>
  </div>
</div>

    {/* RIGHT — full height, scrollable */}
    <div className="h-screen overflow-y-auto flex justify-center items-start bg-[#F5F7FD]">
      <div className="bg-white rounded-[28px] shadow-xl border border-slate-200 w-full max-w-[520px] mx-4 my-6 p-5">

        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex justify-center items-center">
            <Shield size={22} className="text-indigo-600"/>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center">Create Account</h2>
        <p className="text-center text-slate-500 mb-4 text-sm">Setup your workspace</p>

        <form onSubmit={handleSubmit} className="space-y-2">

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={()=>setFormData(prev=>({...prev,role:"user"}))}
              className={`p-2.5 rounded-xl border font-semibold text-sm transition-all ${formData.role==="user"?"bg-indigo-100 border-indigo-500":"bg-white"}`}
            >
              <User size={18} className="mx-auto mb-1"/>
              Register User
            </button>
            <button
              type="button"
              onClick={()=>setFormData(prev=>({...prev,role:"vendor"}))}
              className={`p-2.5 rounded-xl border font-semibold text-sm transition-all ${formData.role==="vendor"?"bg-indigo-100 border-indigo-500":"bg-white"}`}
            >
              <Building2 size={18} className="mx-auto mb-1"/>
              Register Vendor
            </button>
          </div>

          <Input label="Username" name="username" value={formData.username} onChange={handleChange} required/>
          <p className="text-red-500 text-xs -mt-1">{errors.username}</p>

          <Input label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} required/>
          <p className="text-red-500 text-xs -mt-1">{errors.full_name}</p>

          <Input label="Email" name="email" value={formData.email} onChange={handleChange} required/>
          <p className="text-red-500 text-xs -mt-1">{errors.email} </p>

          {formData.role==="vendor"&&(
            <>
              <Input label="Business Email" name="business_email" value={formData.business_email} onChange={handleChange} required/>
              <p className="text-red-500 text-xs -mt-1">{errors.business_email}</p>
            </>
          )}

          <Input label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleChange} required/>
          <p className="text-red-500 text-xs -mt-1">{errors.phone_number}</p>

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            error={errors.confirmPassword}
          />

          <p className="text-red-500 text-xs -mt-1">{errors.confirm_password}</p>

          {message&&(
            <p className={`text-sm ${success?"text-green-600":"text-red-500"}`}>{message}</p>
          )}

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold">
            {loading?"Creating...":"Create Account"}
          </button>

          <p className="text-center text-sm pb-2">
            Already have account?
            <Link to="/login" className="ml-2 font-semibold text-indigo-600">Login</Link>
          </p>

        </form>
      </div>
    </div>

  </div>
);

};

export default RegisterForm;