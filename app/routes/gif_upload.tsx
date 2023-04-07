import {createFFmpeg, fetchFile} from '@ffmpeg/ffmpeg';
import type {ChangeEvent} from "react";
import {useEffect, useState} from "react";

const MB = 1000 * 1000


const ffmpeg = createFFmpeg({log: false});
export default function GIF() {
    const [gif, setGif] = useState<Blob | File>()
    const [width, setWidth] = useState(500)
    const [webm, setWebm] = useState<Blob>()
    const [duration, setDuration] = useState(0)
    const [gifSource, setGifSource] = useState<string>('')

    const transcode = async (file: File) => {
        const start = performance.now()
        const {name} = file;
        const threadCount = String(navigator.hardwareConcurrency || 1)
        const videoName = name.replace(/(\.\w+)$/, '.webm');
        const options = [
            '-i', name,
            '-c', 'vp9',
            '-c:v', 'libvpx',
            '-b:v', '1M',
            '-crf', '25',
            '-pix_fmt', 'yuv420p',
            '-auto-alt-ref', '0',
            '-speed', '10',
            '-c:a', 'libvorbis',
            '-threads', threadCount,
            '-y', videoName
        ];
        ffmpeg.FS('writeFile', name, await fetchFile(file));

        await ffmpeg.run(...options);
        const data = ffmpeg.FS('readFile', videoName);
        setDuration(Math.ceil(((performance.now() - start) / 1000) * 100000) / 100000)
        setWebm(new Blob([data.buffer], {type: 'video/webm'}))
    }

    async function imageChangeHandler(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] as File
        const url = URL.createObjectURL(file)
        setGif(file)
        setGifSource(url)
        await transcode(file)
    }

    const init = async () => await ffmpeg.load();

    useEffect(() => {
        setWidth((innerWidth / 3) - 20)
        init()
    }, [])

    return (
        <div>
            <h1>Remix GIF To Webm P.O.C</h1>
            {/*<h2>Fetch With Waifu Pics</h2>*/}
            <input type="file" onChange={imageChangeHandler}/>

            <div style={{display: 'flex', alignItems: 'start', gap: '20px'}}>
                <div>
                    <h2>Original</h2>
                    <p>{(gif?.size || 0) / MB} MB</p>
                    <p>0%</p>
                    <p>{gif?.type}</p>
                    <img src={gifSource || ''} alt="original gif" width={width}/>
                </div>
                <div>
                    <h2>Webm</h2>
                    <p>{(webm?.size || 0) / MB} MB</p>
                    <p>{Math.round(((gif?.size || 0) - (webm?.size || 0)) / (gif?.size || 0) * 100) || 0} %</p>
                    <p>{webm?.type}</p>
                    <p>{duration || 0} s</p>
                    <video src={webm ? URL.createObjectURL(webm) : ''} width={width} controls loop autoPlay/>
                </div>
            </div>
        </div>
    )
}