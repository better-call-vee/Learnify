import React from 'react';
import Banner from './Banner';
import Categories from './Categories';
import Stats from './Stats';
const Home = () => {
    return (
        <div>
            <Banner />
            <Stats />
            <Categories />
        </div>
    );
};

export default Home;