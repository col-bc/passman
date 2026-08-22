'use client';

import { ChakraProvider, createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { ThemeProvider } from 'next-themes';

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'var(--font-heading)' },
        body: { value: 'var(--font-sans)' },
        mono: { value: 'var(--font-mono)' },
      },
    },
  },
});

const system = createSystem(defaultConfig, config);

export default function Provider(props: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange enableSystem={false} defaultTheme="light">
      <ChakraProvider value={system}>{props.children}</ChakraProvider>
    </ThemeProvider>
  );
}
