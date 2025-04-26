'use client'

import { useEffect, useState } from 'react'

export default function LiwanLoadingScreen() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer)
          return 100
        }
        const newProgress = oldProgress + 2.5 // Slower increment
        return Math.min(newProgress, 100)
      })
    }, 50)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-inherit">
      <div className="w-full max-w-md p-4 sm:p-8">
        <svg viewBox="0 0 400 100" className="w-full">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d4ab71">
                <animate attributeName="offset" values="0;1;0" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#b38d5d">
                <animate attributeName="offset" values="0;1;0" dur="3s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>
          <text
            x="50%"
            y="50%"
            dy=".35em"
            textAnchor="middle"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
            fontFamily="Orbitron, sans-serif"
            fill="transparent"
            stroke="url(#gradient)"
            strokeWidth="2"
          >
            LIWAN
          </text>
          <text
            x="50%"
            y="50%"
            dy=".35em"
            textAnchor="middle"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
            fontFamily="Montserrat, sans-serif"
            fill="url(#gradient)"
          >
            <animate
              attributeName="fill-opacity"
              values="0;0.2;0.4;0.6;0.8;1"
              dur="3s"
              repeatCount="indefinite"
            />
            LIWAN
          </text>
        </svg>
        <div className="mt-6 bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-[#d4ab71] to-[#b38d5d] h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

