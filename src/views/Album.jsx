export default function({name}){//TODO:App传入albumList
    console.log(name)
    return (<div>{decodeURIComponent(name)}</div>)
}