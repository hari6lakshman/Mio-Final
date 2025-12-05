export type Message = {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string | React.ReactNode;
};
