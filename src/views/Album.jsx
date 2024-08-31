export default function({name}){
    console.log(name)
    return (<div>{decodeURIComponent(name)}</div>)
}