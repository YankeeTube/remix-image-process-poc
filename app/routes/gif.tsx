import {createFFmpeg, fetchFile} from '@ffmpeg/ffmpeg';
import {useEffect, useState} from "react";
import type {HeadersFunction} from "@remix-run/node";
import {useLoaderData} from "react-router";

const MB = 1000 * 1000

export const headers: HeadersFunction = () => ({
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "require-corp",
});

export async function loader() {
    const keywords = ['blush', 'dance', 'highfive', 'cuddle', 'smile', 'wave', 'poke']
    const keyword = keywords[Math.floor(Math.random() * keywords.length)]
    const res = await fetch(`https://api.waifu.pics/sfw/${keyword}`);
    const {url} = await res.json()
    return url
}

const ffmpeg = createFFmpeg({log: false});

export default function GIF() {
    const waifURL = useLoaderData() as string
    const [gif, setGif] = useState<Blob | File>()
    const [width, setWidth] = useState(500)
    const [webm, setWebm] = useState<Blob>()
    const [duration, setDuration] = useState(0)
    const [gifSource, setGifSource] = useState<string>('')

    const transcode = async (file: Blob) => {
        const start = performance.now()
        const threadCount = String(navigator.hardwareConcurrency || 1)
        const videoName = 'output.webm'
        const options = [
            '-i', 'image.gif',
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
        ffmpeg.FS('writeFile', 'image.gif', await fetchFile(file));
        await ffmpeg.run(...options);

        const data = ffmpeg.FS('readFile', videoName);
        setDuration(Math.ceil(((performance.now() - start) / 1000) * 100000) / 100000)
        setWebm(new Blob([data.buffer], {type: 'video/webm'}))
    }

    const init = async () => {
        await ffmpeg.load()
        const resp = await fetch(`https://wsrv.nl?url=${waifURL}&n=-1`)
        const blob = await resp.blob()
        const url = URL.createObjectURL(blob)
        setGif(blob)
        setGifSource(url)
        await transcode(blob)
    };

    useEffect(() => {
        setWidth((innerWidth / 3) - 20)
        init()
    }, [])

    return (
        <div>
            <h1>Remix GIF To Webm P.O.C</h1>
            <h2>Fetch With Waifu Pics</h2>

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
                    <p>{webm?.type} / {duration || 0} s</p>
                    {webm && (
                        <video width={width} controls loop autoPlay playsInline muted>
                            <source src={webm ? URL.createObjectURL(webm) : ''}/>
                        </video>
                    )}
                </div>
            </div>
        </div>
    )
}