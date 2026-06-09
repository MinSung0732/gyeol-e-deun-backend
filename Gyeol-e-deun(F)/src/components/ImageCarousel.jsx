import React, { useState, useCallback } from 'react';
import { IMAGE_PLACEHOLDER } from '../utils/productImages';

const MAX_IMAGES = 5;

function ImageCarousel({ images = [], alt = '상품 이미지', badge = null }) {
  const slides = images.length > 0 ? images.slice(0, MAX_IMAGES) : [IMAGE_PLACEHOLDER.large];
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasMultiple = slides.length > 1;

  const goTo = useCallback((index) => {
    if (index < 0) {
      setCurrentIndex(slides.length - 1);
    } else if (index >= slides.length) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(index);
    }
  }, [slides.length]);

  return (
    <div className="image-carousel">
      <div className="carousel-viewport">
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((url, idx) => (
            <div className="carousel-slide" key={`${url}-${idx}`}>
              <img src={url} alt={`${alt} ${idx + 1}`} />
            </div>
          ))}
        </div>

        {badge}

        {hasMultiple && (
          <>
            <button
              type="button"
              className="carousel-arrow carousel-arrow-prev"
              onClick={() => goTo(currentIndex - 1)}
              aria-label="이전 이미지"
            >
              ‹
            </button>
            <button
              type="button"
              className="carousel-arrow carousel-arrow-next"
              onClick={() => goTo(currentIndex + 1)}
              aria-label="다음 이미지"
            >
              ›
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="carousel-footer">
          <div className="carousel-dots">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`${idx + 1}번째 이미지`}
              />
            ))}
          </div>
          <span className="carousel-counter">
            {currentIndex + 1} / {slides.length}
          </span>
        </div>
      )}
    </div>
  );
}

export default ImageCarousel;
