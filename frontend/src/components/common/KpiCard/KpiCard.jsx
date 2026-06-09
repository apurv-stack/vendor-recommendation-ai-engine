const KpiCard=({

title,
value,
icon,
color

})=>{

return(

<div

className="

glass

rounded-[28px]

p-6

kpi-card

"

>

<div

className="

flex

justify-between

"

>

<div>

<p>

{title}

</p>

<h2

className="

text-4xl

font-bold

mt-3

"

>

{value}

</h2>

</div>

<div

className={`

${color}

h-14

w-14

rounded-2xl

flex

items-center

justify-center

`}

>

{icon}

</div>

</div>

</div>

);

};

export default KpiCard;