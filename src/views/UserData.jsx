//import {useEffect, useState} from 'react'
export default function({lengthOfSongs,lengthOfAlbums}){//TODO:
    // const [userData, setUserData] = useState(localStorage.userData?
    //     JSON.parse(localStorage.userData):{
    //     name: 'Your name',
    //     description: 'A music listener'
    // })
    // useEffect(()=>{
    //     localStorage.userData = JSON.stringify(userData)
    // },[userData])
    return (
        <div>
            {/*<h1 contentEditable onInput={(e)=>{
                setUserData({...userData,name:e.target.textContent})
            }}>{userData.name}</h1>
            <p contentEditable  onInput={(e)=>{
                setUserData({...userData,description:e.target.textContent}) }}>{userData.description}</p>*/}
            <p>{lengthOfSongs} songs, {lengthOfAlbums} albums.</p>
        </div>
    )
}