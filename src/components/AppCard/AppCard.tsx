import { FC, useEffect, useCallback, useState, useMemo, useRef } from "react";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import find from "find-process";
import { ScrollFollow, LazyLog } from "react-lazylog";

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import Chip from "@material-ui/core/Chip";
import MemoryIcon from "@material-ui/icons/Memory";

import { Git } from "components/Git";
import { Bullet } from "components/Bullet";
import pidusage, { Stat } from "helpers/pidusage";
import { sizeFormatter } from "helpers/sizeFormatter";
import { PROJECT_STATUS } from "constants/projectStatus";
import { TService, TInstance, TStatus } from "types/types";

import { useStyles } from "./styles";

require("events").EventEmitter.prototype._maxListeners = Infinity;

const util = require("util");
const exec = util.promisify(require("child_process").exec);

export const AppCard: FC<TService & { getInstance?: (instance: TInstance) => void }> = (props) => {
  const { name, localPath, script, port, getInstance, gitlabId, gitlabToken } = props;
  const [status, setStatus] = useState<TStatus>(PROJECT_STATUS.LOADING);
  const [pid, setPid] = useState<number>();
  const [pidStats, setPidStats] = useState<Stat>();
  const [logs, setLogs] = useState<string>(" ");
  const [viewLogs, setViewLogs] = useState<boolean>(false);
  const [npmRun, setNpmRun] = useState<ChildProcessWithoutNullStreams | undefined>();
  const instance = useRef({} as TInstance);
  const classes = useStyles();

  const compute = async (pid: number) => {
    const stats = await pidusage(pid);
    setPidStats(stats as Stat);
  };

  const interval = useCallback(
    async (time: number, startTime?: number) => {
      if (!pid || status !== PROJECT_STATUS.RUNNNIG) return;
      setTimeout(async () => {
        try {
          await compute(pid);
          interval(time);
        } catch (error) {}
      }, startTime || time);
    },
    [pid, status],
  );

  useEffect(() => {
    if (!pid || status !== PROJECT_STATUS.RUNNNIG) return;
    interval(5000, 300);
  }, [pid, status]);

  const checkPort = () => {
    find("port", port)
      .then(async (list) => {
        const serviceProcess = list[0];
        if (serviceProcess) {
          setPid(serviceProcess.pid);
          setStatus(PROJECT_STATUS.RUNNNIG);
          return;
        }

        setStatus(PROJECT_STATUS.STOPPED);
      })
      .catch((err) => {
        console.log(err.stack || err);
        setStatus(PROJECT_STATUS.STOPPED);
      });
  };

  useEffect(checkPort, []);

  useEffect(() => {
    if (!instance) return;
    instance.current = {
      props,
      run: runService,
      stop: stopService,
      restart,
      status,
    };
    getInstance?.(instance.current);
  }, [status]);

  const runService = async () => {
    setStatus(PROJECT_STATUS.LOADING);
    try {
      const [cmd, ...args] = script.split(" ");
      const run = spawn(cmd, args, { cwd: localPath });
      setNpmRun(run);

      const intervalId = setInterval(() => {
        find("port", port)
          .then(async (list) => {
            const serviceProcess = list[0];
            if (serviceProcess) {
              setPid(serviceProcess.pid);
              setStatus(PROJECT_STATUS.RUNNNIG);
              clearInterval(intervalId);
              return;
            }
          })
          .catch((err) => {
            console.log(err.stack || err);
            clearInterval(intervalId);
          });
      }, 1000);
    } catch (error) {
      setStatus(PROJECT_STATUS.STOPPED);
    }
  };

  const stopService = async () => {
    if (!pid) return;
    setStatus(PROJECT_STATUS.LOADING);
    try {
      await exec(`kill -9 ${pid}`);
      setStatus(PROJECT_STATUS.STOPPED);
    } catch (error) {
      setStatus(PROJECT_STATUS.STOPPED);
    }
  };

  const restart = () => {
    (async () => {
      await stopService();
      runService();
    })();
  };

  return (
    <Card className={classes.root}>
      <CardHeader
        classes={{
          title: classes.cardTitle,
        }}
        title={
          <>
            <Chip label={port} size="small" color="primary" />
            <span>&nbsp;{name}&nbsp;</span>
            {status === PROJECT_STATUS.RUNNNIG && pidStats && (
              <Chip
                icon={<MemoryIcon />}
                label={
                  <>
                    <span>{typeof pidStats?.cpu === "number" ? `${Math.round(pidStats?.cpu)}% CPU` : ``}</span>
                    &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                    <span>{typeof pidStats?.memory === "number" ? sizeFormatter(pidStats?.memory) : ``}</span>
                  </>
                }
                size="small"
                variant="outlined"
                color="primary"
              />
            )}
          </>
        }
        subheader={localPath}
        action={<Bullet status={status} />}
      />
      <CardContent>
        <Git localPath={localPath} gitlabId={gitlabId} gitlabToken={gitlabToken} />
        {viewLogs && (
          <div style={{ height: 500 }}>
            <ScrollFollow
              startFollowing
              render={({ onScroll, follow }) => {
                // console.log("onScroll, follow: ", onScroll, follow);
                return (
                  <LazyLog
                    extraLines={1}
                    enableSearch
                    text={logs}
                    stream
                    //eslint-disable-next-line
                    // @ts-ignore
                    onScroll={onScroll}
                    follow={follow}
                  />
                );
              }}
            />
          </div>
        )}
      </CardContent>
      <CardActions>
        <div className={classes.cardActionsLeft}>
          <Button
            disabled={status === PROJECT_STATUS.LOADING}
            size="small"
            color="primary"
            variant="outlined"
            onClick={status === PROJECT_STATUS.RUNNNIG ? stopService : runService}
          >
            {status === PROJECT_STATUS.RUNNNIG ? `Stop` : `Run`}
          </Button>
          <Button
            variant="outlined"
            disabled={status !== PROJECT_STATUS.RUNNNIG}
            size="small"
            color="primary"
            onClick={restart}
          >
            Restart
          </Button>
        </div>
        {/* <IconButton
          className={clsx(classes.terminalBtn, { [classes.terminalBtnActive]: viewLogs })}
          color="primary"
          onClick={() => {
            setViewLogs(!viewLogs);
          }}
        >
          <BrandingWatermarkIcon fontSize="small" />
        </IconButton> */}
      </CardActions>
    </Card>
  );
};
