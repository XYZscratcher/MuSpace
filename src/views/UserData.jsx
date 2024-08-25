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
            <h1>统计信息</h1>
            <p>{lengthOfSongs} songs, {lengthOfAlbums} albums.</p>
            <p>累计听了 {parseInt(localStorage.getItem('minutes') ?? '0') } 分钟</p>
        </div>
    )
}