// import './GlowingBox.scss';

// import React, { ReactNode } from 'react';

// interface GlowingBoxProps {
//   children: ReactNode;
// }

// const GlowingBox: React.FC<GlowingBoxProps> = ({ children }) => {
//   return <div className="glow-box">{children}</div>;
// };

// export default GlowingBox;
// GlowingBox.tsx

import './GlowingBox.scss';

import React, { ReactNode, useRef } from 'react';

interface GlowingBoxProps {
  children: ReactNode;
}

const GlowingBox: React.FC<GlowingBoxProps> = ({ children }) => {
  /** Box Ref */
  const BOX_REF = useRef<HTMLDivElement>(null);

  const handleFocus = (e: React.FocusEvent) => {
    /** Scroll into view on mobile */
    setTimeout(() => {
      BOX_REF.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <div ref={BOX_REF} className="glow-box" onFocus={handleFocus}>
      {children}
    </div>
  );
};

export default GlowingBox;
