'use client';

import { handleCreateLockerItem, handleUpdateLockerItem } from '@/actions/lockerActions';
import { useLocker } from '@/hooks/use-locker';
import { encryptPayload } from '@/lib/crypto';
import formatDate from '@/lib/util/formats';
import {
  BankAccountTemplate,
  CredentialsTemplate,
  CreditCardTemplate,
  IdentityTemplate,
  SecureNoteTemplate,
} from '@/lib/util/itemTemplates';
import { Item } from '@/prisma/client';
import { DecryptedLockerItem, ItemContent } from '@/types/client';
import { EncryptedLocker } from '@/types/server';
import {
  Alert,
  AlertContent,
  Badge,
  Box,
  Button,
  createListCollection,
  DataList,
  Editable,
  Field,
  Flex,
  Heading,
  IconButton,
  Input,
  Menu,
  Select,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import {
  TbAlignJustified,
  TbAsteriskSimple,
  TbAt,
  TbBuildingBank,
  TbCalendarEvent,
  TbCircleMinus,
  TbClock,
  TbCopy,
  TbCreditCard,
  TbCube,
  TbDeviceFloppy,
  TbDotsVertical,
  TbEyeOff,
  TbFileTypography,
  TbId,
  TbLink,
  TbNumber123,
  TbPasswordUser,
  TbPlus,
  TbRosetteDiscountCheck,
  TbTypography,
} from 'react-icons/tb';
import { PasswordInput } from '../ui/password-input';
import { toaster } from '../ui/toaster';

const templateOptions = createListCollection({
  items: [
    { value: 'credentials', label: 'Credentials', icon: <TbPasswordUser /> },
    { value: 'secureNote', label: 'Secure Note', icon: <TbFileTypography /> },
    { value: 'bankAccount', label: 'Bank Account', icon: <TbBuildingBank /> },
    { value: 'creditCard', label: 'Credit Card', icon: <TbCreditCard /> },
    { value: 'identity', label: 'Identity', icon: <TbId /> },
    { value: 'custom', label: 'Custom', icon: <TbCube /> },
  ],
});

export default function LockerItemForm({
  lockerItem,
  encryptedLockerItem,
  lockerId,
  encryptedLockers,
}: {
  lockerItem?: DecryptedLockerItem | null;
  encryptedLockerItem?: Item | null;
  lockerId?: string;
  encryptedLockers?: EncryptedLocker[];
}) {
  const router = useRouter();
  const { lockers, mek } = useLocker();

  const templateSelectRef = React.useRef<HTMLDivElement>(null);

  const [error, setError] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState(lockerItem?.item.title || '');
  const [template, setTemplate] = React.useState(lockerItem?.item.category || '');
  const [locker, setLocker] = React.useState(lockerId || lockerItem?.lockerId || '');
  const [itemContent, setItemContent] = React.useState<ItemContent[]>([]);

  const initializeLockerItemContent = React.useCallback(() => {
    if (lockerItem && lockerItem.item.decryptedData) {
      try {
        const parsedContent: ItemContent[] = Array.isArray(lockerItem.item.decryptedData)
          ? lockerItem.item.decryptedData
          : (Object.values(lockerItem.item.decryptedData) as unknown as ItemContent[]);
        setTemplate(lockerItem.item.category);
        setItemContent(parsedContent);
      } catch (err) {
        console.error('Failed to load decrypted item content:', err);
        setError('Failed to load item content. Please try again.');
      }
    }
  }, [lockerItem]);

  React.useEffect(() => {
    const load = () => {
      initializeLockerItemContent();
    };
    load();
  }, [initializeLockerItemContent]);

  const lockerOptions = React.useMemo(() => {
    return createListCollection({
      items: lockers.map((locker) => ({
        value: locker.id,
        label: locker.title,
      })),
    });
  }, [lockers]);

  const handleTemplateChange = (selectedTemplate: string) => {
    setTemplate(selectedTemplate);
    setItemContent([]);
    switch (selectedTemplate) {
      case 'credentials':
        setItemContent([...CredentialsTemplate]);
        break;
      case 'secureNote':
        setItemContent([...SecureNoteTemplate]);
        break;
      case 'bankAccount':
        setItemContent([...BankAccountTemplate]);
        break;
      case 'creditCard':
        setItemContent([...CreditCardTemplate]);
        break;
      case 'identity':
        setItemContent([...IdentityTemplate]);
        break;
      default:
        setItemContent([]);
        break;
    }
  };

  const toggleRequired = (index: number) =>
    setItemContent((prev) => prev.map((item, i) => (i === index ? { ...item, isRequired: !item.isRequired } : item)));

  const toggleMultiline = (index: number) =>
    setItemContent((prev) => prev.map((item, i) => (i === index ? { ...item, isMultiline: !item.isMultiline } : item)));

  const updateFieldType = (index: number, type: string) =>
    setItemContent((prev) => prev.map((item, i) => (i === index ? { ...item, type } : item)));

  const handleValueChange = (index: number, value: string) =>
    setItemContent((prev) => prev.map((item, i) => (i === index ? { ...item, value } : item)));

  const handleLabelChange = (index: number, label: string) =>
    setItemContent((prev) => prev.map((item, i) => (i === index ? { ...item, label } : item)));

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!mek) {
      setError('Master encryption key is not available. Please unlock your account.');
      return;
    }

    if (!title || !locker || !template) {
      setError('Please fill in all required fields.');
      return;
    }

    const payload = JSON.stringify(itemContent);
    const encryptedData = await encryptPayload(payload, mek);

    if (lockerItem) {
      // Update existing locker item
      const status = await handleUpdateLockerItem(locker, lockerItem.item.id, encryptedData, {
        category: template,
        title,
      });
      if (!status.success) {
        setError(status.error || 'Failed to update locker item.');
        return;
      } else {
        toaster.success({
          title: 'Locker Item Updated',
          description: `The item "${title}" has been successfully updated in the locker.`,
          type: 'success',
        });
        router.push(`/locker/${locker}/item/${status.data.id}`);
      }
    } else {
      // Create a new locker item
      const status = await handleCreateLockerItem(locker, encryptedData, { category: template, title });
      if (!status.success) {
        setError(status.error || 'Failed to create locker item.');
        return;
      }
      toaster.success({
        title: 'Locker Item Created',
        description: `The item "${title}" has been successfully created in the locker.`,
        type: 'success',
      });
      router.push(`/locker/${locker}/item/${status.data.id}`);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error('Failed to copy text: ', err);
      setError('Failed to copy text to clipboard.');
    });
    toaster.success({
      title: 'Copied to Clipboard',
      description: 'The text has been copied to your clipboard.',
      type: 'success',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap={4}>
        {error && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <AlertContent>
              <Alert.Title>Cannot Save Item</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </AlertContent>
          </Alert.Root>
        )}
        <Field.Root required colorPalette="yellow">
          <Field.Label>
            Title
            <Field.RequiredIndicator />
          </Field.Label>
          <Input
            type="text"
            size="sm"
            placeholder="Enter item name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field.Root>
        <Field.Root required colorPalette="yellow">
          <Field.Label>
            Locker
            <Field.RequiredIndicator />
          </Field.Label>
          <Select.Root
            ref={templateSelectRef}
            multiple={false}
            size="sm"
            collection={lockerOptions}
            value={lockerId ? [lockerId] : locker ? [locker] : []}
            onValueChange={(e) => setLocker(e.value[0])}
          >
            <Select.Trigger>
              <Select.ValueText placeholder="Select a locker" />
            </Select.Trigger>
            <Select.Positioner>
              <Select.Content>
                {lockerOptions.items.length === 0 && (
                  <Select.Item key="no-lockers" item={{ value: 'no-lockers', label: 'No lockers available' }}>
                    <Select.ItemText>No lockers available</Select.ItemText>
                  </Select.Item>
                )}
                {lockerOptions.items.map((option) => (
                  <Select.Item key={option.value} item={option}>
                    <Select.ItemText>{option.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        </Field.Root>
        <Field.Root required colorPalette="yellow">
          <Field.Label>
            Template
            <Field.RequiredIndicator />
          </Field.Label>
          <Select.Root
            size="sm"
            collection={templateOptions}
            value={template ? [template] : []}
            onValueChange={(e) => {
              handleTemplateChange(e.value[0]);
            }}
          >
            <Select.Trigger>
              <Select.ValueText placeholder="Select a template" />
            </Select.Trigger>
            <Select.Positioner>
              <Select.Content>
                <Select.ItemGroup>
                  <Select.ItemGroupLabel>Choose a template</Select.ItemGroupLabel>
                  {templateOptions.items.map((option) => (
                    <Select.Item key={option.value} item={option}>
                      <Select.Indicator color="fg">{option.icon}</Select.Indicator>
                      <Select.ItemText>{option.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.ItemGroup>
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        </Field.Root>

        <Box my={2}>
          <Flex align="center" justify="space-between" my={2}>
            <Heading
              as="h2"
              size="md"
              fontWeight="bold"
              textDecoration="underline"
              textDecorationColor="yellow.emphasized"
              textDecorationThickness={2}
              textUnderlineOffset={2}
            >
              Item Content
            </Heading>
            <Button
              variant="subtle"
              size="2xs"
              colorPalette="yellow"
              onClick={() => setItemContent([...itemContent, { label: 'New Field', value: '', type: 'text' }])}
            >
              <TbPlus /> Add Field
            </Button>
          </Flex>
          <Text fontSize="sm" color="fg.muted">
            Add fields to your item. Click the label above to edit the field label. Change the value settings with the
            options menus.
          </Text>
        </Box>

        {itemContent.length === 0 && (
          <Flex
            direction="column"
            align="center"
            justify="center"
            py={6}
            gap={2}
            borderWidth={1}
            borderStyle="dashed"
            borderColor="fg.muted"
            rounded="md"
          >
            <TbCube size={48} />
            <Text fontSize="sm" color="fg.muted">
              No fields added yet. Click &quot;Add Field&quot; to start adding content to your item.
            </Text>
          </Flex>
        )}
        {itemContent.map((content, index) => (
          <Field.Root required={content.isRequired} colorPalette="yellow" key={index}>
            <Field.Label>
              <Editable.Root
                value={content.label}
                onValueChange={(v) => handleLabelChange(index, v.value)}
                size="sm"
                gap={0}
              >
                <Editable.Preview fontWeight="500" lineHeight="1.25rem" />
                <Editable.Input placeholder="Field Label" />
              </Editable.Root>
              {content.isRequired && <Field.RequiredIndicator />}
            </Field.Label>

            <Flex w="full" gap={1}>
              {content.isMultiline ? (
                <Textarea
                  placeholder="Field Value"
                  value={content.value}
                  onChange={(e) => handleValueChange(index, e.target.value)}
                />
              ) : content.type === 'password' ? (
                <PasswordInput
                  size="sm"
                  placeholder="Field Value"
                  value={content.value}
                  onChange={(e) => handleValueChange(index, e.target.value)}
                />
              ) : (
                <Input
                  size="sm"
                  placeholder="Field Value"
                  value={content.value}
                  type={content.type}
                  onChange={(e) => handleValueChange(index, e.target.value)}
                />
              )}

              <Menu.Root>
                <Menu.Trigger asChild>
                  <IconButton variant="subtle" size="sm" zIndex={90}>
                    <TbDotsVertical />
                  </IconButton>
                </Menu.Trigger>
                <Menu.Positioner>
                  <Menu.Content zIndex={100}>
                    <Menu.ItemGroup>
                      <Menu.ItemGroupLabel>Field Options</Menu.ItemGroupLabel>
                      <Menu.CheckboxItem
                        checked={content.isRequired ?? false}
                        value="required"
                        onCheckedChange={() => toggleRequired(index)}
                      >
                        <TbAsteriskSimple />
                        Required
                        <Menu.ItemIndicator />
                      </Menu.CheckboxItem>
                      <Menu.CheckboxItem
                        checked={content.isMultiline ?? false}
                        value="multiline"
                        onCheckedChange={() => toggleMultiline(index)}
                      >
                        <TbAlignJustified />
                        Multiline
                        <Menu.ItemIndicator />
                      </Menu.CheckboxItem>
                    </Menu.ItemGroup>
                    <Menu.Separator />
                    <Menu.RadioItemGroup
                      value={content.type}
                      onValueChange={(v) => {
                        updateFieldType(index, v.value);
                      }}
                    >
                      <Menu.ItemGroupLabel>Field Type</Menu.ItemGroupLabel>
                      <Menu.RadioItem value="password">
                        <TbEyeOff />
                        Password
                        <Menu.ItemIndicator />
                      </Menu.RadioItem>
                      <Menu.RadioItem value="text">
                        <TbTypography />
                        Text
                        <Menu.ItemIndicator />
                      </Menu.RadioItem>
                      <Menu.RadioItem value="number">
                        <TbNumber123 />
                        Number
                        <Menu.ItemIndicator />
                      </Menu.RadioItem>
                      <Menu.RadioItem value="email">
                        <TbAt />
                        Email
                        <Menu.ItemIndicator />
                      </Menu.RadioItem>
                      <Menu.RadioItem value="url">
                        <TbLink />
                        URL
                        <Menu.ItemIndicator />
                      </Menu.RadioItem>
                      <Menu.RadioItem value="date">
                        <TbCalendarEvent />
                        Date
                        <Menu.ItemIndicator />
                      </Menu.RadioItem>
                      <Menu.RadioItem value="time">
                        <TbClock />
                        Time
                        <Menu.ItemIndicator />
                      </Menu.RadioItem>
                    </Menu.RadioItemGroup>
                    <Menu.Separator />
                    <Menu.Item value="copy" onClick={() => copyToClipboard(content.value)}>
                      <TbCopy />
                      Copy Value
                    </Menu.Item>
                    <Menu.Separator />
                    <Menu.Item
                      value="delete"
                      colorPalette="red"
                      onClick={() => setItemContent((prev) => prev.filter((_, i) => i !== index))}
                      _hover={{ bg: 'red.subtle' }}
                    >
                      <TbCircleMinus />
                      Delete Field
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Menu.Root>
            </Flex>
          </Field.Root>
        ))}

        {lockerItem && (
          <DataList.Root orientation="horizontal" size="sm" variant="subtle" mt={4}>
            <DataList.Item display="flex" gap={2}>
              <DataList.ItemLabel flex={1}>Integrity:</DataList.ItemLabel>
              <DataList.ItemValue flex={1}>
                <Badge colorPalette="green" variant="subtle">
                  <TbRosetteDiscountCheck />
                  Verified
                </Badge>
              </DataList.ItemValue>
            </DataList.Item>
            <DataList.Item display="flex" gap={2}>
              <DataList.ItemLabel flex={1}>Created At:</DataList.ItemLabel>
              <DataList.ItemValue flex={1}>
                {lockerItem.item.createdAt ? formatDate(lockerItem.item.createdAt) : 'N/A'}
              </DataList.ItemValue>
            </DataList.Item>
            <DataList.Item display="flex" gap={2}>
              <DataList.ItemLabel flex={1}>Last Updated:</DataList.ItemLabel>
              <DataList.ItemValue flex={1}>
                {lockerItem.item.updatedAt ? formatDate(lockerItem.item.updatedAt) : 'N/A'}
              </DataList.ItemValue>
            </DataList.Item>
          </DataList.Root>
        )}

        <Flex
          mt={6}
          direction={{
            base: 'column',
            md: 'row',
          }}
          gap={2}
          justify="flex-end"
        >
          {lockerItem && (
            <Button
              type="button"
              variant="subtle"
              colorPalette="red"
              mr={['initial', 'auto']}
              onClick={() => router.back()}
            >
              Delete Item
            </Button>
          )}

          <Button type="button" variant="subtle" mr={2} onClick={() => router.back()}>
            Cancel
          </Button>

          <Button type="submit" colorPalette="yellow" variant="solid">
            <TbDeviceFloppy />
            Save Item
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}
