import { type Category } from '@/lib/types';
import {
  Car,
  Home,
  Landmark,
  type LucideIcon,
  MoreHorizontal,
  ShoppingBag,
  Ticket,
  Utensils,
  HeartPulse,
  Briefcase,
  TrendingUp,
  Gift,
  Zap,
  School,
} from 'lucide-react';

export const categoryIcons: Record<Category, LucideIcon> = {
  Salary: Landmark,
  Food: Utensils,
  Transport: Car,
  Shopping: ShoppingBag,
  Housing: Home,
  Entertainment: Ticket,
  Health: HeartPulse,
  Freelance: Briefcase,
  Investments: TrendingUp,
  Gifts: Gift,
  Utilities: Zap,
  Education: School,
  Other: MoreHorizontal,
};
