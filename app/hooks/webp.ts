import {useState} from "react";

const useWebpHook = () => {
    const [webp, setWebp] = useState<Blob>()

    async function proxyConvert(source: string) {
        const resp = await fetch(source)
        const blob = await resp.blob()
        const form = new FormData()

        // https://freeimage.host/page/api
        form.append('image', blob)
        const tempResponse = await fetch(`https://api.imgbb.com/1/upload?expiration=60&key=${window?.bbKey || '' }`, {
            method: 'post',
            body: form,
        })
        const {data: {display_url}} = await tempResponse.json()

        const wsrv = await fetch(`https://wsrv.nl?url=${display_url}&output=webp`)
        return await wsrv.blob()
    }

    async function imageLoader(this: any) {
        try {
            const {naturalWidth: w, naturalHeight: h} = this;
            const canvas = document.createElement('canvas');
            canvas.width = w
            canvas.height = h

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Failed canvas getContext')
            }

            ctx.drawImage(this, 0, 0)
            canvas.toBlob((blob) => setWebp(blob as Blob), 'image/webp', 0.7)
        } catch (e) {
            console.error(e)
            setWebp(await proxyConvert(this.src))
        } finally {
            this.dispatchEvent(new CustomEvent('close'))
        }
    }

    async function convert(source: string | Blob) {
        let isBlob = false
        if (typeof source !== 'string') {
            isBlob = true
            source = URL.createObjectURL(source)
        }

        const img = new Image()
        img.removeEventListener('load', imageLoader)
        img.addEventListener('load', imageLoader)
        img.addEventListener('close', () => {
            if (isBlob) {
                URL.revokeObjectURL(img.src)
            }
        })
        img.setAttribute('crossOrigin', 'anonymous')
        img.setAttribute('decoding', 'async')
        img.setAttribute('src', source)
    }

    return {
        webp,
        convert
    }
}

export default useWebpHook