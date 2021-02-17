import React, { FC, useEffect, useState } from "react";

import find from "find-process";

import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
import { red, green, grey } from "@material-ui/core/colors";

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import Chip from "@material-ui/core/Chip";
import Badge from "@material-ui/core/Badge";

import { ServiceProps } from "containers/Home";

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
});

const STATUS = {
  RUNNNIG: "runnning",
  STOPPED: "stopped",
  LOADING: "loading",
} as const;

type StatusType = typeof STATUS[keyof typeof STATUS];

export const AppCard: FC<ServiceProps> = ({
  name,
  localPath,
  lastDockerBuld,
  script,
  port,
}) => {
  const [status, setStatus] = useState<StatusType>(STATUS.LOADING);
  const [pid, setPid] = useState<number>();
  const classes = useStyles();
  const bull = (
    <span
      className={clsx(classes.bullet, {
        [classes.bulletRun]: status === STATUS.RUNNNIG,
        [classes.bulletStop]: status === STATUS.STOPPED,
      })}
    >
      {status === STATUS.LOADING ? (
        <AutorenewIcon className={classes.animateLoading} />
      ) : (
        "•"
      )}
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

  const runService = async () => {
    setStatus(STATUS.LOADING);
    try {
      exec(`${script} --prefix ${localPath}`);

      const intervalId = setInterval(() => {
        console.log("intervalId: ", intervalId);
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
      // setTimeout(checkPort, 5000);
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

  return (
    <Card className={classes.root}>
      <CardHeader
        classes={{
          title: classes.cardTitle,
        }}
        title={
          <>
            <Chip label={port} size="small" color="primary" />
            <Badge
              badgeContent={`${lastDockerBuld}`}
              classes={{ badge: classes.badge }}
            >
              <span>&nbsp;{name}&nbsp;</span>
            </Badge>
          </>
        }
        subheader={localPath}
        action={bull}
      />
      <CardActions>
        <Button
          disabled={status === STATUS.LOADING}
          size="small"
          color="primary"
          onClick={status === STATUS.RUNNNIG ? stopService : runService}
        >
          {status === STATUS.RUNNNIG ? `Stop` : `Run`}
        </Button>
      </CardActions>
    </Card>
  );
};
