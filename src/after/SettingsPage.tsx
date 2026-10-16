import { useState } from 'react';
import { InviteDialog } from './InviteDialog';
import { PersonPlusIcon } from './icons';
import styles from './invite.module.css';

const MEMBERS = [
  { id: 1, name: 'Dana Okafor', email: 'dana@example.com', role: 'owner' },
  { id: 2, name: 'Marco Silva', email: 'marco@example.com', role: 'admin' },
  { id: 3, name: 'Priya Raman', email: 'priya@example.com', role: 'member' },
];

export function SettingsPage() {
  const [isInviteOpen, setInviteOpen] = useState(false);
  const [members, setMembers] = useState(MEMBERS);

  function changeRole(id: number, role: string) {
    setMembers((current) => current.map((m) => (m.id === id ? { ...m, role } : m)));
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Workspace settings</h1>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Members</h2>
          <button type="button" className={styles.iconButton} onClick={() => setInviteOpen(true)}>
            <PersonPlusIcon />
          </button>
        </div>

        <ul className={styles.memberList}>
          {members.map((member) => (
            <li key={member.id} className={styles.memberRow}>
              <div>
                <div className={styles.memberName}>{member.name}</div>
                <div className={styles.memberEmail}>{member.email}</div>
              </div>
              {member.role === 'owner' ? (
                <span className={styles.memberRole}>Owner</span>
              ) : (
                <select
                  className={styles.select}
                  aria-label={`Role for ${member.name}`}
                  value={member.role}
                  onChange={(event) => changeRole(member.id, event.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
              )}
            </li>
          ))}
        </ul>
      </section>

      {isInviteOpen && <InviteDialog onClose={() => setInviteOpen(false)} />}
    </div>
  );
}
