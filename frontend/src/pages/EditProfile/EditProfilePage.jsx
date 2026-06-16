import {

useEffect,
useState

} from "react";
import { useTheme } from "../../context/ThemeContext";
import {

useNavigate

} from "react-router-dom";

import axiosInstance
from "../../api/axiosInstance";

import MainLayout
from "../../components/layouts/MainLayout/MainLayout";

import Loader
from "../../components/common/Loader/Loader";

import PageHeader
from "../../components/common/PageHeader/PageHeader";

import Card
from "../../components/common/Card/Card";

import Button
from "../../components/common/Button/Button";

import {

FaArrowLeft,
FaSave,
FaBuilding,
FaEnvelope,
FaMapMarkerAlt,
FaPhone,
FaGlobe,
FaRupeeSign

} from "react-icons/fa";


const inputClass=`

w-full
bg-white
border
border-slate-200
rounded-2xl
pl-12
pr-5
py-4
outline-none
shadow-sm
transition-all
duration-300
focus:ring-4
focus:ring-indigo-100
focus:border-indigo-500

`;


const InputField = ({
    label,
    name,
    icon,
    type = "text",
    value,
    onChange,
    error,
    theme
}) => (

    <div>

        <label
            style={{
                fontWeight: 600,
                color: theme.textPrimary,
                marginBottom: "8px",
                display: "block"
            }}
        >
            {label}
        </label>

        <div
            style={{
                position: "relative"
            }}
        >

            <div
                style={{
                    position: "absolute",
                    left: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: theme.textMuted
                }}
            >
                {icon}
            </div>

            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                style={{
                    width: "100%",
                    background: theme.panelBg,
                    boxSizing: "border-box",
                    border: error
                        ? "1px solid #EF4444"
                        : `1px solid ${theme.cardBorder}`,
                    borderRadius: "16px",
                    padding: "10px 14px 10px 40px",
                    color: theme.textPrimary,
                    outline: "none",
                    fontSize: "14px"
                }}
            />

        </div>

        {error && (

            <p
                style={{
                    color: "#EF4444",
                    fontSize: "14px",
                    marginTop: "6px"
                }}
            >
                {error}
            </p>

        )}

    </div>

);

const EditProfilePage=()=>{

    const theme = useTheme();

const navigate=

useNavigate();


const[

loading,
setLoading

]=useState(false);


const[

fetching,
setFetching

]=useState(true);


const[

errors,
setErrors

]=useState({});

const[
apiError,
setApiError
]=useState("");

const[

formData,
setFormData

]=useState({

name:"",
business_email:"",
city:"",
contact_phone:"",
website:"",
description:"",
price_min:"",
price_max:""

});


useEffect(()=>{

fetchProfile();

},[]);


const fetchProfile=

async()=>{

try{

setFetching(true);

const response=

await axiosInstance.get(

"/vendors/profile"

);

const vendor=

response.data?.data?.vendor||

response.data?.vendor||

{};


setFormData({

name:

vendor.name||

"",

business_email:

vendor.business_email||

"",

city:

vendor.city||

"",

contact_phone:

vendor.contact_phone||

"",

website:

vendor.website||

"",

description:

vendor.description||

"",

price_min:

vendor.price_min||

"",

price_max:

vendor.price_max||

""

});

}

catch(error){

setApiError(

error?.response?.data?.detail ||

"Failed to load profile"

);

}

finally{

setFetching(false);

}

};


const validate=(

name,
value

)=>{

let message="";


if(

name==="name"

&&

/[^a-zA-Z0-9\s]/.test(value)

){

message=

"Special characters not allowed";

}


if(

name==="business_email"

&&

value

&&

!/^[^\s@]+@[^\s@]+\.[^\s@]+$/

.test(value)

){

message=

"Invalid email";

}


if(

name==="contact_phone"

&&

value

&&

!/^[0-9]{10}$/

.test(value)

){

message=

"Phone must contain 10 digits";

}


if(

(

name==="price_min"

||

name==="price_max"

)

&&

Number(value)<0

){

message=

"Price cannot be negative";

}


setErrors(

previous=>({

...previous,

[name]:

message

})

);

};


const handleChange=(

event

)=>{

const{

name,
value

}=event.target;

validate(

name,
value

);

setFormData(

previous=>({

...previous,

[name]:

value

})

);

};


const handleSubmit=

async(

event

)=>{

event.preventDefault();


if(

Number(

formData.price_min

)

>

Number(

formData.price_max

)

){

setErrors(

previous=>({

...previous,

price_max:

"Maximum price must exceed minimum"

})

);

return;

}


if(

Object.values(

errors

).some(Boolean)

){

return;

}


try{

setLoading(true);

await axiosInstance.put(

"/vendors/profile",

formData

);

navigate(

"/profile"

);

}

catch(error){

setApiError(

error?.response?.data?.detail ||

"Failed to update profile"

);

}

finally{

setLoading(false);

}

};


if(fetching){

return(

<MainLayout>

<Loader

text="Loading Profile"

/>

</MainLayout>

);

}


return(

<MainLayout>

<div
    className="
        max-w-6xl
        mx-auto
        space-y-6
        px-4
        sm:px-6
        lg:px-8
    "
>

<PageHeader

title="Edit Profile"

subtitle="Manage vendor information"

/>


{apiError && (
    <div
        style={{
            padding: "10px 14px",
            borderRadius: "12px",
            background: "rgba(239,68,68,0.10)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#EF4444",
            fontSize: "13px",
            fontWeight: 500
        }}
    >
        {apiError}
    </div>
)}

<Card
    style={{
        background: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`
    }}
>
<div
    className="
        flex
        justify-end
        mb-4
    "
>
    <Button
        variant="outline"
        icon={<FaArrowLeft />}
        onClick={() => navigate("/profile")}
        style={{ minHeight: "40px" }}
    >
        Back
    </Button>
</div>
<form
onSubmit={handleSubmit}
className="space-y-5"
>
<div
    className="
        grid
        md:grid-cols-2
        gap-4
        md:gap-6
    "
>

<InputField
    theme={theme}
    label="Company Name"
    name="name"
    icon={<FaBuilding />}
    value={formData.name}
    onChange={handleChange}
    error={errors.name}
/>

<InputField
    theme={theme}
    label="Business Email"
    name="business_email"
    icon={<FaEnvelope />}
    value={formData.business_email}
    onChange={handleChange}
    error={errors.business_email}
/>

<InputField
    theme={theme}
    label="City"
    name="city"
    icon={<FaMapMarkerAlt />}
    value={formData.city}
    onChange={handleChange}
/>

<InputField
    theme={theme}
    label="Phone"
    name="contact_phone"
    icon={<FaPhone />}
    value={formData.contact_phone}
    onChange={handleChange}
    error={errors.contact_phone}
/>

<InputField
    theme={theme}
    label="Website"
    name="website"
    icon={<FaGlobe />}
    value={formData.website}
    onChange={handleChange}
/>

<InputField
    theme={theme}
    label="Minimum Price"
    name="price_min"
    type="number"
    icon={<FaRupeeSign />}
    value={formData.price_min}
    onChange={handleChange}
    error={errors.price_min}
/>

<InputField
    theme={theme}
    label="Maximum Price"
    name="price_max"
    type="number"
    icon={<FaRupeeSign />}
    value={formData.price_max}
    onChange={handleChange}
    error={errors.price_max}
/>

<div className="md:col-span-2">

    <label
        style={{
            fontWeight: 600,
            color: theme.textPrimary,
            marginBottom: "8px",
            display: "block"
        }}
    >
        Description
    </label>

    <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        rows={5}
        style={{
            width: "100%",
            background: theme.panelBg,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: "16px",
            padding: "10px 14px",
            color: theme.textPrimary,
            resize: "vertical",
            fontSize: "14px"
        }}
    />

</div>

</div>
<div style={{ width: "100%" }}>
    <Button
        type="submit"
        loading={loading}
        icon={<FaSave />}
        style={{ width: "100%" }}
    >
        Save Changes
    </Button>
</div>
</form>
</Card>
</div>
</MainLayout>
);
};
export default EditProfilePage;