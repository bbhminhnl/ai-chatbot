'use client';

import type { Attachment, UIMessage } from 'ai';
import { fetcher, generateUUID } from '@/lib/utils';
import { useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';

import { Artifact } from './artifact';
import { ChatHeader } from '@/components/chat-header';
import GradientCardStatic from './GradientCardStatic/GradientCardStatic';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';
import type { Session } from 'next-auth';
import type { VisibilityType } from './visibility-selector';
import type { Vote } from '@/lib/db/schema';
import { getChatHistoryPaginationKey } from './sidebar-history';
import styles from './GradientCardStatic/GradientCard.module.scss';
import { toast } from './toast';
import { unstable_serialize } from 'swr/infinite';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { useChat } from '@ai-sdk/react';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { useSearchParams } from 'next/navigation';

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  session,
  autoResume,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
}) {
  const { mutate } = useSWRConfig();

  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
    experimental_resume,
  } = useChat({
    id,
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    experimental_prepareRequestBody: (body) => ({
      id,
      message: body.messages.at(-1),
      selectedChatModel: initialChatModel,
      selectedVisibilityType: visibilityType,
    }),
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    onError: (error) => {
      toast({
        type: 'error',
        description: error.message,
      });
    },
  });

  useEffect(() => {
    if (autoResume) {
      experimental_resume();
    }

    // note: this hook has no dependencies since it only needs to run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /** Search Params */
  const SEARCH_PARAMS = useSearchParams();
  /**  Lấy query */
  const QUERY = SEARCH_PARAMS.get('query');
  /**
   * Kiểm tra có query không
   */
  const [has_appended_query, setHasAppendedQuery] = useState(false);
  /**
   * Nếu co query thi append
   * @param QUERY
   */
  useEffect(() => {
    if (QUERY && !has_appended_query) {
      append({
        role: 'user',
        content: QUERY,
      });
      /**
       * Đánh dấu là đã append
       */
      setHasAppendedQuery(true);
      /** Đối với id chat, thay đổi điều hướng trang */
      window.history.replaceState({}, '', `/chat/${id}`);
    }
  }, [QUERY, append, has_appended_query, id]);
  /**
   * Lay danh sach vote
   */
  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher,
  );
  /**
   * Lay danh sach attachment
   */
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  /**
   * Lấy trạng thái của artifact
   */
  const IS_ARTIFACT_VISIBLE = useArtifactSelector((state) => state.isVisible);

  return (
    <div>
      <div className="flex flex-col h-dvh">
        <ChatHeader
          chatId={id}
          selectedModelId={initialChatModel}
          selectedVisibilityType={initialVisibilityType}
          isReadonly={isReadonly}
          session={session}
        />

        <div className=" flex flex-col md:items-center md:justify-center justify-between flex-grow min-h-0">
          <Messages
            chatId={id}
            status={status}
            votes={votes}
            messages={messages}
            setMessages={setMessages}
            reload={reload}
            isReadonly={isReadonly}
            isArtifactVisible={IS_ARTIFACT_VISIBLE}
          />
          <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
            {!isReadonly && (
              <MultimodalInput
                chatId={id}
                input={input}
                setInput={setInput}
                handleSubmit={handleSubmit}
                status={status}
                stop={stop}
                attachments={attachments}
                setAttachments={setAttachments}
                messages={messages}
                setMessages={setMessages}
                append={append}
                selectedVisibilityType={visibilityType}
              />
            )}
          </form>
        </div>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
        selectedVisibilityType={visibilityType}
      />
    </div>
  );
}
