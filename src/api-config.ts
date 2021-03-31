const GITLAB_API = "https://gitlab.devops.sbercloud.dev/api/v4";

export const GITLAB_PIPLINES = (projectId: string): string => `${GITLAB_API}/projects/${projectId}/pipelines`;
export const GITLAB_PIPLINE_BY_ID = (projectId: string, piplineId: string | number): string =>
  `${GITLAB_API}/projects/${projectId}/pipelines/${piplineId}`;
