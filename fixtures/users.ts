import type { User } from '@/types/entities';

export const INITIAL_USERS: User[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Arjun Kapoor',
    role: 'manager',
    department: 'Engineering',
    avatarInitials: 'AK',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Priya Sharma',
    role: 'hr',
    department: 'People Operations',
    avatarInitials: 'PS',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Rohit Verma',
    role: 'manager',
    department: 'Product',
    avatarInitials: 'RV',
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    name: 'Ananya Deshmukh',
    role: 'manager',
    department: 'Design',
    avatarInitials: 'AD',
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    name: 'Vikram Malhotra',
    role: 'manager',
    department: 'Data & Analytics',
    avatarInitials: 'VM',
  },
];

export const PRIMARY_MANAGER = INITIAL_USERS[0]!;
export const PRIMARY_HR = INITIAL_USERS[1]!;
