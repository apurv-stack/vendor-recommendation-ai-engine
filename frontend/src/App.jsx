import AppRoutes from "./routes/AppRoutes";

import {

ThemeProvider

} from "./context/ThemeContext";

import "@fontsource/inter/400.css";

import "@fontsource/inter/500.css";

import "@fontsource/inter/600.css";

import "@fontsource/inter/700.css";

import "./index.css";


function App(){

return(

<div

className="

font-sans
antialiased

"

>

<ThemeProvider>

<AppRoutes/>

</ThemeProvider>

</div>

);

}


export default App;