import React from 'react';
import Banner from './Banner';
import Categories from './Categories';
import Stats from './Stats';
import InteractiveFacts from './InteractiveFacts';
const Home = () => {
    return (
        <div>
            <Banner />
            <Stats />
            <Categories />
            <InteractiveFacts />
        </div>
    );
};

export default Home;