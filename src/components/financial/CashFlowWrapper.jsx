import React, { forwardRef } from 'react';
import CashFlow from './CashFlow';


const CashFlowWrapper = forwardRef((props, ref) => {
  return <CashFlow ref={ref} {...props} />;
});

CashFlowWrapper.displayName = "CashFlowWrapper";
export default CashFlowWrapper;