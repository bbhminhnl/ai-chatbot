import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { Bars3BottomLeftIcon } from '@heroicons/react/24/solid';
import { SidebarHistory } from '../sidebar-history';
import { User } from 'next-auth';
import styles from '../GradientCardStatic/GradientCard.module.scss';
import { useState } from 'react';

export default function PopoverTagMobile({ user }: { user?: User }) {
  /** Open */
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={`inline-flex rounded p-1 ${open ? 'bg-white text-black' : ''}`}
        >
          <Bars3BottomLeftIcon className="size-6 cursor-pointer" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-96 mt-2.5 overflow-hidden overflow-y-auto border-2">
        {/* <div className="absolute rotate-45 border-8 border-transparent border-t-background rounded border-l-background top-0 right-24 translate-y-1 transform -translate-x-1/2 z-1"></div> */}
        {/* <SidebarHistory user={user} /> */}
      </PopoverContent>
    </Popover>
  );
}
