import { Link } from "wouter";
import { convertFileSrc } from "@tauri-apps/api/tauri";
export default function ({ list }) {
    console.log("list: ", list)
    const compareByAlbum = (a, b) => +(a.album > b.album) - 0.5;
    return (
        <>
            <h1>Albums</h1>
            <div style={{display:"grid", gridTemplateColumns:"repeat(4, minmax(10rem,1fr))", gap:"1rem"}}>
                {list.map((v) => JSON.parse(v)).toSorted(compareByAlbum).map(({ album, cover }, i) => <div key={i}>
                    <figure style={{margin:0}}>
                        <img src={convertFileSrc(cover)} style={{ display: "block", height: "13rem" }} />
                        <figcaption style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}><Link href={"/album/" + encodeURIComponent(album)}>{album}</Link></figcaption>
                    </figure>
                </div>)}
            </div>
        </>
    )
}