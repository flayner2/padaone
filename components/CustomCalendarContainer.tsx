import { CalendarContainer } from 'react-datepicker';
import { Box } from '@chakra-ui/react';
import type { CalendarContainerProps } from '../lib/types';
import { chakra } from '@chakra-ui/react';

const ChakraCalendarContainer = chakra(CalendarContainer);

function CustomCalendarContainer({
  children,
  ...props
}: CalendarContainerProps) {
  return (
    <Box padding="0.5rem">
      <ChakraCalendarContainer
        {...props}
        background="protGray.100"
      >
        <Box position="relative">{children}</Box>
      </ChakraCalendarContainer>
    </Box>
  );
}

export default CustomCalendarContainer;
