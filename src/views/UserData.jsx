export default function({lengthOfSongs}){//TODO:
    const DATA={
        name:'XYZscratcher',
        description:'A music listener'
    }
    return (
        <div>
            <h1>{DATA.name}</h1>
            <p>{DATA.description}</p>
            <p>You have {lengthOfSongs} songs.</p>
        </div>
    )
}