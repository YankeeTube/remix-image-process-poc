# Remix Client Image Process Test

- Image -> Webp
- GIF -> Webm
- Client Failed to Free Service API


## Image To Webp
- Canvas 
  - Much faster and slightly higher compression than [Squoosh](https://squoosh.app/)
- Browser Failed Work Flow
  1. imgbb uplod -> get image `display_url`
  2. wsrv.nl access quality / output `wsrv.nl?url=<url>&output=webp&q=70`


## GIF To Webm
- [FFMPEG WASM](https://ffmpegwasm.netlify.app/)


## Free Third-Party API
- [imgbb](https://api.imgbb.com)
- [wsrv.nl](https://wsrv.nl)


## Local Test:

```sh
npm run install
npm run dev
```