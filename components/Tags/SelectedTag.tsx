import {
  ArrowTopRightOnSquareIcon,
  CommandLineIcon,
  FlagIcon,
  IdentificationIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/solid';

import React from 'react';

/**
 * Khai báo interface
 */
interface ITag {
  /**
   * Kiểu dữ liệu
   */
  type: string;
  /**
   * label
   */
  label: string;
  /**
   * fn click
   */
  handleTagClick: any;
  /**
   * cập nhật trạng thái dropdown
   */
  setShowDropdown: any;
  /**
   * dropdown
   */
  show_dropdown: boolean;
  /**suggest đã chọn */
  suggested_mode: string;
}
const SelectedTag = ({
  type,
  label,
  handleTagClick,
  setShowDropdown,
  show_dropdown,
  suggested_mode,
}: ITag) => {
  return (
    <div
      className={`flex gap-2 p-3  justify-between border-zinc-700 rounded-full w-full cursor-pointer hover:bg-zinc-700  ${suggested_mode === type ? 'bg-zinc-700 text-white dark:bg-white dark:text-black font-semibold' : ''}`}
      onClick={() => {
        handleTagClick({ type, label });
        setShowDropdown(false);
      }}
    >
      <div className="flex items-center w-full">
        <div
          className={`${suggested_mode === type ? 'text-black' : 'text-zinc-500'} p-1 `}
        >
          {type === 'brand_boosting' && <MegaphoneIcon className="size-5" />}
          {type === 'cv_checker' && <IdentificationIcon className="size-5" />}
          {type === 'business_planner' && <FlagIcon className="size-5" />}
          {type === 'coder' && <CommandLineIcon className="size-5" />}
        </div>
        <div className="flex gap-x-2 justify-between w-full">
          <span className="text-sm">{label}</span>
          <div className="flex gap-x-1 text-[10px] items-center">
            Khoá học
            <ArrowTopRightOnSquareIcon className="size-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedTag;
