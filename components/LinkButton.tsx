import Link, { LinkProps } from 'next/link';
import { Button, ButtonProps } from '@chakra-ui/react';

type LinkButtonProps = ButtonProps & LinkProps;

function LinkButton({ href, children, ...props }: LinkButtonProps) {
  return (
    <Link href={href}>
      <Button
        as="a"
        cursor="pointer"
        {...props}
      >
        {children}
      </Button>
    </Link>
  );
}

export default LinkButton;
