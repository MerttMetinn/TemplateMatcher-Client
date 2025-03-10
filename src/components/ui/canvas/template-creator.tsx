'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const TemplateCreatorComponent = dynamic(
  () => import('./template-creator-component').then(mod => mod.TemplateCreatorComponent),
  { ssr: false }
);

export function TemplateCreator() {

  return (
    <div className="relative w-full max-w-none">
      <TemplateCreatorComponent />
    </div>
  );
}
