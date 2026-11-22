import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title, description, icon: Icon = Inbox, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={24} />
      </div>
      <strong>{title}</strong>
      <span>{description}</span>
      {action && <div style={{ marginTop: '14px' }}>{action}</div>}
    </div>
  );
}
