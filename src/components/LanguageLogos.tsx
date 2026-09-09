import React from 'react';
import { CourseId } from '../types';

interface LanguageLogoProps {
  courseId: CourseId | string;
  className?: string;
}

export const LanguageLogo: React.FC<LanguageLogoProps> = ({ courseId, className = "w-7 h-7" }) => {
  switch (courseId) {
    case 'cpp':
      return (
        <svg className={className} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* C++ Hexagon Shield Logo */}
          <path d="M117.5 33.5L65.5 3.5C64.6 3 63.4 3 62.5 3.5L10.5 33.5C9.6 34 9 35 9 36.1V96.1C9 97.2 9.6 98.2 10.5 98.7L62.5 128.7C63 129 63.5 129.1 64 129.1C64.5 129.1 65 129 65.5 128.7L117.5 98.7C118.4 98.2 119 97.2 119 96.1V36.1C119 35 118.4 34 117.5 33.5Z" fill="#00599C"/>
          <path d="M109 38L64 12L19 38V90L64 116L109 90V38Z" fill="#004482"/>
          {/* C++ text */}
          <path d="M48 50C43 50 38 54 38 64C38 74 43 78 48 78C53 78 57 75 59 71L67 75C63 82 56 86 48 86C33 86 26 76 26 64C26 52 33 42 48 42C56 42 63 46 67 53L59 57C57 53 53 50 48 50Z" fill="white"/>
          <path d="M78 58H84V62H78V68H74V62H68V58H74V52H78V58Z" fill="white"/>
          <path d="M100 58H106V62H100V68H96V62H90V58H96V52H100V58Z" fill="white"/>
        </svg>
      );

    case 'python':
      return (
        <svg className={className} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Python Snake Logo */}
          <path d="M62.6 2C34.7 2 36.4 14.1 36.4 14.1L36.5 26.6H63.8V30.5H25C25 30.5 2 27.5 2 55.6C2 83.7 22.1 82.5 22.1 82.5H34V70.6C34 70.6 33.3 56.2 48 56.2H74.8C74.8 56.2 88.6 56.7 88.6 42.6V15.8C88.6 15.8 91 2 62.6 2ZM48.2 11.2C50.9 11.2 53 13.3 53 16C53 18.7 50.9 20.8 48.2 20.8C45.5 20.8 43.4 18.7 43.4 16C43.4 13.3 45.5 11.2 48.2 11.2Z" fill="#3776AB"/>
          <path d="M65.4 126C93.3 126 91.6 113.9 91.6 113.9L91.5 101.4H64.2V97.5H103C103 97.5 126 100.5 126 72.4C126 44.3 105.9 45.5 105.9 45.5H94V57.4C94 57.4 94.7 71.8 80 71.8H53.2C53.2 71.8 39.4 71.3 39.4 85.4V112.2C39.4 112.2 37 126 65.4 126ZM79.8 116.8C77.1 116.8 75 114.7 75 112C75 109.3 77.1 107.2 79.8 107.2C82.5 107.2 84.6 109.3 84.6 112C84.6 114.7 82.5 116.8 79.8 116.8Z" fill="#FFD43B"/>
        </svg>
      );

    case 'javascript':
      return (
        <svg className={className} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* JavaScript Yellow Badge Logo */}
          <rect width="128" height="128" rx="16" fill="#F7DF1E"/>
          <path d="M67.3 102.3C69.3 105.7 72.5 108.5 78.4 108.5C84.1 108.5 88.2 105.7 88.2 101.1C88.2 96.2 84.8 94.4 78.8 91.8L75.5 90.4C65.8 86.2 57.2 81.3 57.2 69.8C57.2 58.8 65.7 51 78.5 51C87.4 51 94 54.7 98.4 62.3L86.6 69.8C84.1 65.5 81.2 63.6 77.8 63.6C74.3 63.6 71.8 65.8 71.8 69.1C71.8 73 74.3 74.7 80 77.2L83.3 78.6C95.4 83.8 103 88.5 103 100.8C103 113.8 92.7 121 78.1 121C64.4 121 55.7 113.8 51 104.2L67.3 102.3ZM25 100.8L39.8 98.1C41.3 103.5 43.8 107.2 49 107.2C54.1 107.2 56.8 104.7 56.8 94.8V52H71.8V95.7C71.8 112.5 61.9 120.8 47.7 120.8C35.2 120.8 27.2 112.8 25 100.8Z" fill="#000000"/>
        </svg>
      );

    case 'java':
      return (
        <svg className={className} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Java Coffee Cup Logo */}
          <path d="M43.8 100.8C43.8 100.8 36.4 102.3 49 103.5C64.2 105 77 104.8 90 102C95.2 100.9 101.5 99.1 101.5 99.1C101.5 99.1 98.8 101.2 92.1 103.1C81.4 106.1 64.9 107 50.8 106.4C37.3 105.8 27.2 103.3 27.2 103.3C27.2 103.3 35.2 101.9 43.8 100.8ZM39 88.5C39 88.5 30.5 90.7 45.1 92.2C62.1 93.9 79.4 93.6 96.2 89.8C103.8 88.1 110.8 85.8 110.8 85.8C110.8 85.8 106 88.1 97.4 90.2C82.8 93.8 61.7 94.7 44.2 93.8C31.5 93.2 21.8 90.7 21.8 90.7C21.8 90.7 30 89.4 39 88.5ZM71.8 63.8C75.8 68.3 71.5 75.6 62.1 80.5C52.7 85.4 39.5 87.8 35.8 84C32.1 80.2 38.8 76.8 48.2 71.9C57.6 67 67.8 59.3 71.8 63.8ZM81 76C81 76 89.5 73.1 85.1 66.8C81.2 61.2 70.3 64.4 61.2 68.5C70.3 65.2 80 64.7 82.2 68.3C84.4 71.9 77.2 74.8 77.2 74.8L81 76ZM87.8 81.3C87.8 81.3 97 78 93.2 71.3C89.9 65.5 79.2 68.2 69 72.8C78.5 69.4 88.2 69 90.2 72.8C92.2 76.6 84.8 79.8 84.8 79.8L87.8 81.3ZM70.8 12.8C70.8 12.8 81.2 23.5 63.8 38.3C50.2 49.9 67 59 67 59C67 59 47.8 52.2 57.5 38.8C65.2 28.2 70.8 12.8 70.8 12.8ZM87.2 29.8C87.2 29.8 93.5 37.8 79.2 49.8C68.8 58.5 78.8 65.5 78.8 65.5C78.8 65.5 63 59.8 72.8 48.8C81.5 39 87.2 29.8 87.2 29.8Z" fill="#ED8B00"/>
          <path d="M52.8 111.8C52.8 111.8 44.8 113 55.8 114C68.8 115.2 82.8 115 94.8 112.5C100.8 111.2 107.8 109.5 107.8 109.5C107.8 109.5 103.8 111.5 96.2 113.2C84 116 67.8 116.8 54.8 116C43.8 115.2 35.8 113.2 35.8 113.2C35.8 113.2 43.8 112.2 52.8 111.8Z" fill="#5382A1"/>
        </svg>
      );

    case 'nodejs':
      return (
        <svg className={className} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Node.js Hexagon Logo */}
          <path d="M64 4L116 34V94L64 124L12 94V34L64 4Z" fill="#339933"/>
          <path d="M64 16L105 39.5V86.5L64 110L23 86.5V39.5L64 16Z" fill="#215732"/>
          {/* JS Node text/symbol */}
          <path d="M64 35L90 50V80L64 95L38 80V50L64 35Z" fill="#68A063"/>
          <path d="M64 43L83 54V76L64 87L45 76V54L64 43Z" fill="white"/>
          <path d="M64 50C56.3 50 50 56.3 50 64C50 71.7 56.3 78 64 78C71.7 78 78 71.7 78 64C78 56.3 71.7 50 64 50ZM64 71C60.1 71 57 67.9 57 64C57 60.1 60.1 57 64 57C67.9 57 71 60.1 71 64C71 67.9 67.9 71 64 71Z" fill="#339933"/>
        </svg>
      );

    case 'rust':
      return (
        <svg className={className} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Rust Gear Logo */}
          <circle cx="64" cy="64" r="56" fill="#000000"/>
          <path d="M64 16C37.5 16 16 37.5 16 64C16 90.5 37.5 112 64 112C90.5 112 112 90.5 112 64C112 37.5 90.5 16 64 16ZM64 100C44.1 100 28 83.9 28 64C28 44.1 44.1 28 64 28C83.9 28 100 44.1 100 64C100 83.9 83.9 100 64 100Z" fill="#DEA584"/>
          {/* Gear teeth */}
          <path d="M60 4V16H68V4H60ZM60 112V124H68V112H60ZM4 60H16V68H4V60ZM112 60H124V68H112V60ZM21.6 15.9L30.1 24.4L35.8 18.7L27.3 10.2L21.6 15.9ZM92.2 86.5L100.7 95L106.4 89.3L97.9 80.8L92.2 86.5ZM102.1 21.6L89.3 34.4L95 40.1L107.8 27.3L102.1 21.6ZM20.2 103.5L33 90.7L27.3 85L14.5 97.8L20.2 103.5Z" fill="#DEA584"/>
          {/* Rust R */}
          <path d="M48 44H68C74.6 44 80 49.4 80 56C80 61.2 76.7 65.6 72 67.3L82 84H70L61.2 68H56V84H48V44ZM56 52V60H67C69.2 60 71 58.2 71 56C71 53.8 69.2 52 67 52H56Z" fill="#FFFFFF"/>
        </svg>
      );

    case 'sql':
      return (
        <svg className={className} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* SQL / Database Cylinder Logo */}
          <ellipse cx="64" cy="28" rx="48" ry="18" fill="#336791"/>
          <path d="M16 28V60C16 70 37.5 78 64 78C90.5 78 112 70 112 60V28C112 38 90.5 46 64 46C37.5 46 16 38 16 28Z" fill="#00758F"/>
          <path d="M16 60V92C16 102 37.5 110 64 110C90.5 110 112 102 112 92V60C112 70 90.5 78 64 78C37.5 78 16 70 16 60Z" fill="#336791"/>
          <ellipse cx="64" cy="28" rx="38" ry="12" fill="#4B9CD3"/>
          <text x="64" y="68" textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="900" fontFamily="sans-serif">SQL</text>
        </svg>
      );

    case 'html-css':
      return (
        <svg className={className} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dual HTML5 Orange + CSS3 Blue Shields */}
          {/* HTML5 Left Shield */}
          <g transform="translate(-8, 0) scale(0.85)">
            <path d="M18 12L25 92L64 103L103 92L110 12H18Z" fill="#E34F26"/>
            <path d="M64 20V95.5L95 86.8L101 20H64Z" fill="#EF652A"/>
            <path d="M64 42H40L41 53H64V64H42L44 80L64 85.5V74.5L54 71.8L53.5 64H64V42Z" fill="#FFFFFF"/>
            <path d="M64 42V53H87L86 64H64V74.5H76L74.8 86L64 89V100L88 93.5L91 58H64V42Z" fill="#EBEBEB"/>
          </g>
          {/* CSS3 Right Overlay Shield */}
          <g transform="translate(32, 24) scale(0.7)">
            <path d="M18 12L25 92L64 103L103 92L110 12H18Z" fill="#1572B6"/>
            <path d="M64 20V95.5L95 86.8L101 20H64Z" fill="#33A9DC"/>
            <path d="M64 42H40L41 53H86L87 42H64Z" fill="#FFFFFF"/>
            <path d="M64 64H42L43 75H64V64ZM64 75L54 72L53.5 66H42.5L44.5 86L64 91V75Z" fill="#EBEBEB"/>
          </g>
        </svg>
      );

    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
        </svg>
      );
  }
};
