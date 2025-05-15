import { gql } from '@apollo/client';

// 模型信息查询
export const GET_MODEL_INFO = gql`
  query ModelInfo {
    modelInfo {
      name
      version
      capabilities
      maxTokens
    }
  }
`;

// 聊天完成变更
export const CHAT_COMPLETION = gql`
  mutation ChatCompletion($messages: [MessageInput!]!) {
    chatCompletion(messages: $messages) {
      id
      message {
        role
        content
        createdAt
      }
      usage {
        promptTokens
        completionTokens
        totalTokens
      }
    }
  }
`;