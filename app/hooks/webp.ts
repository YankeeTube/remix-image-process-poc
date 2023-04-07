import {useState} from "react";

const useWebpHook = () => {
    const [webp, setWebp] = useState<Blob>()

    async function imageLoader(this: any) {
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
        this.dispatchEvent(new CustomEvent('close'))
    }

    async function convert(source: string | Blob) {
        let isBlob = false
        if (typeof source !== 'string') {
            isBlob = true
            source = URL.createObjectURL(source)
        }

        const img = new Image()
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