import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Link } from "react-router-dom";
import heartImageEn from '@/assets/heartImageEn.gif';
import heartImageAr from '@/assets/heartImageAr.gif';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const LandingPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const buttonRef = useRef(null);
  const { t, i18n } = useTranslation(); 
  const isArabic = i18n.language === 'ar';

  // Handle Loading Screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // GSAP Animations
  useEffect(() => {
    if (!isLoading) {
      const tl = gsap.timeline();

      tl.from(containerRef.current, {
        opacity: 0,
        duration: 1.5,
        ease: "power1.out"
      });

      tl.from(titleRef.current, {
        opacity: 0,
        y: -50,
        duration: 1.5,
        ease: "back.out(1.7)",
      }, "-=1");

      tl.from(buttonRef.current, {
        opacity: 0,
        y: 50,
        duration: 1.5,
        ease: "back.out(1.7)",
      }, "-=1");
    }
  }, [isLoading]);
  
  
  return (
    <div className={`flex flex-col transition-colors duration-300  ${i18n.language === "ar" ? "bg-loginGIFar" : "bg-loginGIFen"} bg-cover bg-no-repeat bg-center justify-center h-screen`}>
      <div
        ref={containerRef}
        className="h-[90vh] flex flex-col  overflow-visible px-2 sm:px-4 md:px-6 py-0 text-foreground transition-colors duration-300 relative">
        
        {/* Text Section */}
        <div
          className={cn(
            "z-10",
            isArabic ? "text-right pr-2 sm:pr-4 md:pr-8" : "text-left pl-2 sm:pl-4 md:pl-8",
            "full px-2 sm:px-4 m-4 sm:m-6 md:m-8",
            "transition-all duration-500",
            "pt-4 sm:pt-6 lg:pt-12",
            "relative"
          )}
        >
          {/* Gradient Border Pseudo-element */}
          <div
            className={cn(
              "absolute",
              isArabic ? "right-0" : "left-0",
              "top-2 bottom-0 w-1 sm:w-2 bg-gradient-to-b from-[#594a41] to-[#baad94] dark:from-[#baad94] dark:to-[#594a41]"
            )}
          ></div>
         <h1
            ref={titleRef}
            className={cn(
              "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight pb-4",
              "bg-clip-text text-transparent",
              " bg-gradient-to-r from-[#baad94] to-[#594a41]"
            )}
          >
            {t('landing.title')}
          </h1>
          <p className="text-primary text-sm sm:text-base md:text-lg lg:text-xl font-semibold mt-2 sm:mt-4 text-white pb-6">
            {t('landing.subtitle')}
          </p>
        </div>
        <div
        dir='ltr'>
        {/* Logo Section */}
        <div className={cn("flex justify-center md:justify-end",
         "mt-[30%] sm:mt-[20%] md:mt-[20%] lg:mt-0",
         "mx-auto md:mx-0",
         "md:mr-[3%] lg:mr-[5%] xl:mr-[11%] lg:mt-[3%]",
           )}>
        
        </div>
      </div>
</div>
      {/* Button Section */}
      <div ref={buttonRef} className="flex justify-center mb-12">
        <Link to="/login-page">
          <Button
            className={cn(
              "group relative flex items-center gap-2 bg-[#191611] text-white hover:bg-[#AFA28B] px-4 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-4 md:py-5 lg:py-6 text-sm sm:text-md md:text-lg lg:text-xl",
              "transform skew-x-[-15deg] transition-all duration-500",
              "hover:scale-105 focus:outline-none",
            )}
          >
            <span className="skew-x-[15deg]">{t('landing.login')}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
