import '../../public/global.css'
import { Video, Img, useVideoConfig, staticFile, useCurrentFrame, OffthreadVideo } from 'remotion';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';

export const VideoBackground = ({ newsData }) => {
    const { width, height } = useVideoConfig();
    const frame = useCurrentFrame();
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

    // console.error("Data:", JSON.stringify(newsData, null, 2));
    // console.error("Quotes:", newsData[0].quotes);

    if (!newsData) {
        return null;
    }

    useEffect(() => {
        if (frame >= 260) { // Show after 10 seconds (20fps * 1.5s = 200 frames)
            setShowCorrectAnswer(true);
        }
    }, [frame]);

    const textVariants = {
        hidden: {
            opacity: 0,
            y: 50
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut"
            }
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3
            }
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Helmet>
                <link
                    href="https://fonts.googleapis.com/css2?family=Aleo:ital,wght@0,100..900;1,100..900&family=Lexend+Deca:wght@100..900&family=Noto+Sans+Devanagari:wght@100..900&family=Ojuju:wght@200..800&family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap"
                    rel="stylesheet"
                />
            </Helmet>

            {Array.isArray(newsData) && newsData.length > 0 && (
                <OffthreadVideo
                    src={staticFile(`${newsData[0].data.video}`)}
                    style={{
                        width: width,
                        height: height,
                        objectFit: 'cover',
                    }}
                    loop
                />
            )}

            {/* Animated Text Overlay */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                style={{
                    position: 'absolute',
                    top: '645px',
                    width: '100%'
                }}
            >
                {Array.isArray(newsData) && newsData.length > 0 && (
                    <motion.div
                        variants={containerVariants}
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'column',
                            marginLeft: '128px',
                            marginRight: '100px'
                        }}
                    >
                        <motion.p
                            variants={textVariants}
                            style={{
                                color: 'black',
                                fontSize: '44px',
                                textAlign: 'left',
                                fontFamily: "'Lexend Deca','Noto Sans Devanagari', sans-serif"
                            }}
                        >
                            {newsData[0].data.question}
                        </motion.p>
                    </motion.div>
                )}
            </motion.div>

            {/* Option 1 */}
            <div
                style={{
                    position: 'absolute',
                    top: '880px',
                    left: '195px',
                    width: '100%'
                }}
            >
                <p
                    style={{
                        color: 'black',
                        fontSize: '36px',
                        textAlign: 'left',
                        fontWeight: '400',
                        fontFamily: "'Lexend Deca','Noto Sans Devanagari', sans-serif"
                    }}
                >
                    {newsData[0].data.option1}
                </p>
            </div>

            {/* Option 2 */}
            <div
                style={{
                    position: 'absolute',
                    top: '1060px',
                    left: '195px',
                    width: '100%'
                }}
            >
                <p
                    style={{
                        color: 'black',
                        fontSize: '36px',
                        textAlign: 'left',
                        fontWeight: '400',
                        fontFamily: "'Lexend Deca','Noto Sans Devanagari', sans-serif"
                    }}
                >
                    {newsData[0].data.option2}
                </p>
            </div>

            {/* Option 3 */}
            <div
                style={{
                    position: 'absolute',
                    top: '1240px',
                    left: '195px',
                    width: '100%'
                }}
            >
                <p
                    style={{
                        color: 'black',
                        fontSize: '36px',
                        textAlign: 'left',
                        fontWeight: '400',
                        fontFamily: "'Lexend Deca','Noto Sans Devanagari', sans-serif"
                    }}
                >
                    {newsData[0].data.option3}
                </p>
            </div>

            {/* Option 4 */}
            <div
                style={{
                    position: 'absolute',
                    top: '1420px',
                    left: '195px',
                    width: '100%'
                }}
            >
                <p
                    style={{
                        color: 'black',
                        fontSize: '36px',
                        textAlign: 'left',
                        fontWeight: '400',
                        fontFamily: "'Lexend Deca','Noto Sans Devanagari', sans-serif"
                    }}
                >
                    {newsData[0].data.option4}
                </p>
            </div>
        </div>
    );
};