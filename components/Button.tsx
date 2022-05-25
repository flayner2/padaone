import { useRef } from 'react';
import { useButton } from 'react-aria';
import type { AriaButtonProps } from '@react-types/button';
import { Button as ChakraButton } from '@chakra-ui/react';

export function CalendarButton(props: AriaButtonProps<'button'>) {
  let ref = useRef<HTMLButtonElement>(null);
  let { buttonProps } = useButton(props, ref);

  return (
    <ChakraButton
      {...buttonProps}
      ref={ref}
      size="sm"
    >
      {props.children}
    </ChakraButton>
  );
}

export function FieldButton(props: AriaButtonProps<'button'>) {
  let ref = useRef<HTMLButtonElement>(null);
  let { buttonProps } = useButton(props, ref);

  return (
    <ChakraButton
      {...buttonProps}
      ref={ref}
      size="sm"
      h="1.75rem"
      mr="2"
    >
      {props.children}
    </ChakraButton>
  );
}
