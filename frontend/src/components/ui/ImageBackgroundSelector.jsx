import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import photo1 from '@/assets/68027.jpg';
import photo2 from '@/assets/photo2.jpg';
import photo3 from '@/assets/photo3.jpg';
import photo4 from '@/assets/photo4.jpg';
import photo5 from '@/assets/photo5.jpg';
import photo6 from '@/assets/photo6.jpg';
import photo7 from '@/assets/photo7.jpg';
import photo8 from '@/assets/133403.jpg';
import photo9 from '@/assets/photo9.jpg';
import photo10 from '@/assets/photo10.jpg';
import photo12 from '@/assets/photo12.jpg';
import photo13 from '@/assets/photo13.jpg';
import photo15 from '@/assets/photo15.jpg';
import photo16 from '@/assets/photo16.jpg';
import photo18 from '@/assets/photo18.png';
import photo19 from '@/assets/photo19.jpg';
import photo20 from '@/assets/photo20.jpg';
import photo21 from '@/assets/photo21.jpg';
import photo22 from '@/assets/photo22.jpg';
import photo23 from '@/assets/photo23.png';
import photo24 from '@/assets/photo24.jpg';
import photo25 from '@/assets/photo25.jpg';
import photo27 from '@/assets/photo27.jpg';
import photo28 from '@/assets/photo28.jpg';
import photo29 from '@/assets/photo29.jpg';
import photo31 from '@/assets/photo31.jpg';
import photo32 from '@/assets/photo32.jpg';
import photo33 from '@/assets/photo33.jpg';
import photo34 from '@/assets/photo34.jpg';
import photo35 from '@/assets/LiwanCoverDark.png';
import photo36 from '@/assets/LiwanCoverLight.png';
import { useTranslation } from 'react-i18next';



const galleryImages = [
  { id: 1, src: photo1, alt: 'Photo 1' },
  // { id: 2, src: photo2, alt: 'Photo 2' },
  // { id: 3, src: photo3, alt: 'Photo 3' },
  { id: 4, src: photo4, alt: 'Photo 4' },
  // { id: 5, src: photo5, alt: 'Photo 5' },
  { id: 6, src: photo6, alt: 'Photo 6' },
  // { id: 7, src: photo7, alt: 'Photo 7' },
  { id: 8, src: photo8, alt: 'Photo 8' },
  // { id: 9, src: photo9, alt: 'Photo 9' },
  // { id: 10, src: photo10, alt: 'Photo 10' },
  // { id: 12, src: photo12, alt: 'Photo 12' },
  // { id: 13, src: photo13, alt: 'Photo 13' },
  // { id: 15, src: photo15, alt: 'Photo 15' },
  // { id: 16, src: photo16, alt: 'Photo 16' },
  // { id: 18, src: photo18, alt: 'Photo 18' },
  // { id: 19, src: photo19, alt: 'Photo 19' },
  { id: 20, src: photo20, alt: 'Photo 20' },
  // { id: 21, src: photo21, alt: 'Photo 21' },
  // { id: 22, src: photo22, alt: 'Photo 22' },
  // { id: 23, src: photo23, alt: 'Photo 23' },
  // { id: 25, src: photo25, alt: 'Photo 25' },
  { id: 27, src: photo24, alt: 'Photo 27' },
  // { id: 28, src: photo28, alt: 'Photo 28' },
  // { id: 29, src: photo29, alt: 'Photo 29' },
  // { id: 31, src: photo31, alt: 'Photo 31' },
  { id: 32, src: photo32, alt: 'Photo 32' },
  // { id: 33, src: photo33, alt: 'Photo 33' },
  { id: 34, src: photo34, alt: 'Photo 34' },
  { id: 35, src: photo35, alt: 'Photo 35' },
  // { id: 36, src: photo36, alt: 'Photo 36' },
  
];
const defaultLightBackground = photo36; // Replace with the path to your default light image
const defaultDarkBackground = photo35;  // Replace with the path to your default dark image

export default function ImageBackgroundSelector() {
  const { t } = useTranslation();
  const [lightBackgroundImage, setLightBackgroundImage] = useState('');
  const [darkBackgroundImage, setDarkBackgroundImage] = useState('');
  const [lightSelectedImage, setLightSelectedImage] = useState(null);
  const [darkSelectedImage, setDarkSelectedImage] = useState(null);
  const [theme, setTheme] = useState('light'); // Track the current theme

  // Load backgrounds and theme on initial render
  useEffect(() => {
    const savedLightBackground = localStorage.getItem('lightModeBackground');
    const savedDarkBackground = localStorage.getItem('darkModeBackground');
    const savedTheme = localStorage.getItem('theme') || 'light';

    if (savedLightBackground) setLightBackgroundImage(savedLightBackground);
    if (savedDarkBackground) setDarkBackgroundImage(savedDarkBackground);
    setTheme(savedTheme);
  }, []);

  // Function to apply the background based on the theme
  const applyBackground = (theme, lightBackground = lightBackgroundImage, darkBackground = darkBackgroundImage) => {
    document.body.classList.toggle('light-theme', theme === 'light');
    document.body.classList.toggle('dark-theme', theme === 'dark');
  
    if (theme === 'light') {
      document.body.style.backgroundImage = lightBackground ? `url(${lightBackground})` : '';
    } else if (theme === 'dark') {
      document.body.style.backgroundImage = darkBackground ? `url(${darkBackground})` : '';
    }
    // window.location.reload(); 
  };

  // Handle background changes
  const handleSetBackground = (mode) => {
    if (mode === 'light' && lightSelectedImage) {
      const src = lightSelectedImage.src;
      setLightBackgroundImage(src);
      localStorage.setItem('lightModeBackground', src);
    } else if (mode === 'dark' && darkSelectedImage) {
      const src = darkSelectedImage.src;
      setDarkBackgroundImage(src);
      localStorage.setItem('darkModeBackground', src);
    }
    window.location.reload(); 
  };

  // Handle background removal
 // Handle background removal
const handleRemoveBackground = (mode) => {
  if (mode === 'light') {
    const defaultImage = defaultLightBackground;
    setLightBackgroundImage(defaultImage);
    localStorage.setItem('lightModeBackground', defaultImage); // Save the default image to localStorage
  } else if (mode === 'dark') {
    const defaultImage = defaultDarkBackground;
    setDarkBackgroundImage(defaultImage);
    localStorage.setItem('darkModeBackground', defaultImage); // Save the default image to localStorage
  }
  window.location.reload(); 
};
  // Toggle between themes and apply the corresponding background
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Apply background whenever theme changes
  useEffect(() => {
    applyBackground(theme, lightBackgroundImage, darkBackgroundImage);
  }, [theme, lightBackgroundImage, darkBackgroundImage]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 dark:text-shadow">{t('selectBackgroundImage')}</h1>

      <div className="mb-4">
        <Button onClick={() => handleSetBackground('light')} disabled={!lightSelectedImage}>
          {t('setLightModeBackground')}
        </Button>
        <Button onClick={() => handleSetBackground('dark')} disabled={!darkSelectedImage} className="mx-4">
          {t('setDarkModeBackground')}
        </Button>
        
      </div>

      <div className="mb-4 ">
        <Button
          onClick={() => handleRemoveBackground('light')}
          disabled={!lightBackgroundImage}
          variant="outline"
          
        >
          {t('resetLightModeBackground')}
        </Button>
        <Button
          onClick={() => handleRemoveBackground('dark')}
          disabled={!darkBackgroundImage}
          variant="outline"
          
        >
          {t('resetDarkModeBackground')}
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {galleryImages.map((image) => (
          <Card
            key={image.id}
            className={`overflow-hidden cursor-pointer transition-all duration-300 ${
              lightSelectedImage === image || darkSelectedImage === image ? 'ring-2 ring-primary ring-offset-2' : 'hover:shadow-lg'
            }`}
            onClick={() => {
              setLightSelectedImage(image);
              setDarkSelectedImage(image);
            }}
          >
            <div className="relative h-64">
              <img
                src={image.src}
                alt={t('photoAlt', { id: image.id })}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </Card>
        ))}
      </div>

      
    </div>
  );
}
