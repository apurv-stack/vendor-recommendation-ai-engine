import {

useEffect,
useRef,
useState,
useCallback

} from "react";

import {

sendMessage

} from "../../api/chatApi";

import {

getSessionHistory

} from "../../api/sessionApi";

import RecommendationCard from "./RecommendationCard";


const MAX_MESSAGE_LENGTH=500;

const STORAGE_KEY="vendor_chat_session";

const WELCOME_MESSAGE={

role:"assistant",

text:

"Hello 👋 Tell me your event requirements and I'll help find vendors.",

recommendations:[]

};


const ChatWindow=({

selectedSessionId,

onSessionCreated

})=>{

const [

messages,
setMessages

]=useState(

[WELCOME_MESSAGE]

);

const [

input,
setInput

]=useState("");

const [

loading,
setLoading

]=useState(false);

const [
    sessionId,
    setSessionId
] = useState(null);

const [

error,
setError

]=useState(null);

const bottomRef=useRef(null);

const inputRef=useRef(null);

const sendingRef=useRef(false);


useEffect(

()=>{

bottomRef.current?.scrollIntoView({

behavior:"smooth"

});

},

[

messages,
loading

]

);


useEffect(

()=>{

inputRef.current?.focus();

},

[]

);

useEffect(
    ()=>{
        // New chat — clear everything
        if(selectedSessionId === null){
            setMessages([WELCOME_MESSAGE]);
            setSessionId(null);
            localStorage.removeItem(STORAGE_KEY);
            setInput("");
            setError(null);
            return;
        }
        // ← ADD THIS GUARD
        if (selectedSessionId === sessionId) return;

        // Load existing session history
        const loadHistory=async()=>{
            try{
                const history=
                await getSessionHistory(
                    selectedSessionId
                );
                const loadedMessages=[
                    WELCOME_MESSAGE
                ];
                history.forEach(
                    item=>{
                        loadedMessages.push({
                            role:"user",
                            text:item.user_message
                        });
                        loadedMessages.push({
                            role:"assistant",
                            text:item.ai_response,
                            recommendations:[],
                            responseType:"chat"
                        });
                    }
                );
                setMessages(loadedMessages);
                setSessionId(selectedSessionId);
            }
            catch(error){
                console.error(
                    "Failed to load history",
                    error
                );
            }
        };
        loadHistory();
    },
    [selectedSessionId]
);


const appendMessage=useCallback(

(

message

)=>{

setMessages(

prev=>[

...prev,

message

]

);

},

[]

);

const handleNewChat = () => {

    setMessages([
        WELCOME_MESSAGE
    ]);

    setSessionId(null);

    localStorage.removeItem(
        STORAGE_KEY
    );

    setInput("");

    setError(null);

};

const handleSend=async()=>{

const trimmed=input.trim();

if(

!trimmed

||

loading

||

sendingRef.current

){

return;

}

if(

trimmed.length>

MAX_MESSAGE_LENGTH

){

setError(

`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`

);

return;

}

sendingRef.current=true;

setError(null);

appendMessage({

role:"user",

text:trimmed

});

setInput("");

setLoading(true);

try{

const result=

await sendMessage(

trimmed,

sessionId

);

if(

result?.success

){

    if (
        result.session_id &&
        result.session_id !== sessionId
    ) {
        setSessionId(
            result.session_id
        );

        if (!sessionId && onSessionCreated) {
            setTimeout(() => {
                onSessionCreated(result.session_id);  // ← pass session_id up
            }, 500);  // ← delay prevents immediate re-render race
        }
    }

appendMessage({

role:"assistant",

text:

result.message

||

"No response received.",

recommendations:

result.recommendations

||

[],

responseType:

result.response_type

||

"chat",

currentQuestion:

result.current_question

||

null,

missingFields:

result.missing_fields

||

[]

});

}

else{

appendMessage({

role:"error",

text:

result?.error

||

"Unable to process request.",

responseType:

"error"

});

}

}

catch(

err

){

console.error(

err

);

appendMessage({

role:"error",

text:

"Unable to connect. Please try again."

});

}

finally{

sendingRef.current=false;

setLoading(false);

inputRef.current?.focus();

}

};


const handleKeyDown=(

e

)=>{

if(

e.key==="Enter"

&&

!e.shiftKey

){

e.preventDefault();

handleSend();

}

};


return(

<div

className="

flex
flex-col
h-full
bg-white
border
rounded-xl
shadow-sm
overflow-hidden

"

>

<div
className="
flex
justify-between
items-center
px-4
py-3
border-b
bg-white
"
>

<h2
className="
font-semibold
text-lg
"
>
AI Vendor Assistant
</h2>

<button
onClick={handleNewChat}
className="
px-3
py-2
text-sm
bg-gray-100
rounded-lg
hover:bg-gray-200
"
>
+ New Chat
</button>

</div>

<div

className="

flex-1
overflow-y-auto
p-4
space-y-4
bg-gray-50

"

>

{

messages.map(

(

msg,
index

)=>(

<div

key={index}

className="

flex
flex-col

"

>

<div

className={`

max-w-[80%]
px-4
py-3
rounded-2xl
whitespace-pre-wrap
break-words

${

msg.role==="user"

?

"bg-blue-600 text-white ml-auto"

:

msg.role==="assistant"

?

msg.responseType==="followup"

?

"bg-yellow-50 border border-yellow-300 text-gray-900"

:

msg.responseType==="recommendation"

?

"bg-green-50 border border-green-300 text-gray-900"

:

"bg-white border text-gray-900"

:

"bg-red-100 text-red-700"

}

`}

>

{

msg.text

}

{

msg.responseType==="followup"

&&

msg.missingFields?.length > 0

&&

(

<div

className="

mt-2
text-xs
text-yellow-700

"

>

Required:

{

msg.missingFields.join(

", "

)

}

</div>

)

}

</div>

{

msg.role==="assistant"

&&

msg.recommendations?.length>0

&&(

<div

className="

mt-3
space-y-3

"

>

{

msg.recommendations.map(

vendor=>(

<RecommendationCard

key={

vendor.vendor_id

}

vendor={

vendor

}

/>

)

)

}

</div>

)

}

</div>

)

)

}


{

loading

&&(

<div

className="

bg-white
border
px-4
py-3
rounded-2xl
w-fit
text-gray-500

"

>

<div

className="

flex
gap-1

"

>

<div

className="

w-2
h-2
rounded-full
bg-gray-400
animate-bounce

"

/>

<div

className="

w-2
h-2
rounded-full
bg-gray-400
animate-bounce

"

style={{

animationDelay:"0.15s"

}}

/>

<div

className="

w-2
h-2
rounded-full
bg-gray-400
animate-bounce

"

style={{

animationDelay:"0.3s"

}}

/>

</div>

</div>

)

}

<div

ref={bottomRef}

/>

</div>


{

error

&&(

<div

className="

px-4
py-2
text-sm
text-red-600
bg-red-50
border-t

"

>

{

error

}

</div>

)

}


<div

className="

border-t
bg-white
p-3
flex
gap-2

"

>

<textarea

ref={inputRef}

value={input}

maxLength={

MAX_MESSAGE_LENGTH

}

rows={1}

onChange={

e=>

setInput(

e.target.value

)

}

onKeyDown={

handleKeyDown

}

disabled={

loading

}

placeholder="Describe your event requirements..."

className="

flex-1
border
rounded-xl
px-4
py-3
resize-none
outline-none
focus:ring-2
focus:ring-blue-500
disabled:bg-gray-100

"

/>


<button

onClick={

handleSend

}

disabled={

loading

||

!input.trim()

}

className="

bg-blue-600
text-white
px-5
rounded-xl
disabled:bg-gray-400
transition

"

>

{

loading

?

"..."

:

"Send"

}

</button>

</div>

</div>

);

};


export default ChatWindow;