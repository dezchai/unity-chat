import getConversationById from "@/app/actions/getConversationById";
import getMessages from "@/app/actions/getMessages";
import { TranslationServiceClient } from "@google-cloud/translate";
import Header from "./components/Header";
import Body from "./components/Body";
import Form from "./components/Form";
import EmptyState from "@/app/components/EmptyState";
import { translate } from "@vitalets/google-translate-api";
import { Message } from "@prisma/client";
import axios, { isCancel, AxiosError } from "axios";

interface IParams {
  conversationId: string;
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const translateMessage = async (message: any) => {
  // console.log(process.env.TRANSLATE_API_KEY);

  const response = await axios({
    url: "https://api-free.deepl.com/v2/translate",
    method: "POST",
    headers: {
      Authorization: process.env.TRANSLATE_API_KEY,
    },
    data: {
      text: [message.body],
      target_lang: "zh",
    },
  }).catch((err) => {
    console.log(err);
  });
  return {
    ...message,
    body: response.data.translations[0].text, // Modify this as per your actual property name
  };
};

const ChatId = async ({ params }: { params: IParams }) => {
  const conversation = await getConversationById(params.conversationId);
  let messages = await getMessages(params.conversationId);

  const translatedMessagesPromises = messages.map(translateMessage);

  // Wait for all the promises to resolve
  //@ts-ignore
  messages = await Promise.all(translatedMessagesPromises);

  if (!conversation) {
    return (
      <div className="lg:pl-80 h-full">
        <div className="h-full flex flex-col">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="lg:pl-80 h-full">
      <div className="h-full flex flex-col">
        <Header conversation={conversation} />
        <Body initialMessages={messages} />
        <Form />
      </div>
    </div>
  );
};

export default ChatId;
