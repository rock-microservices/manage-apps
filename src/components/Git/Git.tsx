import { FC, useState, useEffect, useMemo } from "react";
import simpleGit from "simple-git";
import clsx from "clsx";
import { shell } from "electron";

import Chip from "@material-ui/core/Chip";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import CancelIcon from "@material-ui/icons/Cancel";
import TimelapseIcon from "@material-ui/icons/Timelapse";
import { red, green, amber } from "@material-ui/core/colors";

import { GitlabLogo } from "components/icons/GitlabLogo";
import { useFetch } from "helpers/useFetch";
import { TPipeline, TLocalGitInfo } from "types/types";

import * as apiConfig from "api-config";

import { useStyles } from "./styles";

const GITLAB_STATUS_ICONS: { [key: string]: React.ReactElement } = {
  success: <CheckCircleOutlineIcon style={{ color: green[500] }} />,
  failed: <CancelIcon style={{ color: red[500] }} />,
  running: <TimelapseIcon style={{ color: amber[500] }} />,
};

interface IGitProps {
  localPath: string;
  gitlabId?: string;
  gitlabToken: string;
}

export const Git: FC<IGitProps> = ({ localPath, gitlabId, gitlabToken }) => {
  const git = simpleGit({ baseDir: localPath });
  const classes = useStyles();
  const [localGitInfo, setLocalGitInfo] = useState<TLocalGitInfo | null>(null);

  useEffect(() => {
    git.status().then(({ current, files }) => {
      setLocalGitInfo({ current, files } as TLocalGitInfo);
    });
  }, []);

  const [piplines, loadingPiplines, hasErrorPiplines] = gitlabId
    ? useFetch<TPipeline[]>(apiConfig.GITLAB_PIPLINES(gitlabId), {
        headers: {
          "Private-Token": gitlabToken,
        },
      })
    : [];

  const lastPipline = useMemo(() => {
    return piplines?.length ? piplines[0] : null;
  }, [piplines]);

  return (
    <Grid container direction="row" wrap="nowrap">
      <Grid container direction="column">
        <Typography variant="subtitle1">Local</Typography>
        {localGitInfo ? (
          <Grid container direction="column">
            <div className={classes.gitlabInfo}>On {localGitInfo.current} branch. </div>
            <div className={classes.gitlabInfo}>
              {localGitInfo.files.length > 0 ? `Has ${localGitInfo.files.length} files to commit` : ""}
            </div>
          </Grid>
        ) : null}
      </Grid>
      {lastPipline && (
        <Grid container direction="column">
          <Typography variant="subtitle1">CI/CD</Typography>
          <div className={classes.gitlabInfo}>
            <Link
              className={classes.link}
              onClick={() => {
                shell.openExternal(lastPipline.web_url);
              }}
            >
              {lastPipline.ref}
            </Link>
            <Chip
              className={clsx(classes.gitlabChip, {
                [classes.gitlabChipFailed]: lastPipline.status === "failed",
                [classes.gitlabChipRunning]: lastPipline.status === "running",
              })}
              label={lastPipline.status}
              variant="outlined"
              size="small"
              icon={GITLAB_STATUS_ICONS[lastPipline.status]}
            />
            <Link
              className={classes.link}
              onClick={() => {
                shell.openExternal(lastPipline.web_url.replace(/(.+)(\/\d+)$/, "$1"));
              }}
            >
              <GitlabLogo />
            </Link>
          </div>
        </Grid>
      )}
    </Grid>
  );
};
