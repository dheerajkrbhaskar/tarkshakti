export type Topic = {
  id: number;
  name: string;
};

export type Subtopic = {
  id: number;
  name: string;
  topic_id: number;
};

export type TopicFilter = {
  topic_id?: number;
};
