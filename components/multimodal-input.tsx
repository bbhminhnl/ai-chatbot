'use client';

import type { Attachment, UIMessage } from 'ai';
import cx from 'classnames';
import type React from 'react';
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';

import { ArrowUpIcon, PaperclipIcon, StopIcon } from './icons';
import { PreviewAttachment } from './preview-attachment';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { SuggestedActions } from './suggested-actions';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, Tag } from 'lucide-react';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import type { VisibilityType } from './visibility-selector';
import TagWithIcon from './Tags/TagWithIcon';
import {
  ArrowUpCircleIcon,
  MicrophoneIcon,
  PlusCircleIcon,
  ArrowUpIcon as ArrowUpIcon1,
  StopCircleIcon,
} from '@heroicons/react/24/solid';
import ThinkMode from './Tags/ThinkMode';
import styles from './GradientCardStatic/GradientCard.module.scss';
import ListeningLoader from './Listening/ListeningLoader';
import { TagSelector } from './Tags/TagSelector';
import GlowingBox from './GlowingBox/GlowingBox';

/**
 * Khai báo global cho window
 */
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

/** Định nghĩa cho SpeechRecognitionEvent */
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

/** Instance type: đối tượng thực khi gọi new SpeechRecognition() */
interface ISpeechRecognition extends EventTarget {
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
}

/** Constructor type: lớp khởi tạo SpeechRecognition */
interface SpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
  selectedVisibilityType,
}: {
  chatId: string;
  input: UseChatHelpers['input'];
  setInput: UseChatHelpers['setInput'];
  status: UseChatHelpers['status'];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers['setMessages'];
  append: UseChatHelpers['append'];
  handleSubmit: UseChatHelpers['handleSubmit'];
  className?: string;
  selectedVisibilityType: VisibilityType;
}) {
  /** Các suggest tag */
  const LIST_TAGS = [
    {
      label: 'Brand Boosting',
      type: 'brand_boosting',
    },
    {
      label: 'CV Checker',
      type: 'cv_checker',
    },
    {
      label: 'Business Planner',
      type: 'business_planner',
    },
    {
      label: 'Coder',
      type: 'coder',
    },
    {
      label: 'More',
      type: 'more',
    },
  ];
  /** Text area */
  const TEXT_AREA_REF = useRef<HTMLTextAreaElement>(null);
  /** width */
  const { width } = useWindowSize();
  /** Check độ suggested */
  const [suggested_mode, setSuggestedMode] = useState('');
  /** AI Mode */
  const [ai_mode, setAiMode] = useState('');
  /**
   * Tính toán chiều cao của textareas
   */
  useEffect(() => {
    if (TEXT_AREA_REF.current) {
      adjustHeight();
    }
  }, []);

  /**
   * Hàm tính toán chiều cao của textareas
   */
  const adjustHeight = () => {
    if (TEXT_AREA_REF.current) {
      TEXT_AREA_REF.current.style.height = 'auto';
      TEXT_AREA_REF.current.style.height = `${TEXT_AREA_REF.current.scrollHeight + 2}px`;
    }
  };

  /**
   * Hàm reset chiều cao của textareas
   */
  const resetHeight = () => {
    if (TEXT_AREA_REF.current) {
      TEXT_AREA_REF.current.style.height = 'auto';
      TEXT_AREA_REF.current.style.height = '98px';
    }
  };
  /**
   * Lay gia tri input tu localStorage
   */
  const [local_storage_input, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );
  /**
   * Lay gia tri input tu localStorage
   */
  useEffect(() => {
    if (TEXT_AREA_REF.current) {
      /** DOM value */
      const DOM_VALUE = TEXT_AREA_REF.current.value;
      /** Prefer DOM value over localStorage to handle hydration */
      const FINAL_VALUE = DOM_VALUE || local_storage_input || '';
      /** Lưu lại input */
      setInput(FINAL_VALUE);
      /** Tính toán lại chiều cao */
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Lay gia tri input tu localStorage
   */
  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  /**
   *  Hàm handle input
   * @param event
   */
  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    /**
     * Lưu giá trị input
     */
    setInput(event.target.value);
    /** tính toán lại chiều cao */
    adjustHeight();
  };

  /**
   * INput ref
   */
  const FILE_INPUT_REF = useRef<HTMLInputElement>(null);
  /**
   * Update queue
   */
  const [upload_queue, setUploadQueue] = useState<Array<string>>([]);

  /**
   * Hàm submit form
   */
  const submitForm = useCallback(() => {
    /**
     * Thêm id chat với url
     */
    window.history.replaceState({}, '', `/chat/${chatId}`);
    /**
     * Thêm attachment với url
     */
    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });
    /**
     * Reset attachment
     */
    setAttachments([]);
    setLocalStorageInput('');
    resetHeight();
    /**
     * Focus text area
     */
    if (width && width > 768) {
      TEXT_AREA_REF.current?.focus();
    }
  }, [
    attachments,
    handleSubmit,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
  ]);

  /**
   *  Hàm Upload file
   * @param file File
   * @returns
   */
  const uploadFile = async (file: File) => {
    /** Thêm file với FormData */
    const FORM_DATA = new FormData();
    /**
     * Thêm file với FormData
     */
    FORM_DATA.append('file', file);
    /**
     * Call API Upload
     */
    try {
      const RES = await fetch('/api/files/upload', {
        method: 'POST',
        body: FORM_DATA,
      });
      /**
       * Nếu call api thanh cong
       */
      if (RES.ok) {
        /** Parse data */
        const DATA = await RES.json();
        /**
         * Lay url, pathname, contentType
         */
        const { url, pathname, contentType } = DATA;
        /**
         * Tra ve attachment
         */
        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      const { error } = await RES.json();
      /** Hiện toast lỗi */
      toast.error(error);
    } catch (error) {
      toast.error('Failed to upload file, please try again!');
    }
  };
  /**
   * Hàm handle file change
   */
  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      /**
       * Lay danh sach file
       */
      const FILES = Array.from(event.target.files || []);
      /**
       * Thêm file với queue
       */
      setUploadQueue(FILES.map((file) => file.name));

      try {
        /** Upload Promise */
        const UPLOAD_PROMISE = FILES.map((file) => uploadFile(file));
        /**
         * Lay danh sach attachment
         */
        const UPLOADED_ATTACHMENTS = await Promise.all(UPLOAD_PROMISE);
        /**
         * Lay attachment khong bi loi
         */
        const SUCCESSFULLY_ATTACHMENTS = UPLOADED_ATTACHMENTS.filter(
          (attachment) => attachment !== undefined,
        );
        /**
         * Lưu vào state
         */
        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...SUCCESSFULLY_ATTACHMENTS,
        ]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );
  /**
   * Hàm scroll to bottom
   */
  const { isAtBottom: IS_AT_BOTTOM, scrollToBottom } = useScrollToBottom();
  /**
   * Hàm scroll to bottom khi submit
   */
  useEffect(() => {
    if (status === 'submitted') {
      scrollToBottom();
    }
  }, [status, scrollToBottom]);
  /** Trạng thái đang bật micro */
  const [is_listening, setIsListening] = useState(false);
  /**Ref */
  const RECOGNITION_REF = useRef<ISpeechRecognition | null>(null);

  console.log(RECOGNITION_REF, 'RECOGNITION_REF');

  useEffect(() => {
    /**
     * Khai báo SpeechRecognition
     */
    const SPEECH_RECOGNITION =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    /**
     * Khai báo SpeechRecognition
     */
    if (!SPEECH_RECOGNITION) {
      alert('Trình duyệt không hỗ trợ SpeechRecognition.');
      return;
    }
    /**
     * Khai báo SpeechRecognition
     */
    const RECOGNITION = new SPEECH_RECOGNITION();
    /** Ngôn ngữ */
    RECOGNITION.lang = 'vi-VN';
    /**
     * Trạng thái nghe
     */
    RECOGNITION.continuous = false;
    /**
     * Trạng thái dừng
     */
    RECOGNITION.interimResults = false;

    /**
     *  Hàm onresult
     * @param event - Sự kiện onresult
     */
    RECOGNITION.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript); // Lưu kết quả vào input
      setIsListening(false);
    };
    /**
     *  Hàm onend
     */
    RECOGNITION.onend = () => {
      setIsListening(false); // Dừng trạng thái "đang nghe"
    };

    RECOGNITION_REF.current = RECOGNITION;
  }, []);

  return (
    <div className="relative flex w-full flex-col bg-transparent ">
      <AnimatePresence>
        {!IS_AT_BOTTOM && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute left-1/2 bottom-28 -translate-x-1/2 z-50"
          >
            <Button
              data-testid="scroll-to-bottom-button"
              className="rounded-full"
              size="icon"
              variant="outline"
              onClick={(event) => {
                event.preventDefault();
                scrollToBottom();
              }}
            >
              <ArrowDown />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* {messages.length === 0 &&
        attachments.length === 0 &&
        uploadQueue.length === 0 && (
          <SuggestedActions
            append={append}
            chatId={chatId}
            selectedVisibilityType={selectedVisibilityType}
          />
        )} */}

      {/** Smart prompts suggestions */}

      <TagSelector
        LIST_TAGS={LIST_TAGS}
        suggested_mode={suggested_mode}
        setSuggestedMode={setSuggestedMode}
        setInput={setInput}
        is_conversation={messages.length > 0}
      />

      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={FILE_INPUT_REF}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {(attachments.length > 0 || upload_queue.length > 0) && (
        <div
          data-testid="attachments-preview"
          className="flex flex-row gap-2 overflow-x-scroll items-end"
        >
          {attachments.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}

          {upload_queue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: '',
                name: filename,
                contentType: '',
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}
      <GlowingBox>
        {/* <div className="flex justify-center items-center z-20"> */}
        {/* <div className={`w-full ${styles.card}`}> */}
        <Textarea
          data-testid="multimodal-input"
          ref={TEXT_AREA_REF}
          placeholder="Send a message..."
          value={input}
          onChange={handleInput}
          className={cx(
            'min-h-6 max-h-[calc(75dvh)] relative z-10 overflow-hidden resize-none rounded-2xl !text-base bg-muted pb-14 border-none dark:border-zinc-700 dark:bg-zinc-950 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring-0 focus-visible:ring-offset-0',
            className,
          )}
          rows={2}
          autoFocus
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();

              if (status !== 'ready') {
                toast.error(
                  'Please wait for the model to finish its response!',
                );
              } else {
                submitForm();
              }
            }
          }}
        />

        <div className="absolute bottom-3 left-3 w-fit flex items-center gap-2 flex-row justify-start rounded-full z-10">
          <AttachmentsButton fileInputRef={FILE_INPUT_REF} status={status} />

          <ThinkMode
            onClick={() => setAiMode('think')}
            is_active={ai_mode === 'think'}
          />
        </div>

        <div className="absolute bottom-3 right-3 rounded-full w-fit flex flex-row justify-end z-10">
          {!input && status !== 'submitted' ? (
            <div
              onClick={() => {
                /**
                 * Nếu dang nghe thi dung, nguoc lai bat dau nghe
                 */
                // if (is_listening) {
                //   RECOGNITION_REF.current?.stop(); // Dừng và sẽ kích hoạt .onresult
                // } else {
                //   RECOGNITION_REF.current?.start(); // Bắt đầu nghe
                //   setIsListening(true);
                // }
              }}
              className="p-2 bg-white rounded-full cursor-pointer"
            >
              {is_listening ? (
                <ListeningLoader />
              ) : (
                <MicrophoneIcon className="size-5 text-black" />
              )}
            </div>
          ) : (
            <div>
              {status === 'submitted' ? (
                // <StopButton stop={stop} setMessages={setMessages} />
                <div className="p-2 bg-zinc-500 text-black rounded-full cursor-pointer">
                  {/* <StopCircleIcon className="size-5 text-black" /> */}
                  <ArrowUpIcon
                    size={20}
                    // className="size-5 text-black"
                  />
                </div>
              ) : (
                // <SendButton
                //   input={input}
                //   submitForm={submitForm}
                //   uploadQueue={upload_queue}
                // />
                <button
                  disabled={input.length === 0 || upload_queue.length > 0}
                  // submitForm={submitForm}
                  onClick={(event) => {
                    event.preventDefault();
                    submitForm();
                  }}
                  // uploadQueue={upload_queue}
                  className="p-2 bg-white text-black rounded-full cursor-pointer"
                >
                  <ArrowUpIcon
                    size={20}
                    // className="size-5 text-black flex-shrink-0"
                  />
                </button>
              )}
            </div>
          )}
        </div>
      </GlowingBox>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.status !== nextProps.status) return false;
    if (!equal(prevProps.attachments, nextProps.attachments)) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;

    return true;
  },
);

function PureAttachmentsButton({
  fileInputRef,
  status,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  status: UseChatHelpers['status'];
}) {
  return (
    <Button
      data-testid="attachments-button"
      className="rounded-full p-2 h-fit border-2 dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200"
      onClick={(event) => {
        event.preventDefault();
        fileInputRef.current?.click();
      }}
      disabled={status !== 'ready'}
      variant="ghost"
    >
      <PlusCircleIcon className="size-5" />
    </Button>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: UseChatHelpers['setMessages'];
}) {
  return (
    <Button
      data-testid="stop-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => messages);
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
  uploadQueue,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}) {
  return (
    <Button
      data-testid="send-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={input.length === 0 || uploadQueue.length > 0}
    >
      <ArrowUpIcon size={20} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
    return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});
