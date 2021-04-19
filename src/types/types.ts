import { PROJECT_STATUS } from "constants/projectStatus";

type TService = {
  name: string;
  localPath: string;
  lastDockerBuld: string;
  script: string;
  port: number;
  order: number;
  podName: string;
  group?: string;
  gitlabToken: string;
  gitlabId?: string;
};

type TStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];

type TInstance = {
  props?: React.PropsWithChildren<TService>;
  run?: () => void;
  stop?: () => void;
  restart?: () => void;
  status?: TStatus;
};

type TPipeline = {
  created_at: string;
  id: number;
  ref: string;
  sha: string;
  status: string;
  updated_at: string;
  web_url: string;
};

type TLocalGitInfo = {
  current: string;
  files: Array<unknown>;
};

export type { TService, TStatus, TInstance, TPipeline, TLocalGitInfo };
