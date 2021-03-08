import React, { FC, useRef } from "react";

import { jVar } from "json-variables";

import { Container, Button, makeStyles } from "@material-ui/core";
import { AppCard, InstanceType, STATUS } from "components/AppCard";

const fs = require("fs");
const config: ConfigProps = JSON.parse(fs.readFileSync("db/config.json", "utf8"));
const serviceConfigTemplate: ServiceProps[] = JSON.parse(fs.readFileSync("db/service-config.json", "utf8"));

const serviceConfig = serviceConfigTemplate.map(
  (service) => jVar({ ...service, ...config }) as ServiceProps & ConfigProps,
);

// const util = require("util");
// const exec = util.promisify(require("child_process").exec);

export interface ConfigProps {
  localPathProfix: string;
}

export interface ServiceProps {
  name: string;
  localPath: string;
  lastDockerBuld: string;
  script: string;
  port: number;
  order: number;
  podName: string;
  group?: string;
}

const DEFAULT_ORDER = 1000;
const getOrder = (order?: number): number => {
  const isset = typeof order === "number";
  return isset ? (order as number) : DEFAULT_ORDER;
};

const useStyles = makeStyles({
  headerActions: {
    display: "flex",
    paddingTop: 40,
    "& > *": {
      marginRight: 20,
    },
  },
});

export const Home: FC = () => {
  const instances = useRef({} as { [key: string]: InstanceType });
  const classes = useStyles();

  const services = serviceConfig
    .filter((service) => Boolean(service.localPath))
    .sort((serviceA, serviceB) => {
      const byOrder = getOrder(serviceA.order) - getOrder(serviceB.order);
      const byPort = serviceA.port - serviceB.port;
      return byOrder === 0 ? byPort : byOrder;
    });

  return (
    <Container maxWidth="lg">
      <div className={classes.headerActions}>
        <Button
          size="small"
          color="primary"
          onClick={() => {
            for (const serviceName in instances.current) {
              const service = instances.current[serviceName];
              if (service?.props?.group === "common") {
                service?.run?.();
              }
            }
          }}
        >
          Run common
        </Button>
        <Button
          size="small"
          color="primary"
          onClick={() => {
            for (const serviceName in instances.current) {
              const service = instances.current[serviceName];
              if (service?.status === STATUS.RUNNNIG) {
                service?.restart?.();
              }
            }
          }}
        >
          Restart runnig
        </Button>
        <Button
          size="small"
          color="primary"
          onClick={() => {
            for (const serviceName in instances.current) {
              const service = instances.current[serviceName];
              if (service?.status === STATUS.RUNNNIG) {
                service?.stop?.();
              }
            }
          }}
        >
          Stop all
        </Button>
      </div>
      {services.map((service) => {
        return (
          <AppCard
            key={service.name}
            getInstance={(instance) => {
              if (!instance?.props?.name) return;
              instances.current[instance?.props?.name] = instance;
            }}
            {...service}
          />
        );
      })}
    </Container>
  );
};
