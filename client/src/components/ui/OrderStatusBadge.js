// client/src/components/ui/OrderStatusBadge.js
import React from 'react';

const OrderStatusBadge = ({ status }) => {
  let bgColor = 'bg-gray-600';
  let textColor = 'text-white';
  let label = 'Nieznany';

  switch (status) {
    case 'pending':
      bgColor = 'bg-yellow-600';
      textColor = 'text-yellow-100';
      label = 'Oczekujące';
      break;
    case 'inProgress':
      bgColor = 'bg-blue-600';
      textColor = 'text-blue-100';
      label = 'W trakcie';
      break;
    case 'completed':
      bgColor = 'bg-green-600';
      textColor = 'text-green-100';
      label = 'Ukończone';
      break;
    case 'cancelled':
      bgColor = 'bg-red-600';
      textColor = 'text-red-100';
      label = 'Anulowane';
      break;
    case 'dispute':
      bgColor = 'bg-orange-600';
      textColor = 'text-orange-100';
      label = 'Spór';
      break;
    default:
      break;
  }

  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
};

export default OrderStatusBadge;