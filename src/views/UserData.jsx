import {useEffect, useState} from 'react'
export default function({lengthOfSongs}){//TODO:
    const [userData, setUserData] = useState(/*localStorage.userData??*/{
        name: 'XYZscratcher',
        description: 'A music listener'
    })
    useEffect(()=>{
        localStorage.userData = JSON.stringify(userData)
    },[userData])
    return (
        <div>
            <h1 contentEditable onInput={(e)=>{
                setUserData({...userData,name:e.target.textContent})
            }}>{userData.name}</h1>
            <p contentEditable>{userData.description}</p>
            <p>You have {lengthOfSongs} songs.</p>
        </div>
    )
}