export default function(){
    const albumList = [...new Set(
        JSON.parse(localStorage.getItem('musicList'))
            .map((item) => item.album)
    )]
    return(
        <>
        <h1>Albums</h1>
        <p>You have {albumList.length} albums.</p>
        <ul>{albumList.toSorted().map((v, i) => <li key={i}>{v}</li>)}</ul>
        </>
    )
}