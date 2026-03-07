import React from 'react';
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="w-full max-w-md">
        <Lottie animationData={require('../../public/404-lottie.json')} loop autoplay style={{ width: '100%', height: 300 }} />
      </div>
      <h1 className="mt-8 text-4xl font-bold text-center">404 - Page Not Found</h1>
      <p className="mt-4 text-lg text-center text-muted-foreground max-w-xl">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <a href="/" className="mt-8 inline-block px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold shadow-lg hover:bg-primary/80 transition">
        Go Home
      </a>
    </div>
  );
}
