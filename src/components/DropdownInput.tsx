import { Select } from 're-native-ui';
import React from 'react';

/*
interface DropdownInputProps {
  selectedValue : string;
  options: { label: string; value: string }[];
  onValueChange: (val: string) => void;
}*/

const DropdownInput = ({ selectedValue , options, onValueChange }:{selectedValue:string, options:void[],onValueChange:(val:string)=>void}) => {

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
