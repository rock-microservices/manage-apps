import clsx from "clsx";

import AutorenewIcon from "@material-ui/icons/Autorenew";

import { PROJECT_STATUS } from "constants/projectStatus";

import { useStyles } from "./styles";

interface IBulletProps {
  status: string;
}

export const Bullet: React.FC<IBulletProps> = ({ status }) => {
  const classes = useStyles();

  return (
    <span
      className={clsx(classes.bullet, {
        [classes.bulletRun]: status === PROJECT_STATUS.RUNNNIG,
        [classes.bulletStop]: status === PROJECT_STATUS.STOPPED,
      })}
    >
      {status === PROJECT_STATUS.LOADING ? <AutorenewIcon className={classes.animateLoading} /> : "•"}
    </span>
  );
};
