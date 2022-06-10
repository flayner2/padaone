import { chakra } from '@chakra-ui/react';
import React, { forwardRef } from 'react';
import type { CustomDatePickerProps } from '../lib/types';
import ReactDatePicker from 'react-datepicker';
import CustomDateInput from './CustomDateInput';
import CustomCalendarContainer from './CustomCalendarContainer';

const CustomInput = forwardRef(CustomDateInput);

const ChakraDatePicker = chakra(ReactDatePicker);

const DatePicker = ({ ...props }: CustomDatePickerProps) => {
  return (
    <ChakraDatePicker
      customInput={
        <CustomInput
          padding="0 1rem"
          background="protGray.500"
          borderRadius="8px"
          color="protBlack.800"
          fontSize="sm"
          inputlabel={props.inputlabel}
        />
      }
      {...props}
      calendarContainer={CustomCalendarContainer}
    />
  );
};

export default DatePicker;
