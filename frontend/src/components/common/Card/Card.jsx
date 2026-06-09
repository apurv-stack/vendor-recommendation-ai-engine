import { useTheme }
from "../../../context/ThemeContext";

const Card=({

children,
className=""

})=>{

const theme=

useTheme();

return(

<div

className={`

${theme.colors.card}

${theme.radius.card}

${theme.spacing.cardPadding}

${className}

`}

>

{children}

</div>

);

};

export default Card;