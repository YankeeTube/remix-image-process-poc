import type {V2_MetaFunction} from "@remix-run/node";
import type {ChangeEvent} from "react";
import {useEffect, useState} from "react";
import useWebpHook from "~/hooks/webp";

const MB = 1000 * 1000

export const meta: V2_MetaFunction = () => {
    return [{title: "Remix Image Processing P.O.C"}];
};

export default function Index() {
    const [width, setWidth] = useState(500)
    const [image, setImage] = useState<File>()
    const [imageSource, setImageSource] = useState<string>('')

    const {convert, webp} = useWebpHook()

    async function imageChangeHandler(e: ChangeEvent<HTMLInputElement>) {
        URL.revokeObjectURL(imageSource)
        const file = e.target.files?.[0] as File
        const url = URL.createObjectURL(file)

        setImage(file)
        setImageSource(url)
        await convert(url)
    }
    
    
    useEffect(() => {
        setWidth((innerWidth / 3) - 20)
    }, [])

    return (
        <div>
            <h1>Remix Image Processing P.O.C</h1>
            <input type="file" onChange={imageChangeHandler}/>

            <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                <div>
                    <h2>Original</h2>
                    <p>{(image?.size || 0) / MB} MB</p>
                    <p>0%</p>
                    <img src={imageSource || ''} alt="original img" width={width} />
                </div>
                <div>
                    <h2>Webp</h2>
                    <p>{(webp?.size || 0) / MB} MB</p>
                    <p>{Math.round(((image?.size || 0) - (webp?.size || 0)) / (image?.size || 0) * 100) || 0} %</p>
                    <img src={webp ? URL.createObjectURL(webp) : ''} alt="webp img" width={width} />
                </div>
            </div>
        </div>
    );
}
