import { createContext, useContext } from 'react';

/** Matches invites.admin_role; declaration order is the rank. */
export type AdminRole = 'viewer' | 'support' | 'manager' | 'owner';

const RANK: Record<AdminRole, number> = { viewer: 0, support: 1, manager: 2, owner: 3 };

export const atLeast = (role: AdminRole | null | undefined, min: AdminRole) => (role ? RANK[role] >= RANK[min] : false);

export const ROLE_LABEL: Record<AdminRole, string> = { viewer: 'Viewer', support: 'Support', manager: 'Manager', owner: 'Owner' };

export const AdminContext = createContext<{ role: AdminRole; email: string }>({ role: 'viewer', email: '' });

/** The signed-in admin's role. The database enforces the same rules; this only hides controls. */
export const useAdmin = () => useContext(AdminContext);
