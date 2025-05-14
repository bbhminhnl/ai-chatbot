import {
  ArrowTopRightOnSquareIcon,
  CommandLineIcon,
  FlagIcon,
  IdentificationIcon,
  MegaphoneIcon,
  ShareIcon,
  ViewfinderCircleIcon,
} from '@heroicons/react/24/solid';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

import { Select } from '@radix-ui/react-select';
import SelectedTag from './SelectedTag';
import TagWithIcon from './TagWithIcon';
import { useIsMobile } from '@/hooks/use-mobile-custom';
import { useState } from 'react';

/**
 * Tách tag
 */
type ITag = {
  /**
   * Label tag
   */
  label: string;
  /**
   * Type tag
   */
  type: string;
};
export const TagSelector = ({
  LIST_TAGS,
  suggested_mode,
  setSuggestedMode,
  setInput,
  is_conversation = false,
}: {
  /**
   * List tag
   */
  LIST_TAGS: ITag[];
  /**
   * Trạng thái tag
   */
  suggested_mode: string;
  /**
   * Hàm set trạng thái tag
   */
  setSuggestedMode: any;
  /**
   * Hàm set giá trị input
   */
  setInput: (input: string | any) => void;

  /**
   * Trạng thái conversation
   */
  is_conversation?: boolean;
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
   * Kiem tra trang thai mobile
   */
  if (IS_MOBILE === null) return null;

  /**
   *  Hàm click tag
   * @param tag
   * @returns
   */
  const handleTagClick = (tag: ITag) => {
    /**
     * Nếu tag.type === suggested_mode thì reset trạgn thái
     */
    if (tag.type === suggested_mode) {
      setSuggestedMode('');
      setInput((prev: any) => {
        /** Kiểm tra regex */
        const REGEX = new RegExp(`@${tag.type}\\s`);
        return prev.replace(REGEX, '');
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
      setInput((prev: string) => {
        /**
         * Khai báo regex
         */
        const REGEX = /@\w+\s/;
        /**
         * Kiem tra regex
         */
        return REGEX.test(prev)
          ? prev.replace(REGEX, `@${tag.type} `)
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
  /** Tags selected */
  const SELECTED_TAGS = LIST_TAGS.filter((tag) => suggested_mode === tag.type);

  /** Tags not selected */
  const NOT_SELECTED_TAGS = LIST_TAGS.filter(
    (tag) => suggested_mode !== tag.type && tag.type !== 'more',
  );

  return (
    <div className="relative">
      {is_conversation ? (
        <div className="flex flex-row gap-2 py-2 overflow-x-auto">
          {SELECTED_TAGS.map((tag, index) => (
            <div key={index} className="p-0 w-full md:w-[250px]">
              <SelectedTag
                type={tag.type}
                label={tag.label}
                handleTagClick={handleTagClick}
                setShowDropdown={setShowDropdown}
                show_dropdown={show_dropdown}
                suggested_mode={suggested_mode}
              />
            </div>
          ))}

          {suggested_mode && suggested_mode !== 'more' && MORE_TAG && (
            <div className="p-0">
              <Popover open={show_dropdown} onOpenChange={setShowDropdown}>
                <PopoverTrigger asChild>
                  <div
                    className={`flex gap-2 p-3 w-fit justify-between items-center  rounded-full cursor-pointer border-2 border-zinc-700 hover:bg-zinc-700  ${show_dropdown ? 'text-white dark:bg-white dark:text-black font-semibold' : ''}`}
                    onClick={() => {
                      // handleTagClick(MORE_TAG);
                      setShowDropdown(true);
                    }}
                  >
                    <div className="flex items-center w-full h-7 gap-2">
                      <div
                        className={`${show_dropdown ? 'text-black' : 'text-zinc-500'} flex items-center`}
                      >
                        <ViewfinderCircleIcon className="size-5" />
                      </div>
                      <div className="flex gap-x-2 justify-between w-full">
                        <span className="text-sm">{MORE_TAG.label}</span>
                      </div>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-64 h-fit overflow-hidden overflow-y-auto p-2 rounded-3xl border-2 border-zinc-700 ">
                  <div className="flex flex-col gap-2 w-full">
                    {NOT_SELECTED_TAGS.map((tag, index) => (
                      <div key={index} className="p-2">
                        <div
                          className={`flex gap-2 p-3 border-zinc-700 rounded-xl w-full cursor-pointer hover:bg-zinc-700  ${suggested_mode === tag.type ? 'bg-zinc-700 text-white dark:bg-white dark:text-black font-semibold' : ''}`}
                          onClick={() => {
                            handleTagClick(tag);
                            setShowDropdown(false);
                          }}
                        >
                          <div
                            className={`${suggested_mode === tag.type ? 'text-black' : 'text-zinc-500'} `}
                          >
                            {tag.type === 'brand_boosting' && (
                              <MegaphoneIcon className="size-5" />
                            )}
                            {tag.type === 'cv_checker' && (
                              <IdentificationIcon className="size-5" />
                            )}
                            {tag.type === 'business_planner' && (
                              <FlagIcon className="size-5" />
                            )}
                            {tag.type === 'coder' && (
                              <CommandLineIcon className="size-5" />
                            )}
                          </div>
                          <span>{tag.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      ) : (
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
      )}
    </div>
  );
};
