import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  image?: string;
  footer?: React.ReactNode;
  hover?: boolean;
  className?: string;
}

export default function Card({
  children,
  title,
  subtitle,
  image,
  footer,
  hover = true,
  className = '',
}: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-md overflow-hidden
        ${hover ? 'hover:shadow-xl hover:-translate-y-1' : ''}
        transition-all duration-300
        ${className}
      `}
    >
      {/* Imagen opcional */}
      {image && (
        <div className="h-48 overflow-hidden">
          <img
            src={image}
            alt={title || 'Card image'}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          />
        </div>
      )}

      {/* Contenido */}
      <div className="p-6">
        {/* Header */}
        {(title || subtitle) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        )}

        {/* Body */}
        <div className="text-gray-600">{children}</div>
      </div>

      {/* Footer opcional */}
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
}
