import type { DatePickerInputProps } from '../lib/types';
import { Input, FormControl, FormLabel } from '@chakra-ui/react';
import type { Ref } from 'react';
import React from 'react';

const CustomDateInput = (
  { onClick, value, onChange, ...props }: DatePickerInputProps,
  ref: Ref<HTMLInputElement>
) => (
  <FormControl>
    <FormLabel
      fontSize="sm"
      color="protBlack.700"
    >
      {props.inputlabel}
    </FormLabel>
    <Input
      placeholder="Description"
      onClick={onClick}
      value={value}
      ref={ref}
      onChange={onChange}
      size="md"
      {...props}
    />
  </FormControl>
);

CustomDateInput.displayName = 'DateInput';

export default CustomDateInput;
