import { CommandLineIcon, FlagIcon } from '@heroicons/react/24/solid';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

import PopoverTagMobile from '../Popover/PopoverTagMobile';
import TagWithIcon from './TagWithIcon';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';

export const TagSelector = ({
  LIST_TAGS,
  suggested_mode,
  setSuggestedMode,
  setInput,
}: {
  LIST_TAGS: any;
  suggested_mode: string;
  setSuggestedMode: any;
  setInput: any;
}) => {
  /**
   * Trạng thái mobile
   */
  const IS_MOBILE = useIsMobile();
  /**
   * Trạng thái dropdown
   */
  const [show_dropdown, setShowDropdown] = useState(false);

  /**
   *  Hàm click tag
   * @param tag
   * @returns
   */
  const handleTagClick = (tag) => {
    if (tag.type === suggested_mode) {
      setSuggestedMode('');
      setInput((prev) => {
        const regex = new RegExp(`@${tag.type}\\s`);
        return prev.replace(regex, '');
      });
      return;
    }
    /**
     * Set trạng thái tag
     */
    setSuggestedMode(tag.type);
    /**
     * Lưu giá trị input
     */
    if (tag.type !== 'more') {
      setInput((prev) => {
        const regex = /@\w+\s/;
        return regex.test(prev)
          ? prev.replace(regex, `@${tag.type} `)
          : `@${tag.type} ${prev}`;
      });
    }
  };

  /** Tách tag */
  /**  2 tag đầu */
  const VISIBLE_TAGS = LIST_TAGS.slice(0, 2);
  /** 2 tag còn lại */
  const DROPDOWN_TAGS = LIST_TAGS.slice(2, 4);
  /** More tag*/
  const MORE_TAG = LIST_TAGS.find((tag) => tag.type === 'more');

  return (
    <div className="relative">
      <div className="flex flex-row gap-2 py-2 overflow-x-auto">
        {/* Desktop: hiện tất cả */}
        {!IS_MOBILE &&
          LIST_TAGS.map((tag, index) => (
            <TagWithIcon
              key={index}
              type={tag.type}
              label={tag.label}
              onClick={() => handleTagClick(tag)}
              is_active={suggested_mode === tag.type}
            />
          ))}

        {/* Mobile: hiện 2 tag đầu + More */}
        {IS_MOBILE && (
          <div className="flex w-full justify-between gap-2.5">
            {VISIBLE_TAGS.map((tag, index) => (
              <TagWithIcon
                key={index}
                type={tag.type}
                label={tag.label}
                onClick={() => handleTagClick(tag)}
                is_active={suggested_mode === tag.type}
              />
            ))}

            {/* More button */}
            {MORE_TAG && (
              <Popover open={show_dropdown} onOpenChange={setShowDropdown}>
                <PopoverTrigger asChild>
                  {/* <div
                    className={`inline-flex rounded p-1 ${show_dropdown ? 'bg-white text-black' : ''}`}
                  > */}
                  {/* <Bars3BottomLeftIcon className="size-6 cursor-pointer" /> */}
                  <div className="relative">
                    <TagWithIcon
                      type={MORE_TAG.type}
                      label={MORE_TAG.label}
                      onClick={() => setShowDropdown(!show_dropdown)}
                      is_active={show_dropdown}
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-64 h-fit overflow-hidden overflow-y-auto p-2 rounded-3xl border-2 border-zinc-700 ">
                  <div className="flex flex-col gap-2 w-full">
                    {DROPDOWN_TAGS.map((tag, index) => (
                      <div key={index} className="p-2">
                        <div
                          className={`flex gap-2 p-3  border-zinc-700 rounded-xl w-full cursor-pointer hover:bg-zinc-700  ${suggested_mode === tag.type ? 'bg-zinc-700 text-white dark:bg-white dark:text-black font-semibold' : ''}`}
                          onClick={() => {
                            handleTagClick(tag);
                            setShowDropdown(false);
                          }}
                        >
                          <div
                            className={`${suggested_mode === tag.type ? 'text-black' : 'text-zinc-500'} `}
                          >
                            {tag.type === 'business_planner' && (
                              <FlagIcon className="size-6" />
                            )}
                            {tag.type === 'coder' && (
                              <CommandLineIcon className="size-6" />
                            )}
                          </div>
                          <span>{tag.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
