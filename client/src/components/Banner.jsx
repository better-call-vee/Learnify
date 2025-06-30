import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import Lottie from "lottie-react";
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { Mousewheel, Pagination, Autoplay } from 'swiper/modules';
import Loading from './Loading';

export default function Banner({ scrollToSectionRef }) {
    const images = [
        '/slide1.jpg', '/slide2.jpg', '/slide3.jpg', '/slide4.jpg',
        '/slide5.jpg', '/slide6.jpg', '/slide7.jpg',
    ];

    const [lottieAnimationData, setLottieAnimationData] = useState(null);
    const [lottieError, setLottieError] = useState(null);

    useEffect(() => {
        fetch('/banner-lottie.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch Lottie: ${response.status}`);
                }
                return response.json();
            })
            .then(data => setLottieAnimationData(data))
            .catch(error => {
                console.error("Error loading Lottie animation:", error);
                setLottieError(error.message);
            });
    }, []);

    return (
        <div className="bg-[var(--color-bgc)]">
            <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
                <div className="flex flex-col md:ml-15 lg:flex-row gap-8 lg:gap-12 items-center">

                    <div className="w-full lg:w-1/2">
                        <Swiper
                            direction="vertical"
                            slidesPerView={1}
                            spaceBetween={30}
                            mousewheel={true}
                            pagination={{ clickable: true }}
                            autoplay={{ delay: 2500, disableOnInteraction: false }}
                            modules={[Mousewheel, Pagination, Autoplay]}
                            className="mySwiper rounded-2xl overflow-hidden shadow-2xl h-72 md:h-96 lg:h-[500px]"
                        >
                            {images.map((src, idx) => (
                                <SwiperSlide key={idx} className="bg-neutral border-0 p-0">
                                    <img src={src} alt={`Learnify Slide ${idx + 1}`} className="w-full h-full object-cover" />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>


                    <div className="w-full lg:w-1/2 flex flex-col md:flex-row items-center gap-6 lg:gap-8">
                        <div className="w-full md:w-3/5 order-2 md:order-1">
                            <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-[var(--color-txt)] mb-5 text-center md:text-left leading-tight">
                                Unlock Your Potential <br className="hidden sm:inline" /> in Any Language?
                            </h2>
                            <ul className="steps steps-vertical text-left w-full">
                                <li className="step step-primary text-sm md:text-base text-[var(--color-txt)]">
                                    Find your perfect Learnify Tutor
                                </li>
                                <li className="step step-primary text-sm md:text-base text-[var(--color-txt)]">Set your personal learning goals</li>
                                <li className="step step-primary text-sm md:text-base text-[var(--color-txt)]">Practice regularly with expert guidance</li>
                                <li className="step step-primary text-sm md:text-base text-[var(--color-txt)]">Immerse yourself in new cultures</li>
                                <li className="step step-accent text-sm md:text-base text-[var(--color-txt)]" data-content="✓">
                                    Speak confidently, connect globally!
                                </li>
                            </ul>
                            <div className="mt-6 md:mt-8 text-center md:text-left">
                                <Link to="/faq"
                                    onClick={scrollToSectionRef}
                                    className="btn btn-primary text-primary-content font-bold py-3 px-6 sm:px-8 rounded-lg hover:opacity-90 transition-all transform hover:scale-105 duration-300 text-sm sm:text-base"
                                >
                                    Find Your Tutor Now
                                </Link>
                            </div>
                        </div>

                        <div className="w-full md:w-2/5 order-1 md:mb-[-16rem] md:ml-[-7rem] md:order-2 flex justify-center md:justify-end items-center">
                            <div className="w-full max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-xs">
                                {lottieError ? (
                                    <div className="text-center text-[var(--color-error)]">Animation Error.</div>
                                ) : lottieAnimationData ? (
                                    <Lottie animationData={lottieAnimationData} loop={true} autoplay={true} />
                                ) : (
                                    <div className="text-center text-[var(--color-txt)] opacity-75 flex justify-center items-center h-40 md:h-48">
                                        <Loading />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}