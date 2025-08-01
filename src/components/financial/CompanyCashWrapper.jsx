import React, { forwardRef } from 'react';
import CompanyCash from './CompanyCash';

const CompanyCashWrapper = forwardRef((props, ref) => {
  return <CompanyCash ref={ref} {...props} />;
});

CompanyCashWrapper.displayName = "CompanyCashWrapper";
export default CompanyCashWrapper;