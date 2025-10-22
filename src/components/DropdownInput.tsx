import { Select } from 're-native-ui';
import React, { useState } from 'react';

const DropdownInput = () =>{

  const [country, setCountry] = useState('');

  const countryOptions = [
    { label: 'United States', value: 'us' },
    { label: 'Canada', value: 'ca' },
    { label: 'United Kingdom', value: 'uk' },
    { label: 'Australia', value: 'au' },
  ];

  return(
    <Select
      label="Country"
      placeholder="Select your country"
      value={country}
      onChange={setCountry}
      options={countryOptions}
    />

  );
};

export default DropdownInput;
