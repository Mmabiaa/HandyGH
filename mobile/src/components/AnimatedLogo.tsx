import React from 'react';
import Lottie from 'lottie-react-native';
import logoAnimation from '../assets/logo.json'; // Ensure you have a logo.json file in the assets folder

const AnimatedLogo = () => {
  return <Lottie source={logoAnimation} autoPlay loop />;
};

export default AnimatedLogo;
