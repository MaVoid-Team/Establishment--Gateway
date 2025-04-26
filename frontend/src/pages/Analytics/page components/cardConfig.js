import { DollarSign, ShoppingCart, CreditCard, ClipboardList, Ticket } from 'lucide-react';

export const cardConfig = [
  {
    key: 'total_sales_contracts_revenue',
    title: 'Total Sales Contracts Revenue',
    icon: DollarSign,
    color: 'text-green-500',
  },
  {
    key: 'total_sales_contracts_value',
    title: 'Total Sales Contracts Value',
    icon: DollarSign,
    color: 'text-yellow-500',
  },
  {
    key: 'total_contract_value_of_all_contracts_except_sales',
    title: 'Total Contracts Value (Excluding Sales)',
    icon: DollarSign,
    color: 'text-blue-500',
  },
  {
    key: 'total_spent_on_orders',
    title: 'Total Orders Expenses',
    icon: ShoppingCart,
    color: 'text-orange-500',
  },
  {
    key: 'total_sales_contracts_amount_to_be_paid',
    title: 'paymentsDue',
    icon: CreditCard,
    color: 'text-purple-500',
  },
  {
    key: 'total_orders',
    title: 'Total Orders',
    icon: ClipboardList,
    color: 'text-pink-500',
    isMonetary: false,
    showDecimals: false
  },
  {
    key: 'total_tickets',
    title: 'Total Tickets',
    icon: Ticket,
    color: 'text-red-500',
    isMonetary: false,
    showDecimals: false
  }
];
