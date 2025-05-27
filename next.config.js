const nextConfig = {
    reactStrictMode: true,
    swcMinify: false,
    output: "standalone",
    env: {
        BACKEND_URI: process.env.BACKEND_URI,
        FRONTEND_URI: process.env.FRONTEND_URI,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        ENV: process.env.ENV,
    },
    webpack: (config, options) => {
        config.module.rules.push({
            test: /\.(png|svg|jpg|gif|pdf)$/,
            use: [
                {
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                    },
                },
            ],
        });
        return config;
    },
    images: {
        domains: ["starwave-dataroom.s3.ap-east-1.amazonaws.com"],
    },
};
/** @type {import('next').NextConfig} */
const withTM = require("next-transpile-modules")([
    "@fullcalendar/common",
    "@fullcalendar/react",
    "@babel/preset-react",
    "@fullcalendar/common",
    "@fullcalendar/daygrid",
    "@fullcalendar/interaction",
    "@fullcalendar/react",
    "@fullcalendar/timegrid",
    "@fullcalendar/list",
]);

module.exports = withTM(nextConfig);
