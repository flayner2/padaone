import { CalendarIcon, NotAllowedIcon } from '@chakra-ui/icons';
import {
  Box,
  FormLabel,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { useDateRangePicker } from '@react-aria/datepicker';
import type { DateRangePickerStateOptions } from '@react-stately/datepicker';
import { useDateRangePickerState } from '@react-stately/datepicker';
import type { TimeValue } from '@react-types/datepicker';
import { useRef } from 'react';
import { FieldButton } from './Button';
import { DateField, StyledField, TimeField } from './DateField';
import { Popover } from './CalendarPopover';
import { RangeCalendar } from './RangeCalendar';

export function DateRangePicker(
  props: DateRangePickerStateOptions
): JSX.Element {
  let state = useDateRangePickerState({
    ...props,
    shouldCloseOnSelect: false,
  });
  let ref = useRef<HTMLDivElement>(null);
  let {
    groupProps,
    labelProps,
    startFieldProps,
    endFieldProps,
    buttonProps,
    dialogProps,
    calendarProps,
  } = useDateRangePicker(props, state, ref);

  return (
    <Box
      position="relative"
      display="inline-flex"
      flexDirection="column"
    >
      <FormLabel {...labelProps}>{props.label}</FormLabel>
      <InputGroup
        {...groupProps}
        ref={ref}
        width="auto"
        display="inline-flex"
      >
        <StyledField pr="5.5rem">
          <DateField {...startFieldProps} />
          <Box
            as="span"
            aria-hidden="true"
            paddingX="2"
          >
            –
          </Box>
          <DateField {...endFieldProps} />
          {state.validationState === 'invalid' && (
            <NotAllowedIcon
              color="red.600"
              position="absolute"
              right="12"
            />
          )}
        </StyledField>
        <InputRightElement>
          <FieldButton
            {...buttonProps}
            isPressed={state.isOpen}
          >
            <CalendarIcon />
          </FieldButton>
        </InputRightElement>
      </InputGroup>
      {state.isOpen && (
        <Popover
          {...dialogProps}
          isOpen={state.isOpen}
          onClose={() => state.setOpen(false)}
        >
          <RangeCalendar {...calendarProps} />
          <Box
            display="flex"
            gap="2"
          >
            <TimeField
              label="Start time"
              value={state.timeRange?.start || null}
              onChange={(v: TimeValue) => state.setTime('start', v)}
            />
            <TimeField
              label="End time"
              value={state.timeRange?.end || null}
              onChange={(v: TimeValue) => state.setTime('end', v)}
            />
          </Box>
        </Popover>
      )}
    </Box>
  );
}
