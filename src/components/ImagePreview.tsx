"use client";

import { useState } from "react";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface ImagePreviewProps {
  images: string[];
  selectedImage: number;
  onImageSelect: (index: number) => void;
  productName: string;
}

// Custom arrow components
const PrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-50 transition-colors"
  >
    <ChevronLeft className="h-4 w-4 text-gray-600" />
  </button>
);

const NextArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-50 transition-colors"
  >
    <ChevronRight className="h-4 w-4 text-gray-600" />
  </button>
);

export default function ImagePreview({
  images,
  selectedImage,
  onImageSelect,
  productName,
}: ImagePreviewProps) {
  // Slider settings
  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 300,
    slidesToShow: 4,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };

  // If images are 4 or less, show them in a grid without slider
  if (images.length <= 4) {
    return (
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => onImageSelect(index)}
            className={`aspect-square bg-white rounded-lg border-2 overflow-hidden transition-all ${
              selectedImage === index
                ? "border-amber-400 ring-2 ring-amber-200"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              {image ? (
                <img
                  src={image}
                  alt={`${productName} - Ảnh ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              )}
            </div>
          </button>
        ))}
      </div>
    );
  }

  // If more than 4 images, use slider
  return (
    <div className="relative">
      <Slider ref={setSliderRef} {...sliderSettings}>
        {images.map((image, index) => (
          <div key={index} className="px-1">
            <button
              onClick={() => onImageSelect(index)}
              className={`aspect-square bg-white rounded-lg border-2 overflow-hidden transition-all w-full cursor-pointer ${
                selectedImage === index
                  ? "border-amber-400 ring-2 ring-amber-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                {image ? (
                  <img
                    src={image}
                    alt={`${productName} - Ảnh ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                )}
              </div>
            </button>
          </div>
        ))}
      </Slider>

      {/* Image counter */}
      {/* <div className="text-center mt-2">
        <span className="text-xs text-gray-500">
          {selectedImage + 1} / {images.length}
        </span>
      </div> */}
    </div>
  );
}
