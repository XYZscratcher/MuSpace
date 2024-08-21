export default function({list}){
    return(
        <>
        <h1>Albums</h1>
        {/*<p>You have {albumList.length} albums.</p>*/}
        <ul>{list.toSorted().map((v, i) => <li key={i}>{v}</li>)}</ul>
        </>
    )
}