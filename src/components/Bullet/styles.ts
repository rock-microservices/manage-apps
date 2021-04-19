import { makeStyles } from "@material-ui/core/styles";

import { red, green, amber, grey, indigo } from "@material-ui/core/colors";

const useStyles = makeStyles({
  bullet: {
    display: "inline-block",
    fontSize: 50,
    lineHeight: "35px",
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
});

export { useStyles };
