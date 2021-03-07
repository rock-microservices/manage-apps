import React, { FC } from "react";

import { jVar } from "json-variables";

import Container from "@material-ui/core/Container";
import { AppCard } from "components/AppCard";

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
}

const DEFAULT_ORDER = 1000;
const getOrder = (order?: number): number => {
  const isset = typeof order === "number";
  return isset ? (order as number) : DEFAULT_ORDER;
};

export const Home: FC = () => {
  const services = serviceConfig
    .filter((service) => Boolean(service.localPath))
    .sort((serviceA, serviceB) => {
      const byOrder = getOrder(serviceA.order) - getOrder(serviceB.order);
      const byPort = serviceA.port - serviceB.port;
      return byOrder === 0 ? byPort : byOrder;
    });

  return (
    <Container maxWidth="lg">
      {services.map((service) => {
        return <AppCard key={service.name} {...service} />;
      })}
    </Container>
  );
};
