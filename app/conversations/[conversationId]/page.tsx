import getConversationById from "@/app/actions/getConversationById";
import getMessages from "@/app/actions/getMessages";
import Header from "./components/Header";
import Body from "./components/Body";
import Form from "./components/Form";
import EmptyState from "@/app/components/EmptyState";
import { Message } from "@prisma/client";
import axios, { isCancel, AxiosError } from "axios";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { cookies } from "next/headers";
import {
  setCookie,
  getCookie,
  getCookies,
  deleteCookie,
  hasCookie,
} from "cookies-next";
interface IParams {
  conversationId: string;
}

const translateMessage = async (message: any) => {
  const currentUser = await getCurrentUser();
  //@ts-ignore
  const targetLanguage = getCookie("language", { cookies }) || "en";
  //@ts-ignore
  if (message.senderId == currentUser.id) {
    return message;
  }
  const response = await axios({
    url: "https://api-free.deepl.com/v2/translate",
    method: "POST",
    headers: {
      Authorization: process.env.TRANSLATE_API_KEY,
    },
    data: {
      text: [message.body],
      target_lang: targetLanguage,
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
  // let messages = await getMessages(params.conversationId);

  // const translatedMessagesPromises = messages.map(translateMessage);

  // messages = await Promise.all(translatedMessagesPromises);
  let messages = await getMessages(params.conversationId);

  // Create an array to store the translated messages
  let translatedMessages = [];

  // Use a for...of loop to iterate over the messages
  for (let message of messages) {
    const translatedMessage = await translateMessage(message);
    translatedMessages.push(translatedMessage);
  }

  // Use the translated messages
  messages = translatedMessages;
  
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
