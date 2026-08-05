'use client';

import { ChakraProvider, createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { ThemeProvider } from 'next-themes';

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'var(--font-heading)' },
        body: { value: 'var(--font-sans)' },
      },
      radii: {
        xs: { value: '4px' },
        sm: { value: '8px' },
        md: { value: '12px' },
        lg: { value: '16px' },
      },
    },
  },
});

const system = createSystem(defaultConfig, config);

export default function Provider(props: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <ThemeProvider attribute="class" disableTransitionOnChange enableSystem={false}>
        {props.children}
      </ThemeProvider>
    </ChakraProvider>
  );
}
