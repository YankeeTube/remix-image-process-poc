import {Link, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration,} from "@remix-run/react";
import {json} from "@remix-run/router";
import * as process from "process";
import {useLoaderData} from "react-router";

export const loader = async () => {
    return json({bbKey: process.env.IMG_BB_KEY})
}

export default function App() {
    const {bbKey} = useLoaderData() as {bbKey: string}

    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8"/>
            <meta name="viewport" content="width=device-width,initial-scale=1"/>
            <script dangerouslySetInnerHTML={{__html: `window.bbKey='${bbKey}';`}}></script>
            <Meta/>
            <Links/>
        </head>
        <body>
        <div style={{display: 'flex', alignItems: 'start', gap: '40px'}}>
            <Link to={'/'}>Image to Webp</Link>
            <Link to={'/gif'}>GIF to Webm</Link>
            <Link to={'/upload'}>Upload Image to Webp</Link>
            <Link to={'/gif_upload'}>Upload GIF to Webm</Link>

        </div>
        <Outlet/>
        <ScrollRestoration/>
        <Scripts/>
        <LiveReload/>
        </body>
        </html>
    );
}
