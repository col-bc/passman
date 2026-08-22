import { ClientOnly, IconButton, Text, TextProps } from '@chakra-ui/react';
import React from 'react';
import { TbEye, TbEyeOff } from 'react-icons/tb';

interface ScreenValueProps extends TextProps {
  showDefault?: boolean;
}

export default function ScreenValue({ showDefault = false, ...props }: ScreenValueProps) {
  const [show, setShow] = React.useState(showDefault);
  const screenedValue = Array.from({ length: props.children?.toString().length || 0 }, () => '•').join('');

  return (
    <ClientOnly
      fallback={
        <Text as="span" {...props}>
          {screenedValue}
        </Text>
      }
    >
      <Text
        as="span"
        display="inline-flex"
        alignItems="center"
        gap={1}
        verticalAlign="middle"
        fontFamily="mono"
        {...props}
      >
        {show ? props.children : screenedValue}
        <IconButton
          size="xs"
          onClick={() => setShow(!show)}
          aria-label={show ? 'Hide value' : 'Show value'}
          variant="ghost"
          h="auto"
          minW="auto"
          p={1}
        >
          {show ? <TbEyeOff className="size-4!" /> : <TbEye className="size-4!" />}
        </IconButton>
      </Text>
    </ClientOnly>
  );
}
