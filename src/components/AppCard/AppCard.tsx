import React, { FC, useEffect, useState, useCallback, useRef } from "react";

import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import find from "find-process";

import clsx from "clsx";
import { ScrollFollow, LazyLog } from "react-lazylog";

import { makeStyles } from "@material-ui/core/styles";
import { red, green, grey, indigo } from "@material-ui/core/colors";
import BrandingWatermarkIcon from "@material-ui/icons/BrandingWatermark";

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import Chip from "@material-ui/core/Chip";
import Badge from "@material-ui/core/Badge";
import IconButton from "@material-ui/core/IconButton";

import { ServiceProps } from "containers/Home";

require("events").EventEmitter.prototype._maxListeners = Infinity;

const util = require("util");
const exec = util.promisify(require("child_process").exec);

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    marginTop: 40,
  },
  bullet: {
    display: "inline-block",
    fontSize: 50,
    lineHeight: "35px",
    marginRight: 10,
    color: grey[300],
  },
  bulletStop: {
    color: red[500],
  },
  bulletRun: {
    color: green[500],
  },
  animateLoading: {
    animation: "spin 1s linear infinite",
  },
  cardTitle: {
    display: "flex",
    alignItems: "center",
    marginBottom: 5,
    marginTop: 5,
  },
  badge: {
    backgroundColor: "#eee",
  },
  cardActionsLeft: {
    flexGrow: 1,
  },
  terminalBtn: {
    color: "#333",
  },
  terminalBtnActive: {
    color: indigo[500],
  },
});

export const STATUS = {
  RUNNNIG: "runnning",
  STOPPED: "stopped",
  LOADING: "loading",
} as const;

export type StatusType = typeof STATUS[keyof typeof STATUS];

export type InstanceType = {
  props?: React.PropsWithChildren<ServiceProps>;
  run?: () => void;
  stop?: () => void;
  restart?: () => void;
  status?: StatusType;
};

export const AppCard: FC<ServiceProps & { getInstance?: (instance: InstanceType) => void }> = (props) => {
  const { name, localPath, script, port, getInstance } = props;
  const [status, setStatus] = useState<StatusType>(STATUS.LOADING);
  const [pid, setPid] = useState<number>();
  const [logs, setLogs] = useState<string>(" ");
  const [viewLogs, setViewLogs] = useState<boolean>(false);
  const [npmRun, setNpmRun] = useState<ChildProcessWithoutNullStreams | undefined>();
  const instance = useRef({} as InstanceType);
  const classes = useStyles();
  const bull = (
    <span
      className={clsx(classes.bullet, {
        [classes.bulletRun]: status === STATUS.RUNNNIG,
        [classes.bulletStop]: status === STATUS.STOPPED,
      })}
    >
      {status === STATUS.LOADING ? <AutorenewIcon className={classes.animateLoading} /> : "•"}
    </span>
  );

  const checkPort = () => {
    find("port", port)
      .then(async (list) => {
        const serviceProcess = list[0];
        if (serviceProcess) {
          setPid(serviceProcess.pid);
          setStatus(STATUS.RUNNNIG);
          return;
        }

        setStatus(STATUS.STOPPED);
      })
      .catch((err) => {
        console.log(err.stack || err);
        setStatus(STATUS.STOPPED);
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

  npmRun?.stdout?.on("data", (nextLogs: string) => setLogs(`${logs}\n${nextLogs}`));
  npmRun?.stderr?.on("data", (nextLogs: string) => setLogs(`${logs}\n${nextLogs}`));
  npmRun?.on("close", (code: string) => {
    setLogs(`${logs}\nchild process exited with code ${code}`);
  });

  const runService = async () => {
    setStatus(STATUS.LOADING);
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
              setStatus(STATUS.RUNNNIG);
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
      setStatus(STATUS.STOPPED);
    }
  };
  const stopService = async () => {
    if (!pid) return;
    setStatus(STATUS.LOADING);
    try {
      await exec(`kill -9 ${pid}`);
      setStatus(STATUS.STOPPED);
    } catch (error) {
      setStatus(STATUS.STOPPED);
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
          </>
        }
        subheader={localPath}
        action={bull}
      />
      <CardActions>
        <div className={classes.cardActionsLeft}>
          <Button
            disabled={status === STATUS.LOADING}
            size="small"
            color="primary"
            onClick={status === STATUS.RUNNNIG ? stopService : runService}
          >
            {status === STATUS.RUNNNIG ? `Stop` : `Run`}
          </Button>
          <Button disabled={status !== STATUS.RUNNNIG} size="small" color="primary" onClick={restart}>
            Restart
          </Button>
        </div>
        <IconButton
          className={clsx(classes.terminalBtn, { [classes.terminalBtnActive]: viewLogs })}
          color="primary"
          onClick={() => {
            setViewLogs(!viewLogs);
          }}
        >
          <BrandingWatermarkIcon fontSize="small" />
        </IconButton>
      </CardActions>
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
    </Card>
  );
};
