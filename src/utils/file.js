const isMusic = (name) => {
    return ["mp3", "m4a", "flac", "wav", "ogg"].includes(name.split(".").at(-1))
}
export {isMusic}