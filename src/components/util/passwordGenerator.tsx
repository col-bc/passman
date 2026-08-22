'use client';

import { toaster } from '@/components/ui/toaster';
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  CloseButton,
  createListCollection,
  Dialog,
  Field,
  Flex,
  IconButton,
  Kbd,
  NumberInput,
  Select,
  SimpleGrid,
  Switch,
  Text,
} from '@chakra-ui/react';
import { DialogOpenChangeDetails } from '@chakra-ui/react/dialog';
import React from 'react';
import { TbCheck, TbCheckFilled, TbCopy, TbRefresh, TbX, TbXFilled } from 'react-icons/tb';
import { useColorModeValue } from '../ui/color-mode';

const modeOptions = createListCollection({
  items: [
    { label: 'Password', value: 'password' },
    { label: 'Passphrase', value: 'passphrase' },
    { label: 'PIN', value: 'pin' },
  ],
});

const separatorOptions = createListCollection({
  items: [
    { label: 'Space', value: ' ' },
    { label: 'Hyphen', value: '-' },
    { label: 'Underscore', value: '_' },
    { label: 'Dot', value: '.' },
  ],
});

export default function PasswordGenerator({ onSecretChange }: { onSecretChange?: (secret: string) => void }) {
  const lowerCaseColor = useColorModeValue('gray.600', 'gray.400');
  const upperCaseColor = useColorModeValue('green.600', 'green.400');
  const numberColor = useColorModeValue('blue.600', 'blue.400');
  const symbolColor = useColorModeValue('red.600', 'red.400');

  const [mode, setMode] = React.useState<'password' | 'passphrase' | 'pin'>('password');
  const [value, setValue] = React.useState('');
  const [length, setLength] = React.useState(12);
  const [includeSymbols, setIncludeSymbols] = React.useState(true);
  const [includeNumbers, setIncludeNumbers] = React.useState(true);
  const [includeUppercase, setIncludeUppercase] = React.useState(true);
  const [includeLowercase, setIncludeLowercase] = React.useState(true);
  const [separator, setSeparator] = React.useState(separatorOptions.items[0].value);
  const [error, setError] = React.useState('');

  const handleGeneratePassword = () => {
    setError('');
    if (!includeSymbols && !includeNumbers && !includeUppercase && !includeLowercase) {
      setError('At least one character type must be selected.');
      return;
    }

    const charset = [
      includeSymbols ? '!@#$%^&*()_+[]{}|;:,.<>?' : '',
      includeNumbers ? '0123456789' : '',
      includeUppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
      includeLowercase ? 'abcdefghijklmnopqrstuvwxyz' : '',
    ].join('');

    let generatedPassword = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      generatedPassword += charset[randomIndex];
    }

    setValue(generatedPassword);
    onSecretChange?.(generatedPassword);
  };

  const handleGeneratePassphrase = () => {
    const getWords = async () => {
      try {
        const response = await fetch(`/api/wordlist?count=${length}`, { method: 'GET' });

        if (!response.ok) {
          throw new Error('Failed to fetch word list');
        }
        const { words }: { words: string[] } = await response.json();

        if (includeSymbols) {
          const symbols = [
            '!',
            '@',
            '#',
            '$',
            '%',
            '^',
            '&',
            '*',
            '(',
            ')',
            '_',
            '+',
            '-',
            '=',
            '{',
            '}',
            '[',
            ']',
            '|',
            ':',
            ';',
            '"',
            "'",
            '<',
            '>',
            ',',
            '.',
            '?',
          ];
          const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
          const randomIndex = Math.floor(Math.random() * words.length);
          words[randomIndex] += randomSymbol;
        }

        if (includeNumbers) {
          const randomNumber = Math.floor(Math.random() * 10).toString();
          const randomIndex = Math.floor(Math.random() * words.length);
          words[randomIndex] += randomNumber;
        }

        if (includeUppercase) {
          const randomIndex = Math.floor(Math.random() * words.length);
          words[randomIndex] = words[randomIndex].charAt(0).toUpperCase() + words[randomIndex].slice(1);
        }

        return words;
      } catch (error) {
        console.error(error);
        return [];
      }
    };
    getWords().then((words) => {
      const generatedPassphrase = words.join(separator);
      setValue(generatedPassphrase);
      onSecretChange?.(generatedPassphrase);
    });
  };

  const handleGeneratePin = () => {
    const generatedPin = Array.from({ length: length }, () => Math.floor(Math.random() * 10)).join('');
    setValue(generatedPin);
    onSecretChange?.(generatedPin);
  };

  const handleGenerate = () => {
    if (mode === 'password') {
      handleGeneratePassword();
    } else if (mode === 'passphrase') {
      handleGeneratePassphrase();
    } else if (mode === 'pin') {
      handleGeneratePin();
    }
  };

  React.useEffect(() => {
    if (mode === 'password') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLength(12);
      setIncludeSymbols(true);
      setIncludeNumbers(true);
      setIncludeUppercase(true);
      setIncludeLowercase(true);
    } else if (mode === 'passphrase') {
      setLength(6);
      setIncludeSymbols(false);
      setIncludeNumbers(false);
      setIncludeUppercase(false);
      setIncludeLowercase(true);
    } else if (mode === 'pin') {
      setLength(4);
      setIncludeSymbols(false);
      setIncludeNumbers(true);
      setIncludeUppercase(false);
      setIncludeLowercase(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  React.useEffect(() => {
    const doEffect = () => handleGenerate();
    doEffect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, length, includeSymbols, includeNumbers, includeUppercase, includeLowercase, separator]);

  const charColor = (char: string) => {
    if ('!@#$%^&*()_+[]{}|;:,.<>?'.includes(char)) return symbolColor;
    if ('0123456789'.includes(char)) return numberColor;
    if ('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(char)) return upperCaseColor;
    if ('abcdefghijklmnopqrstuvwxyz'.includes(char)) return lowerCaseColor;
    return 'fg.muted';
  };

  return (
    <Flex direction="column" gap={6} w="full">
      {error && (
        <Alert.Root size="sm" status="error" mb={4}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Failed to Generate Password</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      <Flex align="center" bg="bg.muted" color="fg.muted" rounded="md" px={4} py={2} gap={2}>
        <Box flex="1" display="flex" overflowX="auto" userSelect="all">
          {value.split('').map((char, index) => (
            <Box key={index} color={charColor(char)} fontFamily="monospace" fontSize="lg" whiteSpace="pre">
              {char}
            </Box>
          ))}
        </Box>
        <ButtonGroup attached ml="auto">
          <IconButton
            variant="surface"
            colorPalette="gray"
            aria-label="Copy password"
            onClick={() => {
              navigator.clipboard.writeText(value);
              toaster.success({
                title: 'Copied to Clipboard',
                description: 'The password has been copied to your clipboard.',
                duration: 2000,
                closable: true,
              });
            }}
          >
            <TbCopy />
          </IconButton>
          <IconButton
            variant="surface"
            colorPalette="gray"
            aria-label="Copy password"
            onClick={() => handleGenerate()}
            ml="auto"
          >
            <TbRefresh />
          </IconButton>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={[1, 2, 2, 3]} gap={6}>
        <Field.Root colorPalette="yellow">
          <Field.Label>Mode</Field.Label>
          <Select.Root
            collection={modeOptions}
            value={[mode]}
            onValueChange={(val) => setMode(val.value[0] as typeof mode)}
          >
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select Mode" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                <Select.List>
                  {modeOptions.items.map((item) => (
                    <Select.Item key={item.value} item={item}>
                      {item.label}
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        </Field.Root>

        <Field.Root colorPalette="yellow">
          <Field.Label>{mode === 'passphrase' ? 'Word Count' : 'Character Length'}</Field.Label>
          <NumberInput.Root
            value={length.toString()}
            onValueChange={(val) => setLength(val.valueAsNumber)}
            min={1}
            max={mode === 'passphrase' ? 20 : 100}
            w="full"
          >
            <NumberInput.Control />
            <NumberInput.Input />
          </NumberInput.Root>
        </Field.Root>

        <Field.Root colorPalette="yellow">
          <Field.Label>Separator</Field.Label>
          <Select.Root
            colorPalette="yellow"
            collection={separatorOptions}
            value={[separator]}
            onValueChange={(val) => setSeparator(val.value[0])}
          >
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select Separator" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                <Select.List>
                  {separatorOptions.items.map((item) => (
                    <Select.Item key={item.value} item={item} justifyContent="flex-start">
                      <Text>{item.label}</Text> - <Kbd>{item.value}</Kbd>
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        </Field.Root>
      </SimpleGrid>

      {['password', 'passphrase'].includes(mode) && (
        <SimpleGrid columns={[1, 2, 2, 3]} gap={6}>
          <Field.Root orientation="horizontal" colorPalette="yellow">
            <Switch.Root checked={includeSymbols} onCheckedChange={() => setIncludeSymbols(!includeSymbols)}>
              <Switch.HiddenInput />
              <Switch.Control>
                <Switch.Thumb>
                  <Switch.ThumbIndicator fallback={<TbXFilled color="black" />}>
                    <TbCheckFilled color="white" />
                  </Switch.ThumbIndicator>
                </Switch.Thumb>
              </Switch.Control>
              <Switch.Label>Include Symbols</Switch.Label>
            </Switch.Root>
          </Field.Root>

          <Field.Root orientation="horizontal" colorPalette="yellow">
            <Switch.Root checked={includeNumbers} onCheckedChange={() => setIncludeNumbers(!includeNumbers)}>
              <Switch.HiddenInput />
              <Switch.Control>
                <Switch.Thumb>
                  <Switch.ThumbIndicator fallback={<TbXFilled color="black" />}>
                    <TbCheckFilled color="white" />
                  </Switch.ThumbIndicator>
                </Switch.Thumb>
              </Switch.Control>
              <Switch.Label>Include Numbers</Switch.Label>
            </Switch.Root>
          </Field.Root>

          <Field.Root orientation="horizontal" colorPalette="yellow">
            <Switch.Root checked={includeLowercase} onCheckedChange={() => setIncludeLowercase(!includeLowercase)}>
              <Switch.HiddenInput />
              <Switch.Control>
                <Switch.Thumb>
                  <Switch.ThumbIndicator fallback={<TbXFilled color="black" />}>
                    <TbCheckFilled color="white" />
                  </Switch.ThumbIndicator>
                </Switch.Thumb>
              </Switch.Control>
              <Switch.Label>Include Lowercase</Switch.Label>
            </Switch.Root>
          </Field.Root>

          <Field.Root orientation="horizontal" colorPalette="yellow">
            <Switch.Root checked={includeUppercase} onCheckedChange={() => setIncludeUppercase(!includeUppercase)}>
              <Switch.HiddenInput />
              <Switch.Control>
                <Switch.Thumb>
                  <Switch.ThumbIndicator fallback={<TbXFilled color="black" />}>
                    <TbCheckFilled color="white" />
                  </Switch.ThumbIndicator>
                </Switch.Thumb>
              </Switch.Control>
              <Switch.Label>Include Uppercase</Switch.Label>
            </Switch.Root>
          </Field.Root>
        </SimpleGrid>
      )}
    </Flex>
  );
}

export function PasswordGeneratorDialog({
  open,
  setOpen,
  onSetSecret,
}: {
  open: boolean;
  setOpen: (open: DialogOpenChangeDetails) => void;
  onSetSecret: (secret: string) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={setOpen} placement="bottom" motionPreset="slide-in-bottom">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content w="full" maxW="2xl">
          <Dialog.Header>
            <Dialog.Title fontFamily="heading">Generate Password</Dialog.Title>
            <Dialog.CloseTrigger asChild>
              <CloseButton colorPalette="gray" />
            </Dialog.CloseTrigger>
          </Dialog.Header>
          <Dialog.Body>
            <PasswordGenerator onSecretChange={onSetSecret} />
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.ActionTrigger asChild>
              <Button colorPalette="gray" variant="subtle" onClick={() => setOpen({ open: false })}>
                <TbX />
                Close
              </Button>
            </Dialog.ActionTrigger>
            <Dialog.ActionTrigger asChild>
              <Button
                colorPalette="yellow"
                onClick={() => {
                  setOpen({ open: false });
                }}
              >
                <TbCheck />
                Use Password
              </Button>
            </Dialog.ActionTrigger>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
