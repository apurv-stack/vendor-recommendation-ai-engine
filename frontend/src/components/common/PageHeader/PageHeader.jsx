const PageHeader=({

title,
subtitle,
action

})=>{

return(

<div

className="

glass

rounded-[32px]

p-8

flex

justify-between

items-center

gap-6

"

>

<div>

<h1

className="

text-5xl

font-bold

"

>

{title}

</h1>

<p

className="

text-slate-500

mt-2

"

>

{subtitle}

</p>

</div>

{action}

</div>

);

};

export default PageHeader;