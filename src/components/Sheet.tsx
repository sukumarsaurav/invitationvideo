import type { ReactNode } from 'react';
import { Drawer } from 'vaul';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
};

/** Bottom sheet on phones (swipe down to close), centred card on larger screens. */
export const Sheet = ({ open, onOpenChange, title, description, children }: Props) => (
  <Drawer.Root open={open} onOpenChange={onOpenChange}>
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 z-40 bg-ink/40" />
      <Drawer.Content
        className="safe-bottom fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-md flex-col rounded-t-[20px] bg-surface outline-none md:bottom-6 md:rounded-[20px]"
        aria-describedby={description ? undefined : undefined}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-border" aria-hidden />
        <div className="px-5 pb-5 pt-3">
          <Drawer.Title className="font-display text-xl font-semibold">{title}</Drawer.Title>
          {description ? <Drawer.Description className="mt-1 text-sm text-muted">{description}</Drawer.Description> : null}
          <div className="mt-4">{children}</div>
        </div>
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>
);
