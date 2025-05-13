import {
  BeakerIcon,
  CommandLineIcon,
  FlagIcon,
  IdentificationIcon,
  MegaphoneIcon,
  ViewfinderCircleIcon,
} from '@heroicons/react/24/solid';

import React from 'react';

const TagWithIcon = ({
  type = 'brand-boosting',
  label = 'Brand Boosting',
  className,
  is_active,
  ...props
}: any) => {
  return (
    <div
      onClick={props.onClick}
      className={`flex w-full md:w-fit md:items-center ${type === 'more' ? 'items-center' : ''} flex-col md:flex-row gap-2 p-3 border-2 rounded-[24px] w-fit cursor-pointer border-zinc-700 hover:bg-zinc-700  ${is_active ? 'bg-zinc-700 text-white dark:bg-white dark:text-black font-semibold' : ''}`}
    >
      <div className={`${is_active ? 'text-black' : 'text-zinc-500'} `}>
        {type === 'brand_boosting' && <MegaphoneIcon className="size-6" />}
        {type === 'cv_checker' && <IdentificationIcon className="size-6" />}
        {type === 'business_planner' && <FlagIcon className="size-6" />}
        {type === 'coder' && <CommandLineIcon className="size-6" />}
        {type === 'more' && <ViewfinderCircleIcon className="size-6" />}
      </div>
      <div className={`text-sm flex-shrink-0 w-fit whitespace-nowrap`}>
        {label}
      </div>
    </div>
  );
};

export default TagWithIcon;
