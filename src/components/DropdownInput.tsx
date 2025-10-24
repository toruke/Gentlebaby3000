import { Select } from 're-native-ui';
import React from 'react';

const DropdownInput = ({ selectedValue , options, onValueChange }:{selectedValue:string, options:{label: string,value:string}[],onValueChange:(val:string)=>void}) => {

  return(
    <Select
      label="Family"
      placeholder="Select your family"
      value={selectedValue}
      onChange={onValueChange}
      options={options}
    />

  );
};

export default DropdownInput;
