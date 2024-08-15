import { useState } from "react"

export default function(){
    const [a,b]=useState({a:1})
    return (
        <p onClick={() => b({a:a.a+1})}>{a.a}</p>
    )
}