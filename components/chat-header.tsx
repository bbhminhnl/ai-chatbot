'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';

import { ModelSelector } from '@/components/model-selector';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { PlusIcon, VercelIcon } from './icons';
import { useSidebar } from './ui/sidebar';
import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { type VisibilityType, VisibilitySelector } from './visibility-selector';
import type { Session } from 'next-auth';
import Image from 'next/image';
import {
  Bars2Icon,
  Bars3BottomLeftIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/solid';
import { ArrowDown } from 'lucide-react';
import PopoverHistory from './Popover/PopoverHistory';
import PopoverSetup from './Popover/PopoverSetup';
import PopoverHistoryBar2 from './Popover/PopoverHistoryBar2';
import { SidebarToggleCustom } from './sidebar-toggle-custom';

import { usePathname } from 'next/navigation';

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  session,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
}) {
  /** Router */
  const ROUTER = useRouter();
  /** Path_name */
  const PATH_NAME = usePathname();
  /** Chat page */
  const IS_CHAT_PAGE = PATH_NAME.startsWith('/chat/');

  /** Trạng thái đóng mở */
  const { open } = useSidebar();
  /** Width của window */
  const { width: windowWidth } = useWindowSize();

  return (
    <header className="flex sticky top-0 bg-background py-3 px-3 items-center justify-between md:px-8 gap-2">
      <div className="">
        <div className="hidden md:flex md:w-40">
          <Image
            src="/images/retion-agent.svg"
            alt="Retion Logo"
            width={32}
            height={32}
          />
        </div>
        <div className="md:hidden">
          {/* <PopoverHistoryBar2 user={session.user} /> */}
          {/* <Bars2Icon className="size-6" /> */}
          <SidebarToggleCustom />
        </div>
      </div>

      {/* {!isReadonly && (
        <ModelSelector
          session={session}
          selectedModelId={selectedModelId}
          className=""
        />
      )} */}
      <div className="flex gap-2 items-center">
        <div className="bg-green-500 rounded-full size-2.5" />
        <h4 className="text-lg font-semibold">Terminal</h4>
        <ChevronRightIcon className="size-4 text-gray-500" />
      </div>

      {/* {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          className="order-1 md:order-3"
        />
      )} */}

      <div className="flex gap-5 items-center">
        {/* {(!open || windowWidth < 768) && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="md:px-2 px-2 md:h-fit ml-auto md:ml-0"
                onClick={() => {
                  router.push('/');
                  router.refresh();
                }}
              >
                <PencilSquareIcon className="size-6" />
                <span className="md:sr-only">New Chat</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>New Chat</TooltipContent>
          </Tooltip>
        )} */}
        {/* biome-ignore lint/nursery/noStaticElementInteractions: <explanation> */}
        {
          <div
            onClick={() => {
              ROUTER.push('/');
              ROUTER.refresh();
            }}
            className={`${!IS_CHAT_PAGE ? 'hidden' : 'flex'} cursor-pointer md:flex p-2`}
          >
            <PencilSquareIcon className="size-6" />
          </div>
        }

        <div className="hidden md:flex cursor-pointer">
          <PopoverHistory user={session.user} />
        </div>
        <div
          className={`${IS_CHAT_PAGE ? 'hidden' : 'flex'} cursor-pointer md:flex`}
        >
          <PopoverSetup user={session.user} />
        </div>
      </div>

      {/* <Button
        className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-900 hidden md:flex py-1.5 px-2 h-fit md:h-[34px] order-4 md:ml-auto"
        asChild
      >
        <Link
          href={`https://vercel.com/new/clone?repository-url=https://github.com/vercel/ai-chatbot&env=AUTH_SECRET&envDescription=Learn more about how to get the API Keys for the application&envLink=https://github.com/vercel/ai-chatbot/blob/main/.env.example&demo-title=AI Chatbot&demo-description=An Open-Source AI Chatbot Template Built With Next.js and the AI SDK by Vercel.&demo-url=https://chat.vercel.ai&products=[{"type":"integration","protocol":"ai","productSlug":"grok","integrationSlug":"xai"},{"type":"integration","protocol":"storage","productSlug":"neon","integrationSlug":"neon"},{"type":"blob"}]`}
          target="_noblank"
        >
          <VercelIcon size={16} />
          Deploy with Vercel
        </Link>
      </Button> */}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
