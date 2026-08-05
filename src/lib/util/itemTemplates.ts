import { ItemContent } from '@/types/client';

export const CredentialsTemplate: ItemContent[] = [
  {
    label: 'URL',
    value: '',
    type: 'url',
  },
  {
    label: 'Username',
    value: '',
    type: 'email',
    isRequired: true,
  },
  {
    label: 'Password',
    value: '',
    type: 'password',
    isRequired: true,
  },
];

export const SecureNoteTemplate: ItemContent[] = [
  {
    label: 'Note',
    value: '',
    type: 'text',
    isRequired: true,
    isMultiline: true,
  },
];

export const BankAccountTemplate: ItemContent[] = [
  {
    label: 'Account Number',
    value: '',
    type: 'text',
    isRequired: true,
  },
  {
    label: 'Routing Number',
    value: '',
    type: 'text',
    isRequired: true,
  },
  {
    label: 'Bank Name',
    value: '',
    type: 'text',
    isRequired: false,
  },
  {
    label: 'Account Type',
    value: '',
    type: 'text',
    isRequired: false,
  },
];

export const CreditCardTemplate: ItemContent[] = [
  {
    label: 'Card Number',
    value: '',
    type: 'text',
    isRequired: true,
  },
  {
    label: 'Expiration Date',
    value: '',
    type: 'date',
    isRequired: true,
  },
  {
    label: 'CVV',
    value: '',
    type: 'text',
    isRequired: true,
  },
  {
    label: 'Cardholder Name',
    value: '',
    type: 'text',
    isRequired: false,
  },
  {
    label: 'Billing Address',
    value: '',
    type: 'text',
    isMultiline: true,
    isRequired: false,
  },
];

export const IdentityTemplate: ItemContent[] = [
  {
    label: 'First Name',
    value: '',
    type: 'text',
    isRequired: true,
  },
  {
    label: 'Middle Name',
    value: '',
    type: 'text',
    isRequired: false,
  },
  {
    label: 'Last Name',
    value: '',
    type: 'text',
    isRequired: true,
  },
  {
    label: 'Date of Birth',
    value: '',
    type: 'date',
    isRequired: true,
  },
  {
    label: 'Social Security Number',
    value: '',
    type: 'text',
    isRequired: false,
  },
  {
    label: "Driver's License Number",
    value: '',
    type: 'text',
    isRequired: false,
  },
  {
    label: 'Passport Number',
    value: '',
    type: 'text',
    isRequired: false,
  },
  {
    label: 'Address',
    value: '',
    type: 'text',
    isMultiline: true,
    isRequired: false,
  },
  {
    label: 'Phone Number',
    value: '',
    type: 'tel',
    isRequired: false,
  },
  {
    label: 'Email Address',
    value: '',
    type: 'email',
    isRequired: false,
  },
];
