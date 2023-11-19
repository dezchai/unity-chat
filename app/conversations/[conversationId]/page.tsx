import getConversationById from "@/app/actions/getConversationById";
import getMessages from "@/app/actions/getMessages";
import { TranslationServiceClient } from "@google-cloud/translate";
import Header from "./components/Header";
import Body from "./components/Body";
import Form from "./components/Form";
import EmptyState from "@/app/components/EmptyState";

interface IParams {
  conversationId: string;
}
const translationClient = new TranslationServiceClient({
  key: process.env.TRANSLATE_API_KEY,
});

async function translateMessages(
  messages: Message[],
  targetLang: string
): Promise<Message[]> {
  const requests = messages.map((message) => {
    if (message.body) {
      return translationClient
        .translateText({
          content: message.body,
          targetLanguageCode: targetLang,
          mimeType: "text/plain", // mime types: text/plain, text/html
        })
        .then((response) => {
          const translation = response[0].translations[0].translatedText;
          return { ...message, body: translation };
        });
    } else {
      return Promise.resolve(message);
    }
  });

  const translatedMessages = await Promise.all(requests);
  return translatedMessages;
}
const ChatId = async ({ params }: { params: IParams }) => {
  const conversation = await getConversationById(params.conversationId);
  const messages = await getMessages(params.conversationId);

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
