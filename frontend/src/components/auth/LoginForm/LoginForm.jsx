import { useState } from "react";

import {
Shield,
Eye,
EyeOff
} from "lucide-react";

import {
Link,
useNavigate
} from "react-router-dom";

import useAuth from "../../../hooks/useAuth";
import { loginApi } from "../../../api/authApi";
import i1 from "../../../assets/login/i1.png";

const LoginForm=()=>{

const navigate=useNavigate();
const{ login }=useAuth();

const[showPassword,setShowPassword]=useState(false);
const[loading,setLoading]=useState(false);
const[error,setError]=useState("");
const[form,setForm]=useState({ email:"", password:"" });

const handleChange=(event)=>{
  setForm(previous=>({...previous,[event.target.name]:event.target.value}));
};

const handleSubmit=async(event)=>{
  event.preventDefault();
  try{
    setLoading(true);
    setError("");
    const response=await loginApi({ identifier:form.email, password:form.password });
    login({ access_token:response.access_token, user:response.user });
    const role = response.user?.role;
    if(role === "admin"){
      navigate("/admin", { replace:true });
    } else {
      navigate("/dashboard", { replace:true });
    }
  }catch(error){
    setError(error?.response?.data?.detail||"Invalid credentials");
  }finally{
    setLoading(false);
  }
};

return(
  <div className="h-screen grid lg:grid-cols-[1.25fr_0.75fr] bg-[#F5F7FD] overflow-hidden">

    {/* LEFT */}
    <div className="hidden lg:flex relative overflow-hidden">

      <img src={i1} alt="AI Vendor" className="absolute inset-0 w-full h-full object-cover opacity-90"/>

      <div className="absolute inset-0 bg-gradient-to-r from-[#050816]/85 via-[#101B45]/70 to-[#1F2560]/60 backdrop-blur-[1px]"/>

      <div className="absolute top-[-120px] left-[-100px] w-[420px] h-[420px] bg-indigo-500/20 blur-[140px] rounded-full"/>
      <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] bg-cyan-500/20 blur-[130px] rounded-full"/>

      <div className="relative z-20 px-10 py-10 flex flex-col justify-center h-full max-w-[680px]">

        <p className="uppercase tracking-[4px] text-indigo-200 font-bold text-xs mb-3">
          Enterprise Intelligence
        </p>

        <h1 className="font-black leading-[1.05] text-[36px] mb-4">
          <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.25)]">AI </span>
          <span className="bg-gradient-to-r from-white via-indigo-300 to-cyan-300 bg-clip-text text-transparent">Vendor</span>
          <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">Discovery</span>
          <span className="text-white"> Platform</span>
        </h1>

        <p className="text-slate-100 text-sm leading-7 max-w-[420px] font-medium">
          Discover vendors, analyze capabilities, benchmark pricing and drive procurement decisions through AI.
        </p>

        <div className="flex flex-wrap gap-3 mt-6">
          {["Smart Analytics","AI Insights","Data Driven"].map(item=>(
            <div
              key={item}
              className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white text-sm font-semibold shadow-[0_0_30px_rgba(129,140,248,0.25)] hover:scale-105 hover:bg-white/15 transition-all duration-300"
            >
              {item}
            </div>
          ))}
        </div>

      </div>
    </div>

    {/* RIGHT */}
    {/* RIGHT */}
<div className="h-screen overflow-y-auto flex justify-center items-center bg-[#F5F7FD]">
  <div className="bg-white/95 backdrop-blur-xl rounded-[28px] border border-slate-200 shadow-xl p-6 w-full max-w-[440px] mx-4">

    <div className="text-center mb-6">
      <div className="h-12 w-12 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-3">
        <Shield size={22} className="text-indigo-600"/>
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
      <p className="text-slate-500 mt-1 text-sm">Login to continue</p>
    </div>

    <form onSubmit={handleSubmit} className="space-y-3">

      <input
        name="email"
        placeholder="Email or Username"
        value={form.email}
        onChange={handleChange}
        required
        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 outline-none transition-all duration-300 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
      />

      <div className="relative">
        <input
          name="password"
          placeholder="Password"
          type={showPassword?"text":"password"}
          value={form.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 outline-none transition-all duration-300 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
        <button
          type="button"
          onClick={()=>setShowPassword(previous=>!previous)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-600 transition-all"
        >
          {showPassword?<EyeOff size={18}/>:<Eye size={18}/>}
        </button>
      </div>

      {error&&(
        <div className="bg-red-50 border border-red-200 text-red-500 rounded-xl px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <button
        disabled={loading}
        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg hover:shadow-indigo-400/40 text-white font-semibold disabled:opacity-70"
      >
        {loading?"Logging In...":"Access Platform"}
      </button>

      <p className="text-center text-slate-500 text-sm">
        Don't have an account?
        <Link to="/register" className="ml-2 text-indigo-600 font-semibold hover:text-indigo-800">
          Create Account
        </Link>
      </p>

    </form>
  </div>
</div>

  </div>
);

};

export default LoginForm;