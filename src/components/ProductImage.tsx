import { useState } from 'react';

interface ProductImageProps {
  src?: string;
  alt: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function ProductImage({ src, alt, size = 'medium', className = '' }: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  const placeholderClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-10 h-10 text-sm',
    large: 'w-16 h-16 text-base'
  };

  if (!src || imageError) {
    return (
      <div className={`${placeholderClasses[size]} bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-gray-500 ${className}`}>
        <span className="font-medium">📦</span>
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {imageLoading && (
        <div className={`absolute inset-0 ${placeholderClasses[size]} bg-gray-100 border border-gray-300 rounded flex items-center justify-center`}>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses[size]} object-cover rounded border border-gray-300 ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
      />
    </div>
  );
} 