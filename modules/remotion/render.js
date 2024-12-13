const { renderMedia, renderStill, selectComposition } = require('@remotion/renderer');
const { bundle } = require('@remotion/bundler');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const { exec } = require("child_process");

const generateVideo = async (imagePath, audioPath, outputPath) => {
    return new Promise((resolve, reject) => {
        // Ensure paths are absolute for FFmpeg
        const absoluteImagePath = path.resolve(imagePath);
        const absoluteAudioPath = path.resolve(audioPath);
        const absoluteOutputPath = path.resolve(outputPath);

        // FFmpeg command
        const command = `ffmpeg -y -loop 1 -i "${absoluteImagePath}" -i "${absoluteAudioPath}" -c:v libx264 -preset ultrafast -tune stillimage -c:a aac -b:a 192k -shortest -vf "scale=1080:1920" "${absoluteOutputPath}"`;

        // Execute FFmpeg command
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error("Error generating video:", error.message);
                reject(error);
                return;
            }
            if (stderr) {
                console.error("FFmpeg stderr:", stderr);
            }
            console.log(`Video successfully generated at: ${absoluteOutputPath}`);
            // fs.unlink(absoluteImagePath);
            resolve(absoluteOutputPath);
        });
    });
}

async function renderVideo(newsData) {
    try {
        const bundleLocation = await bundle({
            entryPoint: path.resolve('./modules/remotion/index.tsx'),
            webpackOverride: (config) => ({
                ...config,
                resolve: {
                    ...config.resolve,
                    fallback: {
                        ...config.resolve?.fallback,
                        fs: false,
                        path: false,
                        os: false,
                    },
                },
            }),
        });
        // console.log('Bundle Location:', bundleLocation);

        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: 'BackgroundVideo',
            inputProps: { newsData },
        });
        // console.log('Composition:', composition);

        const randomId = crypto.randomBytes(6).toString('hex'); // 6 bytes = 12 characters in hex
        const outputLocation = `./output/${randomId}.mp4`;
        // console.log('Output Location:', outputLocation);

        let lastProgress = -1;
        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation,
            inputProps: { newsData },
            onProgress: (data) => {
                const progressPercentage = Math.floor(data.progress * 100);
                if (progressPercentage !== lastProgress) {
                    console.log('Progress:', progressPercentage, '%');
                    lastProgress = progressPercentage; // Update the lastProgress variable
                }
            },
        });

        // Verify file exists

        if (fs.existsSync(outputLocation)) {
            console.log(`Video confirmed at: ${outputLocation}`);
        } else {
            console.error(`Video NOT found at: ${outputLocation}`);
        }

        return outputLocation;
    } catch (error) {
        console.error('Error during rendering:', error);
        if (error.stackFrame) {
            console.error('Stack frame:', error.stackFrame);
        }
        throw error;
    }
}

module.exports = { renderVideo };
