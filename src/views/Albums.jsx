import { Link } from "wouter";
export default function ({ list }) {
    return (
        <>
            <h1>Albums</h1>
            <ul>
                {list.toSorted().map((v, i) => <li key={i}>
                    <Link href={"/album/" + encodeURIComponent(v)}>{v}</Link>
                </li>)}
            </ul>
        </>
    )
}