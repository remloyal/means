import { MainBody, MainRight } from '@/components/main';
import { useState } from 'react';

const CfrHome: React.FC = () => {
  return (
    <div className="cfr-home">
      <div className="summary">
        <MainBody style={{ position: 'relative', overflow: 'hidden' }}>
          <div>111</div>
        </MainBody>
        <MainRight>
          <div>222</div>
        </MainRight>
      </div>
    </div>
  );
};

export default CfrHome;
