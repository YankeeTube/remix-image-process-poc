import type {V2_MetaFunction} from "@remix-run/node";
import {useEffect, useState} from "react";
import useWebpHook from "~/hooks/webp";
import {useLoaderData} from "react-router";

const MB = 1000 * 1000

export const meta: V2_MetaFunction = () => {
    return [{title: "Remix Image Processing P.O.C"}];
};

export async function loader() {
    const res = await fetch("https://api.waifu.pics/sfw/waifu");
    const {url} = await res.json()
    return url
}

export default function Index() {
    const waifURL = useLoaderData() as string
    const [width, setWidth] = useState(500)
    const [image, setImage] = useState<Blob>()
    const [duration, setDuration] = useState({
        image: 0,
        canvas: 0,
    })
    const [imageSource, setImageSource] = useState<string>(waifURL)

    const {convert, webp} = useWebpHook()

    async function initHandler() {
        const resp = await fetch(`https://wsrv.nl?url=${waifURL}`)
        const blob = await resp.blob()
        const s1 = performance.now()
        setImage(blob)

        const s2 = performance.now()
        await convert(blob)

        setDuration({
            image: Math.ceil(((s2 - s1) / 1000) * 100000) / 100000,
            canvas: Math.ceil(((performance.now() - s2) / 1000) * 100000) / 100000,
        })
    }

    // TODO: BLOB 으로 불러오는 페이지 만들어서 테스트 / GIF to Webm POC
    
    useEffect(() => {
        setWidth((innerWidth / 3) - 20)
        initHandler()
    }, [])

    return (
        <div>
            <h1>Remix Image Processing P.O.C</h1>
            <h2>Fetch With Waifu Pics</h2>

            <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                <div>
                    <h2>Original</h2>
                    <p>{(image?.size || 0) / MB} MB</p>
                    <p>0%</p>
                    <p>{image?.type}</p>
                    <p>{duration?.image || 0} s</p>
                    <img src={imageSource || ''} alt="original img" width={width} />
                </div>
                <div>
                    <h2>Webp</h2>
                    <p>{(webp?.size || 0) / MB} MB</p>
                    <p>{Math.round(((image?.size || 0) - (webp?.size || 0)) / (image?.size || 0) * 100) || 0} %</p>
                    <p>{webp?.type}</p>
                    <p>{duration?.canvas || 0} s</p>
                    <img src={webp ? URL.createObjectURL(webp) : ''} alt="webp img" width={width} />
                </div>
            </div>
        </div>
    );
}
